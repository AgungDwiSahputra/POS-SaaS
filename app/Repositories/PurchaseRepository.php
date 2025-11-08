<?php

namespace App\Repositories;

use App\Models\ManageStock;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\StockMovement;
use Exception;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class PurchaseRepository
 */
class PurchaseRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'date',
        'reference_code',
        'tax_rate',
        'tax_amount',
        'discount',
        'shipping',
        'grand_total',
        'received_amount',
        'paid_amount',
        'payment_type',
        'notes',
        'created_at',
    ];

    /**
     * @var string[]
     */
    protected $allowedFields = [
        'date',
        'tax_rate',
        'tax_amount',
        'discount',
        'shipping',
        'grand_total',
        'received_amount',
        'notes',
    ];

    /**
     * Return searchable fields
     */
    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    /**
     * Configure the Model
     **/
    public function model(): string
    {
        return Purchase::class;
    }

    public function storePurchase($input)
    {
        try {
            DB::beginTransaction();
            foreach ($input['purchase_items'] as $purchase_items) {
                if ($purchase_items['quantity'] == 0) {
                    throw new UnprocessableEntityHttpException('Please Enter Attlist One Quantity.');
                }
            }

            // Siapkan stok awal per produk (sebelum penambahan) untuk perhitungan HPP rata-rata tertimbang
            $initialQtyByProduct = [];
            $initialHppByProduct = [];
            $uniqueProductIds = collect($input['purchase_items'])->pluck('product_id')->unique();
            foreach ($uniqueProductIds as $pid) {
                $initialQtyByProduct[$pid] = ManageStock::where('product_id', $pid)->sum('quantity');
                $product = Product::find($pid);
                $initialHppByProduct[$pid] = (float) ($product->hpp ?? 0);
            }

            $purchaseInputArray = Arr::only($input, [
                'supplier_id',
                'warehouse_id',
                'date',
                'tax_rate',
                'tax_amount',
                'discount',
                'shipping',
                'grand_total',
                'received_amount',
                'paid_amount',
                'partial_amount',
                'payment_type',
                'payment_status',
                'notes',
                'status',
            ]);

            /** @var Purchase $purchase */
            $purchase = Purchase::create($purchaseInputArray);

            $purchase = $this->storePurchaseItems($purchase, $input);

            // Kumpulkan total qty & biaya pembelian per produk pada transaksi ini
            $purchasedQty = [];
            $purchasedCost = [];
            foreach ($purchase->purchaseItems as $pItem) {
                $pid = $pItem->product_id;
                $purchasedQty[$pid] = ($purchasedQty[$pid] ?? 0) + $pItem->quantity;
                $purchasedCost[$pid] = ($purchasedCost[$pid] ?? 0) + $pItem->sub_total; // sub_total sudah net of tax sesuai jenis pajak
            }

            // Tambahkan biaya shipping secara proporsional ke setiap produk
            $shippingCost = (float) ($input['shipping'] ?? 0);
            if ($shippingCost > 0 && count($purchasedCost) > 0) {
                $totalSubTotal = array_sum($purchasedCost);
                foreach ($purchasedCost as $pid => $cost) {
                    // Alokasi shipping proporsional berdasarkan nilai subtotal
                    $shippingAllocation = $shippingCost * ($cost / $totalSubTotal);
                    $purchasedCost[$pid] += $shippingAllocation;
                }
            }

            // manage stock
            foreach ($input['purchase_items'] as $purchaseItem) {
                manageStock($input['warehouse_id'], $purchaseItem['product_id'], $purchaseItem['quantity']);
            }

            // Update HPP rata-rata tertimbang per produk (Weighted Average Cost)
            foreach ($uniqueProductIds as $pid) {
                $oldQty = (float) ($initialQtyByProduct[$pid] ?? 0);
                $oldHpp = (float) ($initialHppByProduct[$pid] ?? 0);
                $addedQty = (float) ($purchasedQty[$pid] ?? 0);
                $addedCost = (float) ($purchasedCost[$pid] ?? 0);
                $totalQty = $oldQty + $addedQty;
                
                if ($totalQty <= 0) {
                    continue; // tidak ada stok, lewati
                }

                // Hitung total nilai lama dan tambahkan biaya baru
                $oldTotalValue = $oldQty * $oldHpp;
                $newTotalValue = $oldTotalValue + $addedCost;
                
                // HPP baru = Total Nilai / Total Quantity
                $newHpp = $newTotalValue / $totalQty;

                /** @var Product $prod */
                $prod = Product::find($pid);
                $oldHppValue = $prod->hpp;
                $prod->update(['hpp' => (int) round($newHpp)]);
                
                // Log perubahan HPP untuk debugging
                Log::info("HPP Updated for Product {$pid}", [
                    'old_qty' => $oldQty,
                    'old_hpp' => $oldHpp,
                    'old_total_value' => $oldTotalValue,
                    'added_qty' => $addedQty,
                    'added_cost' => $addedCost,
                    'new_qty' => $totalQty,
                    'new_hpp' => $newHpp,
                    'rounded_hpp' => (int) round($newHpp)
                ]);

                // Create stock movement record for HPP change
                try {
                    StockMovement::createMovement([
                        'product_id' => $pid,
                        'warehouse_id' => $input['warehouse_id'],
                        'quantity' => $addedQty,
                        'type' => StockMovement::TYPE_PURCHASE,
                        'reference_type' => 'purchase',
                        'reference_id' => $purchase->id,
                        'old_hpp' => $oldHppValue,
                        'new_hpp' => (int) round($newHpp),
                        'notes' => "HPP updated from purchase {$purchase->reference_code}"
                    ]);
                } catch (\Exception $e) {
                    Log::error("Failed to create stock movement record for HPP change: " . $e->getMessage());
                }
            }

            DB::commit();

            return $purchase;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return mixed
     */
    public function calculationPurchaseItems($purchaseItem)
    {
        $validator = Validator::make($purchaseItem, PurchaseItem::$rules);
        if ($validator->fails()) {
            throw new UnprocessableEntityHttpException($validator->errors()->first());
        }

        //discount calculation
        $perItemDiscountAmount = 0;
        $purchaseItem['net_unit_cost'] = $purchaseItem['product_cost'];
        if ($purchaseItem['discount_type'] == Purchase::PERCENTAGE) {
            if ($purchaseItem['discount_value'] <= 100 && $purchaseItem['discount_value'] >= 0) {
                $purchaseItem['discount_amount'] = ($purchaseItem['discount_value'] * $purchaseItem['product_cost'] / 100) * $purchaseItem['quantity'];
                $perItemDiscountAmount = $purchaseItem['discount_amount'] / $purchaseItem['quantity'];
                $purchaseItem['net_unit_cost'] -= $perItemDiscountAmount;
            } else {
                throw new UnprocessableEntityHttpException('Please enter discount value between 0 to 100.');
            }
        } elseif ($purchaseItem['discount_type'] == Purchase::FIXED) {
            if ($purchaseItem['discount_value'] <= $purchaseItem['product_cost'] && $purchaseItem['discount_value'] >= 0) {
                $purchaseItem['discount_amount'] = $purchaseItem['discount_value'] * $purchaseItem['quantity'];
                $perItemDiscountAmount = $purchaseItem['discount_amount'] / $purchaseItem['quantity'];
                $purchaseItem['net_unit_cost'] -= $perItemDiscountAmount;
            } else {
                throw new UnprocessableEntityHttpException("Please enter  discount's value between product's price.");
            }
        }
        //tax calculation
        $perItemTaxAmount = 0;
        if ($purchaseItem['tax_value'] <= 100 && $purchaseItem['tax_value'] >= 0) {
            if ($purchaseItem['tax_type'] == Purchase::EXCLUSIVE) {
                $purchaseItem['tax_amount'] = (($purchaseItem['net_unit_cost'] * $purchaseItem['tax_value']) / 100) * $purchaseItem['quantity'];
                $perItemTaxAmount = $purchaseItem['tax_amount'] / $purchaseItem['quantity'];
            } elseif ($purchaseItem['tax_type'] == Purchase::INCLUSIVE) {
                $purchaseItem['tax_amount'] = ($purchaseItem['net_unit_cost'] * $purchaseItem['tax_value']) / (100 + $purchaseItem['tax_value']) * $purchaseItem['quantity'];
                $perItemTaxAmount = $purchaseItem['tax_amount'] / $purchaseItem['quantity'];
                $purchaseItem['net_unit_cost'] -= $perItemTaxAmount;
            }
        } else {
            throw new UnprocessableEntityHttpException('Please enter tax value between 0 to 100 ');
        }
        $purchaseItem['sub_total'] = ($purchaseItem['net_unit_cost'] + $perItemTaxAmount) * $purchaseItem['quantity'];

        return $purchaseItem;
    }

    /**
     * @return mixed
     */
    public function storePurchaseItems($purchase, $input)
    {
        foreach ($input['purchase_items'] as $purchaseItem) {
            $items = $this->calculationPurchaseItems($purchaseItem);
            $purchaseItem = new PurchaseItem($items);
            $purchase->purchaseItems()->save($purchaseItem);
        }

        $subTotalAmount = $purchase->purchaseItems()->sum('sub_total');
        if ($input['discount'] <= $subTotalAmount) {
            $input['grand_total'] = $subTotalAmount - $input['discount'];
        } else {
            throw new UnprocessableEntityHttpException('Discount amount should not be greater than total.');
        }
        if ($input['tax_rate'] <= 100 && $input['tax_rate'] >= 0) {
            $input['tax_amount'] = $input['grand_total'] * $input['tax_rate'] / 100;
        } else {
            throw new UnprocessableEntityHttpException('Please enter tax value between 0 to 100.');
        }
        $input['grand_total'] = $input['grand_total'] + $input['tax_amount'];
        if ($input['shipping'] <= $input['grand_total'] && $input['shipping'] >= 0) {
            $input['grand_total'] += $input['shipping'];
        } else {
            throw new UnprocessableEntityHttpException(__('messages.error.shipping_amount_not_be_greater'));
        }

        $input['reference_code'] = getSettingValue('purchase_code') . '_111' . $purchase->id;
        $purchase->update($input);

        return $purchase;
    }

    /**
     * @return mixed
     */
    public function updatePurchase($input, $id)
    {
        try {
            DB::beginTransaction();
            foreach ($input['purchase_items'] as $purchase_items) {
                if ($purchase_items['quantity'] == 0) {
                    throw new UnprocessableEntityHttpException('Please Enter Attlist One Quantity.');
                }
            }
            $purchase = Purchase::findOrFail($id);

            // Pre-calc data untuk HPP: kondisi sebelum perubahan
            $oldItems = PurchaseItem::wherePurchaseId($id)->get();
            $oldTotalsQty = [];
            $oldTotalsCost = [];
            foreach ($oldItems as $oi) {
                $pid = $oi->product_id;
                $oldTotalsQty[$pid] = ($oldTotalsQty[$pid] ?? 0) + $oi->quantity;
                $oldTotalsCost[$pid] = ($oldTotalsCost[$pid] ?? 0) + $oi->sub_total;
            }

            // Totals baru berdasarkan input (gunakan kalkulasi yang sama)
            $newTotalsQty = [];
            $newTotalsCost = [];
            foreach ($input['purchase_items'] as $pi) {
                $calc = $this->calculationPurchaseItems($pi);
                $pid = $calc['product_id'];
                $newTotalsQty[$pid] = ($newTotalsQty[$pid] ?? 0) + $calc['quantity'];
                $newTotalsCost[$pid] = ($newTotalsCost[$pid] ?? 0) + $calc['sub_total'];
            }

            // Tambahkan biaya shipping lama dan baru secara proporsional
            $oldShipping = (float) ($purchase->shipping ?? 0);
            $newShipping = (float) ($input['shipping'] ?? 0);
            
            // Alokasi shipping lama
            if ($oldShipping > 0 && count($oldTotalsCost) > 0) {
                $totalOldSubTotal = array_sum($oldTotalsCost);
                foreach ($oldTotalsCost as $pid => $cost) {
                    $oldShippingAllocation = $oldShipping * ($cost / $totalOldSubTotal);
                    $oldTotalsCost[$pid] += $oldShippingAllocation;
                }
            }
            
            // Alokasi shipping baru
            if ($newShipping > 0 && count($newTotalsCost) > 0) {
                $totalNewSubTotal = array_sum($newTotalsCost);
                foreach ($newTotalsCost as $pid => $cost) {
                    $newShippingAllocation = $newShipping * ($cost / $totalNewSubTotal);
                    $newTotalsCost[$pid] += $newShippingAllocation;
                }
            }

            $affectedProductIds = collect(array_unique(array_merge(array_keys($oldTotalsQty), array_keys($newTotalsQty))))->values();
            $initialStockByProduct = [];
            $initialHppByProduct = [];
            foreach ($affectedProductIds as $pid) {
                $initialStockByProduct[$pid] = (float) ManageStock::where('product_id', $pid)->sum('quantity');
                $initialHppByProduct[$pid] = (float) optional(\App\Models\Product::find($pid))->hpp ?? 0.0;
            }
            $purchaseItemIds = PurchaseItem::wherePurchaseId($id)->pluck('id')->toArray();
            $purchaseItmOldIds = [];
            foreach ($input['purchase_items'] as $key => $purchaseItem) {
                //get different ids & update
                $purchaseItmOldIds[$key] = $purchaseItem['purchase_item_id'];
                $purchaseItemArr = Arr::only($purchaseItem, [
                    'purchase_item_id',
                    'product_id',
                    'product_cost',
                    'net_unit_cost',
                    'tax_type',
                    'tax_value',
                    'tax_amount',
                    'discount_type',
                    'discount_value',
                    'discount_amount',
                    'purchase_unit',
                    'quantity',
                    'sub_total',
                ]);
                $this->updateItem($purchaseItemArr, $input['warehouse_id']);
                //create new product items
                if (is_null($purchaseItem['purchase_item_id'])) {
                    $purchaseItem = $this->calculationPurchaseItems($purchaseItem);
                    $purchaseItemArr = Arr::only($purchaseItem, [
                        'purchase_item_id',
                        'product_id',
                        'product_cost',
                        'net_unit_cost',
                        'tax_type',
                        'tax_value',
                        'tax_amount',
                        'discount_type',
                        'discount_value',
                        'discount_amount',
                        'purchase_unit',
                        'quantity',
                        'sub_total',
                    ]);
                    $purchase->purchaseItems()->create($purchaseItemArr);
                    // manage new product
                    manageStock($input['warehouse_id'], $purchaseItem['product_id'], $purchaseItem['quantity']);
                }
            }
            $removeItemIds = array_diff($purchaseItemIds, $purchaseItmOldIds);
            //delete remove product
            if (! empty(array_values($removeItemIds))) {
                foreach ($removeItemIds as $removeItemId) {
                    // remove quantity manage storage
                    $oldProduct = PurchaseItem::whereId($removeItemId)->first();
                    $productQuantity = ManageStock::whereWarehouseId($input['warehouse_id'])->whereProductId($oldProduct->product_id)->first();
                    if ($productQuantity && $oldProduct) {
                        if ($oldProduct->quantity <= $productQuantity->quantity) {
                            $productQuantity->update([
                                'quantity' => $productQuantity->quantity - $oldProduct->quantity,
                            ]);
                        }
                    } else {
                        throw new UnprocessableEntityHttpException('Quantity must be less than Available quantity.');
                    }
                }
                PurchaseItem::whereIn('id', array_values($removeItemIds))->delete();
            }
            $purchase = $this->updatePurchaseCalculation($input, $id);
            // Update HPP (moving average) dengan delta pembelian per produk
            foreach ($affectedProductIds as $pid) {
                $oldQtyStock = (float) ($initialStockByProduct[$pid] ?? 0);
                $oldHpp = (float) ($initialHppByProduct[$pid] ?? 0);
                $oldQty = (float) ($oldTotalsQty[$pid] ?? 0);
                $newQty = (float) ($newTotalsQty[$pid] ?? 0);
                $oldCost = (float) ($oldTotalsCost[$pid] ?? 0);
                $newCost = (float) ($newTotalsCost[$pid] ?? 0);

                // Hitung delta quantity dan cost
                $deltaQty = $newQty - $oldQty;
                $deltaCost = $newCost - $oldCost;
                
                // Total quantity setelah perubahan
                $totalQty = $oldQtyStock + $deltaQty;
                
                if ($totalQty <= 0) {
                    continue;
                }

                // Hitung HPP baru menggunakan Weighted Average
                $oldTotalValue = $oldQtyStock * $oldHpp;
                $newTotalValue = $oldTotalValue + $deltaCost;
                $newHpp = $newTotalValue / $totalQty;
                
                $product = \App\Models\Product::find($pid);
                $oldHppValue = $product->hpp;
                \App\Models\Product::where('id', $pid)->update(['hpp' => (int) round($newHpp)]);
                
                // Log perubahan HPP untuk debugging
                Log::info("HPP Updated for Product {$pid} (Purchase Update)", [
                    'old_stock_qty' => $oldQtyStock,
                    'old_hpp' => $oldHpp,
                    'old_total_value' => $oldTotalValue,
                    'delta_qty' => $deltaQty,
                    'delta_cost' => $deltaCost,
                    'new_total_qty' => $totalQty,
                    'new_total_value' => $newTotalValue,
                    'new_hpp' => $newHpp,
                    'rounded_hpp' => (int) round($newHpp)
                ]);

                // Create stock movement record for HPP change
                try {
                    StockMovement::createMovement([
                        'product_id' => $pid,
                        'warehouse_id' => $input['warehouse_id'],
                        'quantity' => $deltaQty,
                        'type' => StockMovement::TYPE_PURCHASE_RETURN, // Using return type for negative delta
                        'reference_type' => 'purchase_update',
                        'reference_id' => $id,
                        'old_hpp' => $oldHppValue,
                        'new_hpp' => (int) round($newHpp),
                        'notes' => "HPP updated from purchase update {$id}"
                    ]);
                } catch (\Exception $e) {
                    Log::error("Failed to create stock movement record for HPP change: " . $e->getMessage());
                }
            }
            DB::commit();

            return $purchase;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return mixed
     */
    public function updatePurchaseCalculation($input, $id)
    {
        $purchase = Purchase::findOrFail($id);
        $subTotalAmount = $purchase->purchaseItems()->sum('sub_total');

        if ($input['discount'] > $subTotalAmount || $input['discount'] < 0) {
            throw new UnprocessableEntityHttpException('Discount amount should not be greater than total.');
        }
        $input['grand_total'] = $subTotalAmount - $input['discount'];
        if ($input['tax_rate'] > 100 || $input['tax_rate'] < 0) {
            throw new UnprocessableEntityHttpException('Please enter tax value between 0 to 100.');
        }
        $input['tax_amount'] = $input['grand_total'] * $input['tax_rate'] / 100;

        $input['grand_total'] += $input['tax_amount'];

        if ($input['shipping'] > $input['grand_total'] || $input['shipping'] < 0) {
            throw new UnprocessableEntityHttpException(__('messages.error.shipping_amount_not_be_greater'));
        }

        $input['grand_total'] += $input['shipping'];

        $purchaseInputArray = Arr::only($input, [
            'supplier_id',
            'warehouse_id',
            'date',
            'tax_rate',
            'tax_amount',
            'discount',
            'shipping',
            'grand_total',
            'received_amount',
            'paid_amount',
            'partial_amount',
            'payment_type',
            'notes',
            'status',
            'payment_status',
        ]);
        $purchase->update($purchaseInputArray);

        return $purchase;
    }

    public function updateItem($purchaseItem, $warehouseId): bool
    {
        try {
            $purchaseItem = $this->calculationPurchaseItems($purchaseItem);
            $item = PurchaseItem::whereId($purchaseItem['purchase_item_id']);
            // update stock manage
            $product = ManageStock::whereWarehouseId($warehouseId)->whereProductId($purchaseItem['product_id'])->first();
            $oldItem = PurchaseItem::whereId($purchaseItem['purchase_item_id'])->first();
            $totalQuantity = 0;
            if ($product && $oldItem && $oldItem->quantity != $purchaseItem['quantity']) {
                if ($oldItem->quantity > $purchaseItem['quantity']) {
                    $totalQuantity = $product->quantity - ($oldItem->quantity - $purchaseItem['quantity']);
                } elseif ($oldItem->quantity < $purchaseItem['quantity']) {
                    $totalQuantity = $product->quantity + ($purchaseItem['quantity'] - $oldItem->quantity);
                }
                $product->update([
                    'quantity' => $totalQuantity,
                ]);
            }

            unset($purchaseItem['purchase_item_id']);
            $item->update($purchaseItem);

            return true;
        } catch (Exception $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }
}
