<?php

namespace App\Repositories;

use App\Models\ManageStock;
use App\Models\Product;
use App\Models\Transfer;
use App\Models\TransferItem;
use Exception;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class TransferRepository
 */
class TransferRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'date',
        'tax_rate',
        'tax_amount',
        'discount',
        'shipping',
        'grand_total',
        'note',
        'created_at',
        'reference_code',
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
        'note',
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
        return Transfer::class;
    }

    /**
     * @return mixed
     */
    public function storeTransfer($input)
    {
        try {
            DB::beginTransaction();

            $input['date'] = $input['date'] ?? date('Y/m/d');
            $TransferInputArray = Arr::only($input, [
                'from_warehouse_id', 'to_warehouse_id', 'tax_rate', 'tax_amount', 'discount', 'shipping', 'grand_total',
                'note', 'date', 'status',
            ]);

            /** @var Transfer $transfer */
            $transfer = Transfer::create($TransferInputArray);
            $transfer = $this->storeTransferItems($transfer, $input);

            // HPP: alokasikan biaya shipping (jika ada) ke HPP global produk secara proporsional qty transfer
            $shipping = (float) ($input['shipping'] ?? 0);
            if ($transfer->status == Transfer::COMPLETED && $shipping > 0) {
                $items = $transfer->transferItems;
                $totalQtyMoved = max(0.0, (float) $items->sum('quantity'));
                if ($totalQtyMoved > 0) {
                    // Hitung per produk
                    $perProductQty = [];
                    foreach ($items as $it) {
                        $perProductQty[$it->product_id] = ($perProductQty[$it->product_id] ?? 0) + (float) $it->quantity;
                    }
                    foreach ($perProductQty as $pid => $qtyMoved) {
                        /** @var Product $prod */
                        $prod = Product::find($pid);
                        if (! $prod) { continue; }
                        $oldQtyTotal = (float) ManageStock::where('product_id', $pid)->sum('quantity');
                        if ($oldQtyTotal <= 0) { continue; }
                        $oldHpp = (float) ($prod->hpp ?? 0);
                        $alloc = $shipping * ($qtyMoved / $totalQtyMoved);
                        $newHpp = (($oldQtyTotal * $oldHpp) + $alloc) / $oldQtyTotal;
                        $prod->update(['hpp' => (int) round($newHpp)]);
                    }
                }
            }

            // HPP: Revaluasi dengan harga transfer line bila toggle aktif
            if ($transfer->status == Transfer::COMPLETED && (int) (getSettingValue('transfer_line_revalue_hpp') ?? 0) === 1) {
                $items = $transfer->transferItems;
                if ($items && $items->count() > 0) {
                    // Kelompokkan qty dan biaya line per produk
                    $qtyByProduct = [];
                    $amountByProduct = [];
                    foreach ($items as $it) {
                        $pid = $it->product_id;
                        $qtyByProduct[$pid] = ($qtyByProduct[$pid] ?? 0) + (float) $it->quantity;
                        $amountByProduct[$pid] = ($amountByProduct[$pid] ?? 0) + (float) $it->sub_total;
                    }
                    foreach ($qtyByProduct as $pid => $movedQty) {
                        /** @var Product $prod */
                        $prod = Product::find($pid);
                        if (! $prod) { continue; }
                        $totalQty = (float) ManageStock::where('product_id', $pid)->sum('quantity');
                        if ($totalQty <= 0) { continue; }
                        $oldHpp = (float) ($prod->hpp ?? 0);
                        $lineAmount = (float) ($amountByProduct[$pid] ?? 0);
                        // Delta biaya terhadap HPP lama atas qty yang dipindah
                        $delta = $lineAmount - ($oldHpp * $movedQty);
                        $newHpp = (($totalQty * $oldHpp) + $delta) / $totalQty;
                        $prod->update(['hpp' => (int) round($newHpp)]);
                    }
                }
            }

            DB::commit();

            return $transfer;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return mixed
     */
    public function storeTransferItems($transfer, $input)
    {
        foreach ($input['transfer_items'] as $transferItem) {
            $product = ManageStock::whereWarehouseId($input['from_warehouse_id'])->whereProductId($transferItem['product_id'])->first();

            if ($product) {
                if ($transferItem['quantity'] > $product->quantity) {
                    throw new UnprocessableEntityHttpException('Quantity should not be greater than available quantity.');
                } else {
                    if ((int) ($transfer->status ?? 0) == Transfer::COMPLETED) {
                        // Tambah ke gudang tujuan
                        manageStock($input['to_warehouse_id'], $transferItem['product_id'], $transferItem['quantity']);
                        // Kurangi dari gudang asal (gunakan helper untuk konsistensi & guard terhadap negatif)
                        manageStock($input['from_warehouse_id'], $transferItem['product_id'], -$transferItem['quantity']);
                    }
                }
            } else {
                throw new UnprocessableEntityHttpException('Product stock is not available in selected warehouse.');
            }

            $item = $this->calculationTransferItems($transferItem);
            $transferItem = new TransferItem($item);
            $transfer->transferItems()->save($transferItem);
        }

        $subTotalAmount = $transfer->transferItems()->sum('sub_total');

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
        $input['grand_total'] += $input['tax_amount'];
        if ($input['shipping'] <= $input['grand_total'] && $input['shipping'] >= 0) {
            $input['grand_total'] += $input['shipping'];
        } else {
            throw new UnprocessableEntityHttpException(__('messages.error.shipping_amount_not_be_greater'));
        }

        $input['reference_code'] = 'TR_111'.$transfer->id;
        $transfer->update($input);

        return $transfer;
    }

    /**
     * @return mixed
     */
    public function calculationTransferItems($transferItem)
    {
        $validator = Validator::make($transferItem, TransferItem::$rules);
        if ($validator->fails()) {
            throw new UnprocessableEntityHttpException($validator->errors()->first());
        }

        //discount calculation
        $perItemDiscountAmount = 0;
        // Gunakan harga dasar dari input yang diedit user jika tersedia
        $basePrice = $transferItem['product_price']
            ?? ($transferItem['net_unit_cost'] ?? ($transferItem['product_cost'] ?? 0));
        $transferItem['product_price'] = $basePrice; // pastikan terset untuk penyimpanan
        $transferItem['net_unit_price'] = $basePrice;
        if ($transferItem['discount_type'] == Transfer::PERCENTAGE) {
            if ($transferItem['discount_value'] <= 100 && $transferItem['discount_value'] >= 0) {
                $transferItem['discount_amount'] = ($transferItem['discount_value'] * $transferItem['product_price'] / 100) * $transferItem['quantity'];
                $perItemDiscountAmount = $transferItem['discount_amount'] / $transferItem['quantity'];
                $transferItem['net_unit_price'] -= $perItemDiscountAmount;
            } else {
                throw new UnprocessableEntityHttpException('Please enter discount value between 0 to 100.');
            }
        } elseif ($transferItem['discount_type'] == Transfer::FIXED) {
            if ($transferItem['discount_value'] <= $transferItem['product_price'] && $transferItem['discount_value'] >= 0) {
                $transferItem['discount_amount'] = $transferItem['discount_value'] * $transferItem['quantity'];
                $perItemDiscountAmount = $transferItem['discount_amount'] / $transferItem['quantity'];
                $transferItem['net_unit_price'] -= $perItemDiscountAmount;
            } else {
                throw new UnprocessableEntityHttpException("Please enter  discount's value between product's price.");
            }
        }

        //tax calculation
        $perItemTaxAmount = 0;
        if ($transferItem['tax_value'] <= 100 && $transferItem['tax_value'] >= 0) {
            if ($transferItem['tax_type'] == Transfer::EXCLUSIVE) {
                $transferItem['tax_amount'] = (($transferItem['net_unit_price'] * $transferItem['tax_value']) / 100) * $transferItem['quantity'];
                $perItemTaxAmount = $transferItem['tax_amount'] / $transferItem['quantity'];
            } elseif ($transferItem['tax_type'] == Transfer::INCLUSIVE) {
                $transferItem['tax_amount'] = ($transferItem['net_unit_price'] * $transferItem['tax_value']) / (100 + $transferItem['tax_value']) * $transferItem['quantity'];
                $perItemTaxAmount = $transferItem['tax_amount'] / $transferItem['quantity'];
                $transferItem['net_unit_price'] -= $perItemTaxAmount;
            }
        } else {
            throw new UnprocessableEntityHttpException('Please enter tax value between 0 to 100 ');
        }
        $transferItem['sub_total'] = ($transferItem['net_unit_price'] + $perItemTaxAmount) * $transferItem['quantity'];

        return $transferItem;
    }

    /**
     * @return mixed
     */
    public function updateTransfer($input, $id)
    {
        try {
            DB::beginTransaction();

            $transfer = Transfer::findOrFail($id);
            $oldShipping = (float) ($transfer->shipping ?? 0);
            $oldStatus = (int) ($transfer->status ?? 0);

            // Siapkan agregat lama utk revaluasi line price bila toggle aktif
            $oldQtyByProduct = [];
            $oldAmountByProduct = [];
            if ((int) (getSettingValue('transfer_line_revalue_hpp') ?? 0) === 1) {
                $oldItems = TransferItem::whereTransferId($id)->get();
                foreach ($oldItems as $it) {
                    $pid = $it->product_id;
                    $oldQtyByProduct[$pid] = ($oldQtyByProduct[$pid] ?? 0) + (float) $it->quantity;
                    $oldAmountByProduct[$pid] = ($oldAmountByProduct[$pid] ?? 0) + (float) $it->sub_total;
                }
            }

            $transferItemOldIds = TransferItem::whereTransferId($id)->pluck('id')->toArray();
            $transferItemNewIds = [];

            foreach ($input['transfer_items'] as $key => $transferItem) {
                $transferItemNewIds[$key] = $transferItem['transfer_item_id'];

                $transferItemArray = Arr::only($transferItem, [
                    'transfer_item_id', 'product_id', 'product_price', 'net_unit_price', 'tax_type', 'tax_value',
                    'tax_amount', 'discount_type', 'discount_value', 'discount_amount', 'quantity',
                    'sub_total',
                ]);

                if (! is_null($transferItem['transfer_item_id'])) {
                    // Update stok hanya jika status lama Completed
                    if ($oldStatus == Transfer::COMPLETED) {
                        $this->updateItem($transferItemArray, $transfer->from_warehouse_id, $transfer->to_warehouse_id);
                    } else {
                        // Hitung ulang nilai item tanpa menyentuh stok
                        $transferItemArray = $this->calculationTransferItems($transferItemArray);
                        // net_unit_cost bukan kolom tabel; pastikan tidak ikut ter-update
                        TransferItem::whereId($transferItemArray['transfer_item_id'])->update(
                            Arr::except($transferItemArray, ['transfer_item_id', 'net_unit_cost'])
                        );
                    }
                }

                if (is_null($transferItem['transfer_item_id'])) {
                    $product = ManageStock::whereWarehouseId($transfer->from_warehouse_id)->whereProductId($transferItem['product_id'])->first();

                    if ($product) {
                        if ($transferItem['quantity'] > $product->quantity) {
                            throw new UnprocessableEntityHttpException('Quantity should not be greater than available quantity.');
                        } else {
                            if ($oldStatus == Transfer::COMPLETED) {
                                // Tambah ke gudang tujuan
                                manageStock($transfer->to_warehouse_id, $transferItem['product_id'], $transferItem['quantity']);
                                // Kurangi dari gudang asal
                                manageStock($transfer->from_warehouse_id, $transferItem['product_id'], -$transferItem['quantity']);
                            }
                        }
                    } else {
                        throw new UnprocessableEntityHttpException('Product stock is not available in selected warehouse.');
                    }

                    $item = $this->calculationTransferItems($transferItem);
                    $transferItem = new TransferItem($item);
                    $transfer->transferItems()->save($transferItem);
                }
            }

            $removeItemIds = array_diff($transferItemOldIds, $transferItemNewIds);

            if (! empty(array_values($removeItemIds))) {
                foreach ($removeItemIds as $removeItemId) {
                    $oldTransferItem = TransferItem::whereId($removeItemId)->first();
                    $oldTransfer = Transfer::whereId($oldTransferItem->transfer_id)->first();
                    $fromManageStock = ManageStock::whereWarehouseId($oldTransfer->from_warehouse_id)->whereProductId($oldTransferItem->product_id)->first();
                    $toManageStock = ManageStock::whereWarehouseId($oldTransfer->to_warehouse_id)->whereProductId($oldTransferItem->product_id)->first();

                    $toquantity = 0;

                    if ($oldStatus == Transfer::COMPLETED && $toManageStock) {
                        $toquantity = $toquantity - $oldTransferItem->quantity;
                        manageStock($toManageStock->warehouse_id, $oldTransferItem->product_id, $toquantity);
                    }

                    $fromQuantity = 0;

                    if ($oldStatus == Transfer::COMPLETED) {
                        $fromQuantity = $fromQuantity + $oldTransferItem->quantity;
                        manageStock($oldTransfer->from_warehouse_id, $oldTransferItem->product_id, $fromQuantity);
                    }
                }

                TransferItem::whereIn('id', array_values($removeItemIds))->delete();
            }

            $transfer = $this->updateTransferCalculation($input, $id);

            // HPP & Stok: penyesuaian pasca status berubah
            $newStatus = (int) ($transfer->status ?? 0);

            // Jika berubah dari non-completed -> completed: apply pergerakan penuh
            if ($oldStatus != Transfer::COMPLETED && $newStatus == Transfer::COMPLETED) {
                foreach ($transfer->transferItems as $it) {
                    manageStock($transfer->to_warehouse_id, $it->product_id, $it->quantity);
                    manageStock($transfer->from_warehouse_id, $it->product_id, -$it->quantity);
                }
            }
            // Jika berubah dari completed -> non-completed: revert pergerakan penuh
            if ($oldStatus == Transfer::COMPLETED && $newStatus != Transfer::COMPLETED) {
                foreach ($transfer->transferItems as $it) {
                    manageStock($transfer->to_warehouse_id, $it->product_id, -$it->quantity);
                    manageStock($transfer->from_warehouse_id, $it->product_id, $it->quantity);
                }
            }

            // HPP: jika shipping berubah, sesuaikan; juga tangani perubahan status
            $newShipping = (float) ($input['shipping'] ?? 0);
            $deltaShipping = 0.0;
            if ($oldStatus == Transfer::COMPLETED && $newStatus == Transfer::COMPLETED) {
                $deltaShipping = $newShipping - $oldShipping;
            } elseif ($oldStatus != Transfer::COMPLETED && $newStatus == Transfer::COMPLETED) {
                $deltaShipping = $newShipping; // baru diterapkan
            } elseif ($oldStatus == Transfer::COMPLETED && $newStatus != Transfer::COMPLETED) {
                $deltaShipping = -$oldShipping; // dilepas
            }
            if ($deltaShipping != 0.0) {
                $itemsNow = $transfer->transferItems; // sudah termutakhirkan
                $totalQtyMovedNow = max(0.0, (float) $itemsNow->sum('quantity'));
                if ($totalQtyMovedNow > 0) {
                    $perProductQtyNow = [];
                    foreach ($itemsNow as $it) {
                        $perProductQtyNow[$it->product_id] = ($perProductQtyNow[$it->product_id] ?? 0) + (float) $it->quantity;
                    }
                    foreach ($perProductQtyNow as $pid => $qtyMoved) {
                        /** @var Product $prod */
                        $prod = Product::find($pid);
                        if (! $prod) { continue; }
                        $oldQtyTotal = (float) ManageStock::where('product_id', $pid)->sum('quantity');
                        if ($oldQtyTotal <= 0) { continue; }
                        $oldHpp = (float) ($prod->hpp ?? 0);
                        $allocDelta = $deltaShipping * ($qtyMoved / $totalQtyMovedNow);
                        $newHpp = (($oldQtyTotal * $oldHpp) + $allocDelta) / $oldQtyTotal;
                        $prod->update(['hpp' => (int) round($newHpp)]);
                    }
                }
            }

            // HPP: revaluasi dengan line price (delta lama -> baru) bila toggle aktif
            if ((int) (getSettingValue('transfer_line_revalue_hpp') ?? 0) === 1) {
                $newItems = $transfer->transferItems; // terkini
                $newQtyByProduct = [];
                $newAmountByProduct = [];
                foreach ($newItems as $it) {
                    $pid = $it->product_id;
                    $newQtyByProduct[$pid] = ($newQtyByProduct[$pid] ?? 0) + (float) $it->quantity;
                    $newAmountByProduct[$pid] = ($newAmountByProduct[$pid] ?? 0) + (float) $it->sub_total;
                }

                $allPids = array_unique(array_merge(array_keys($oldQtyByProduct), array_keys($newQtyByProduct)));
                foreach ($allPids as $pid) {
                    /** @var Product $prod */
                    $prod = Product::find($pid);
                    if (! $prod) { continue; }
                    $totalQty = (float) ManageStock::where('product_id', $pid)->sum('quantity');
                    if ($totalQty <= 0) { continue; }
                    $hpp = (float) ($prod->hpp ?? 0);
                    $oldQty = (float) ($oldQtyByProduct[$pid] ?? 0);
                    $newQty = (float) ($newQtyByProduct[$pid] ?? 0);
                    $oldAmt = (float) ($oldAmountByProduct[$pid] ?? 0);
                    $newAmt = (float) ($newAmountByProduct[$pid] ?? 0);
                    // delta effect terhadap total biaya persediaan (tanpa mengubah qty total)
                    if ($oldStatus == Transfer::COMPLETED && $newStatus == Transfer::COMPLETED) {
                        $deltaEffect = ($newAmt - $oldAmt) - ($hpp * ($newQty - $oldQty));
                    } elseif ($oldStatus != Transfer::COMPLETED && $newStatus == Transfer::COMPLETED) {
                        $deltaEffect = $newAmt - ($hpp * $newQty); // baru diterapkan
                    } elseif ($oldStatus == Transfer::COMPLETED && $newStatus != Transfer::COMPLETED) {
                        $deltaEffect = -($oldAmt - ($hpp * $oldQty)); // dilepas
                    } else {
                        $deltaEffect = 0.0;
                    }
                    if ($deltaEffect == 0.0) { continue; }
                    $newHpp = (($totalQty * $hpp) + $deltaEffect) / $totalQty;
                    $prod->update(['hpp' => (int) round($newHpp)]);
                }
            }

            DB::commit();

            return $transfer;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function updateItem($transferItem, $fromWarehouseId, $toWarehouseId): bool
    {
        try {
            $transferItem = $this->calculationTransferItems($transferItem);

            $item = TransferItem::whereId($transferItem['transfer_item_id'])->first();
            $transfer = Transfer::whereId($item->transfer_id)->first();

            $fromWarehouseId = $transfer->from_warehouse_id;
            $toWarehouseId = $transfer->to_warehouse_id;

            $fromQuantity = 0;

            if ($item->quantity >= $transferItem['quantity']) {
                $fromQuantityDiff = $item->quantity - $transferItem['quantity'];
                $fromQuantity = $fromQuantity + $fromQuantityDiff;
            } else {
                $fromQuantityDiff = $transferItem['quantity'] - $item->quantity;
                $fromQuantity = $fromQuantity - $fromQuantityDiff;
            }

            if ($fromQuantityDiff != 0) {
                $product = ManageStock::whereWarehouseId($fromWarehouseId)->whereProductId($transferItem['product_id'])->first();

                if ($product) {
                    if (($fromQuantity + $product->quantity) < 0) {
                        throw new UnprocessableEntityHttpException('Quantity should not be greater than available quantity.');
                    } else {
                        manageStock($fromWarehouseId, $item->product_id, $fromQuantity);
                    }
                } else {
                    throw new UnprocessableEntityHttpException('Product stock is not available in selected warehouse.');
                }
            }

            $toQuantity = 0;

            if ($item->quantity >= $transferItem['quantity']) {
                $toQuantityDiff = $item->quantity - $transferItem['quantity'];
                $toQuantity = $toQuantity - $toQuantityDiff;
            } else {
                $toQuantityDiff = $transferItem['quantity'] - $item->quantity;
                $toQuantity = $toQuantity + $toQuantityDiff;
            }

            if ($toQuantityDiff != 0) {
                manageStock($toWarehouseId, $item->product_id, $toQuantity);
            }

            unset($transferItem['transfer_item_id']);

            $item->update($transferItem);

            return true;
        } catch (Exception $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function updateTransferCalculation($input, $id)
    {
        $transfer = Transfer::findOrFail($id);
        $subTotalAmount = $transfer->transferItems()->sum('sub_total');

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

        $transferInputArray = Arr::only($input, [
            'from_warehouse_id', 'to_warehouse_id', 'tax_rate', 'tax_amount', 'discount', 'shipping', 'grand_total',
            'note', 'date', 'status',
        ]);
        $transfer->update($transferInputArray);

        return $transfer;
    }
}
