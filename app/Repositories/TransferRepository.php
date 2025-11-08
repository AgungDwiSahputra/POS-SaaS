<?php

namespace App\Repositories;

use App\Models\ManageStock;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Store;
use App\Models\Transfer;
use App\Models\TransferItem;
use App\Models\Warehouse;
use App\Services\ProductSyncService;
use App\Services\TransferLockService;
use Exception;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
                'from_warehouse_id', 'from_store_id', 'to_warehouse_id', 'to_store_id', 'tax_rate', 'tax_amount', 'discount', 'shipping', 'grand_total',
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
                        $oldTotalValue = $oldQtyTotal * $oldHpp;
                        $alloc = $shipping * ($qtyMoved / $totalQtyMoved);
                        $newHpp = ($oldTotalValue + $alloc) / $oldQtyTotal;
                        $oldHppValue = $prod->hpp;
                        $prod->update(['hpp' => (int) round($newHpp)]);
                        
                        Log::info("HPP updated for product {$pid} (Transfer Shipping Allocation)", [
                            'old_qty' => $oldQtyTotal,
                            'old_hpp' => $oldHpp,
                            'old_total_value' => $oldTotalValue,
                            'shipping_allocation' => $alloc,
                            'new_hpp' => $newHpp,
                            'rounded_hpp' => (int) round($newHpp)
                        ]);

                        // Create stock movement record for HPP change
                        try {
                            StockMovement::createMovement([
                                'product_id' => $pid,
                                'warehouse_id' => $transfer->to_warehouse_id,
                                'quantity' => 0, // No quantity change, only HPP change
                                'type' => StockMovement::TYPE_TRANSFER_IN,
                                'reference_type' => 'transfer_shipping',
                                'reference_id' => $transfer->id,
                                'old_hpp' => $oldHppValue,
                                'new_hpp' => (int) round($newHpp),
                                'notes' => "HPP updated from transfer shipping allocation {$transfer->reference_code}"
                            ]);
                        } catch (\Exception $e) {
                            Log::error("Failed to create stock movement record for HPP change: " . $e->getMessage());
                        }
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
                        $oldTotalValue = $totalQty * $oldHpp;
                        $lineAmount = (float) ($amountByProduct[$pid] ?? 0);
                        // Delta biaya terhadap HPP lama atas qty yang dipindah
                        $delta = $lineAmount - ($oldHpp * $movedQty);
                        $newHpp = ($oldTotalValue + $delta) / $totalQty;
                        $oldHppValue = $prod->hpp;
                        $prod->update(['hpp' => (int) round($newHpp)]);
                        
                        Log::info("HPP updated for product {$pid} (Transfer Line Revaluation)", [
                            'total_qty' => $totalQty,
                            'old_hpp' => $oldHpp,
                            'old_total_value' => $oldTotalValue,
                            'moved_qty' => $movedQty,
                            'line_amount' => $lineAmount,
                            'delta' => $delta,
                            'new_hpp' => $newHpp,
                            'rounded_hpp' => (int) round($newHpp)
                        ]);

                        // Create stock movement record for HPP change
                        try {
                            StockMovement::createMovement([
                                'product_id' => $pid,
                                'warehouse_id' => $transfer->to_warehouse_id,
                                'quantity' => 0, // No quantity change, only HPP change
                                'type' => StockMovement::TYPE_TRANSFER_IN,
                                'reference_type' => 'transfer_revaluation',
                                'reference_id' => $transfer->id,
                                'old_hpp' => $oldHppValue,
                                'new_hpp' => (int) round($newHpp),
                                'notes' => "HPP updated from transfer line revaluation {$transfer->reference_code}"
                            ]);
                        } catch (\Exception $e) {
                            Log::error("Failed to create stock movement record for HPP change: " . $e->getMessage());
                        }
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
        // Get stores untuk detect cross-tenant
        $fromStore = Store::find($input['from_store_id']);
        $toStore = Store::find($input['to_store_id']);
        $isCrossTenant = $fromStore->tenant_id !== $toStore->tenant_id;

        $productSyncService = app(ProductSyncService::class);
        $lockService = app(TransferLockService::class);

        // Skip validation untuk transfer yang sudah ada (mode edit)
        $isEditMode = isset($transfer->id);

        // Track untuk rollback jika terjadi error
        $syncedProductIds = [];
        $stockMovements = [];
        $acquiredLocks = [];

        try {
            // PRE-LOCKING: Acquire locks untuk semua produk sebelum processing
            foreach ($input['transfer_items'] as $index => $transferItem) {
                $sourceProductId = $transferItem['product_id'];

                // Lock source product untuk mencegah concurrent transfers
                try {
                    $lockToken = $lockService->lockProduct(
                        $sourceProductId,
                        $input['from_warehouse_id'],
                        $fromStore->tenant_id
                    );
                    $acquiredLocks[] = [
                        'type' => 'product',
                        'key' => "product:{$sourceProductId}:warehouse:{$input['from_warehouse_id']}:tenant:{$fromStore->tenant_id}",
                        'token' => $lockToken
                    ];
                } catch (Exception $e) {
                    // Release all acquired locks before re-throwing
                    $this->releaseAllLocks($lockService, $acquiredLocks);
                    throw new UnprocessableEntityHttpException(
                        "Cannot process transfer - product is currently being transferred: " . $e->getMessage()
                    );
                }
            }

            // Lock destination warehouse untuk capacity validation (cross-tenant only)
            if ($isCrossTenant) {
                try {
                    $warehouseLockToken = $lockService->lockWarehouse(
                        $input['to_warehouse_id'],
                        $toStore->tenant_id
                    );
                    $acquiredLocks[] = [
                        'type' => 'warehouse',
                        'key' => "warehouse:{$input['to_warehouse_id']}:tenant:{$toStore->tenant_id}",
                        'token' => $warehouseLockToken
                    ];
                } catch (Exception $e) {
                    $this->releaseAllLocks($lockService, $acquiredLocks);
                    throw new UnprocessableEntityHttpException(
                        "Cannot process transfer - destination warehouse is currently being updated: " . $e->getMessage()
                    );
                }
            }

            foreach ($input['transfer_items'] as $transferItem) {
                $sourceProductId = $transferItem['product_id'];
                $destinationProductId = $sourceProductId; // Default: same (same tenant)
                $isSynced = false;

                // 1. Validate stock di warehouse asal
                $stockCheck = ManageStock::whereWarehouseId($input['from_warehouse_id'])
                    ->whereProductId($sourceProductId)
                    ->first();

                if (!$stockCheck) {
                    $this->releaseAllLocks($lockService, $acquiredLocks);
                    throw new UnprocessableEntityHttpException('Product stock is not available in selected warehouse.');
                }

                if ($transferItem['quantity'] > $stockCheck->quantity) {
                    $this->releaseAllLocks($lockService, $acquiredLocks);
                    throw new UnprocessableEntityHttpException('Quantity should not be greater than available quantity.');
                }

                // 2. Enhanced validation untuk cross-tenant - warehouse tujuan harus valid
                if ($isCrossTenant) {
                    // Validasi warehouse tujuan ada dan dapat menerima produk
                    $destWarehouse = Warehouse::withoutGlobalScope('tenant')
                        ->find($input['to_warehouse_id']);

                    if (!$destWarehouse) {
                        throw new UnprocessableEntityHttpException('Destination warehouse not found.');
                    }

                    // VALIDASI KRITIS: Pastikan warehouse dimiliki oleh destination tenant
                    $warehouseInDestTenant = Warehouse::withoutGlobalScope('tenant')
                        ->where('id', $input['to_warehouse_id'])
                        ->where('tenant_id', $toStore->tenant_id)
                        ->first();

                    if (!$warehouseInDestTenant) {
                        throw new UnprocessableEntityHttpException(
                            'Destination warehouse is not accessible in target tenant. ' .
                            'Warehouse ID ' . $input['to_warehouse_id'] .
                            ' does not belong to Tenant ' . $toStore->tenant_id
                        );
                    }

                    // Validasi warehouse capacity (gunakan tenant-specific calculation)
                    if (isset($destWarehouse->max_capacity)) {
                        $currentStock = ManageStock::withoutGlobalScope('tenant')
                            ->where('warehouse_id', $input['to_warehouse_id'])
                            ->whereHas('product', function($query) use ($toStore) {
                                $query->withoutGlobalScope('tenant')
                                    ->where('tenant_id', $toStore->tenant_id);
                            })
                            ->sum('quantity');
                        $newTotalStock = $currentStock + $transferItem['quantity'];

                        if ($newTotalStock > $destWarehouse->max_capacity) {
                            throw new UnprocessableEntityHttpException(
                                'Destination warehouse capacity exceeded. Current: ' . $currentStock .
                                ', Adding: ' . $transferItem['quantity'] .
                                ', Max: ' . $destWarehouse->max_capacity
                            );
                        }
                    }
                }

                // 2. CROSS-TENANT PRODUCT SYNC (skip untuk mode edit)
                if ($isCrossTenant && !$isEditMode) {
                    $sourceProduct = Product::find($sourceProductId);

                    // Lock product for sync operation
                    try {
                        $syncLockToken = $lockService->lockProductForSync(
                            $sourceProduct->product_code,
                            $toStore->tenant_id
                        );
                        $acquiredLocks[] = [
                            'type' => 'sync',
                            'key' => "sync:product:{$sourceProduct->product_code}:tenant:{$toStore->tenant_id}",
                            'token' => $syncLockToken
                        ];
                    } catch (Exception $e) {
                        $this->releaseAllLocks($lockService, $acquiredLocks);
                        throw new UnprocessableEntityHttpException(
                            "Cannot process transfer - product is currently being synced: " . $e->getMessage()
                        );
                    }

                    try {
                        Log::info("Starting product sync for cross-tenant transfer", [
                            'source_product_id' => $sourceProductId,
                            'source_product_code' => $sourceProduct->product_code,
                            'target_tenant_id' => $toStore->tenant_id
                        ]);

                        $syncResult = $productSyncService->syncProduct(
                            $sourceProduct,
                            $toStore->tenant_id
                        );

                        $destinationProductId = $syncResult['product_id'];
                        $isSynced = true;

                        // Validate sync result
                        if (!$destinationProductId || $destinationProductId <= 0) {
                            throw new Exception("Invalid destination product ID returned from sync: {$destinationProductId}");
                        }

                        // Track untuk rollback
                        if ($syncResult['was_created']) {
                            $syncedProductIds[] = $destinationProductId;
                        }

                        Log::info("Product synced successfully for transfer", [
                            'source_product_id' => $sourceProductId,
                            'destination_product_id' => $destinationProductId,
                            'was_created' => $syncResult['was_created'],
                            'was_updated' => $syncResult['was_updated'] ?? false,
                            'target_tenant_id' => $toStore->tenant_id
                        ]);

                        // Release sync lock immediately after successful sync
                        $lockService->releaseLock(
                            "sync:product:{$sourceProduct->product_code}:tenant:{$toStore->tenant_id}",
                            $syncLockToken
                        );

                    } catch (Exception $e) {
                        Log::error("Product sync failed with details", [
                            'source_product_id' => $sourceProductId,
                            'source_product_code' => $sourceProduct->product_code ?? 'N/A',
                            'target_tenant_id' => $toStore->tenant_id,
                            'error_message' => $e->getMessage(),
                            'error_file' => $e->getFile(),
                            'error_line' => $e->getLine(),
                            'trace' => $e->getTraceAsString()
                        ]);

                        $this->releaseAllLocks($lockService, $acquiredLocks);
                        throw new UnprocessableEntityHttpException(
                            __('messages.transfer.product_sync_failed') . ': ' . $e->getMessage()
                        );
                    }
                }

                // 3. STOCK MOVEMENT (only if status = COMPLETED)
                if ((int) ($transfer->status ?? 0) == Transfer::COMPLETED) {
                    // 4. HPP CALCULATION untuk destination product (cross-tenant only)
                    // HARUS SEBELUM stock movement untuk dapat qty yang benar
                    if ($isCrossTenant) {
                        $this->updateHPPCrossTenant(
                            $destinationProductId,
                            $transferItem['quantity'],
                            $transferItem['net_unit_price'] ?? $transferItem['product_price']
                        );
                    }

                    // Kurangi dari gudang asal (source product)
                    manageStock($input['from_warehouse_id'], $sourceProductId, -$transferItem['quantity']);

                    // Tambah ke gudang tujuan (destination product) - handle cross-tenant
                    if ($isCrossTenant) {
                        // For cross-tenant, use manual ManageStock creation with proper scoping
                        $this->createCrossTenantStock(
                            $input['to_warehouse_id'],
                            $destinationProductId,
                            $transferItem['quantity']
                        );
                    } else {
                        // Same tenant, use standard function
                        manageStock($input['to_warehouse_id'], $destinationProductId, $transferItem['quantity']);
                    }

                    // Track stock movements untuk potential rollback
                    $stockMovements[] = [
                        'from_warehouse' => $input['from_warehouse_id'],
                        'to_warehouse' => $input['to_warehouse_id'],
                        'from_product' => $sourceProductId,
                        'to_product' => $destinationProductId,
                        'quantity' => $transferItem['quantity']
                    ];

                    // Create stock movement records for transfer
                    try {
                        // Stock OUT from source warehouse
                        StockMovement::createMovement([
                            'product_id' => $sourceProductId,
                            'warehouse_id' => $input['from_warehouse_id'],
                            'quantity' => -$transferItem['quantity'],
                            'type' => StockMovement::TYPE_TRANSFER_OUT,
                            'reference_type' => 'transfer',
                            'reference_id' => $transfer->id,
                            'old_hpp' => null,
                            'new_hpp' => null,
                            'notes' => "Transfer OUT from {$transfer->reference_code}"
                        ]);

                        // Stock IN to destination warehouse
                        StockMovement::createMovement([
                            'product_id' => $destinationProductId,
                            'warehouse_id' => $input['to_warehouse_id'],
                            'quantity' => $transferItem['quantity'],
                            'type' => StockMovement::TYPE_TRANSFER_IN,
                            'reference_type' => 'transfer',
                            'reference_id' => $transfer->id,
                            'old_hpp' => null,
                            'new_hpp' => null,
                            'notes' => "Transfer IN from {$transfer->reference_code}"
                        ]);
                    } catch (\Exception $e) {
                        Log::error("Failed to create stock movement records for transfer: " . $e->getMessage());
                    }
                }

                // 5. SAVE TRANSFER ITEM dengan destination info
                $item = $this->calculationTransferItems($transferItem);
                $item['destination_product_id'] = $destinationProductId;
                $item['is_synced'] = $isSynced;

                $transferItemModel = new TransferItem($item);
                $transfer->transferItems()->save($transferItemModel);
            }

        } catch (\Exception $e) {
            // Enhanced error handling dengan compensation logic
            $this->handleTransferError($e, $syncedProductIds, $stockMovements, $input);

            // Release all acquired locks in case of error
            $this->releaseAllLocks($lockService, $acquiredLocks);

            throw new UnprocessableEntityHttpException($e->getMessage());
        } finally {
            // Always release locks regardless of success/failure
            $this->releaseAllLocks($lockService, $acquiredLocks);
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

            // Simplified HPP calculation using consolidated approach
            $this->updateTransferHPP($transfer, $oldStatus, $newStatus, $oldShipping, $input, $oldQtyByProduct, $oldAmountByProduct);

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
            'from_warehouse_id', 'from_store_id', 'to_warehouse_id', 'to_store_id', 'tax_rate', 'tax_amount', 'discount', 'shipping', 'grand_total',
            'note', 'date', 'status',
        ]);
        $transfer->update($transferInputArray);

        return $transfer;
    }

    /**
     * Update HPP untuk cross-tenant transfer menggunakan Weighted Average Cost
     * Formula: HPP Baru = (Total Nilai Lama + Nilai Masuk) / (Qty Lama + Qty Masuk)
     *
     * Contoh:
     * - Existing: 5 @ 10.000 = 50.000
     * - Incoming: 5 @ 6.000 = 30.000
     * - New HPP: (50.000 + 30.000) / (5 + 5) = 8.000
     */
    protected function updateHPPCrossTenant($destinationProductId, $incomingQty, $incomingUnitPrice): void
    {
        try {
            $product = Product::withoutGlobalScope('tenant')->find($destinationProductId);
            
            if (!$product) {
                Log::warning("Product not found for HPP calculation: {$destinationProductId}");
                return;
            }
            
            // Get current total stock (across all warehouses for this product in destination tenant)
            $currentTotalQty = (float) ManageStock::withoutGlobalScope('tenant')
                ->where('product_id', $destinationProductId)
                ->sum('quantity');
            
            // Current HPP and total value
            $currentHPP = (float) ($product->hpp ?? 0);
            $currentTotalValue = $currentHPP * $currentTotalQty;
            
            // Incoming values
            $incomingQty = (float) $incomingQty;
            $incomingUnitPrice = (float) $incomingUnitPrice;
            $incomingValue = $incomingQty * $incomingUnitPrice;
            
            // Calculate new HPP using Weighted Average
            $newTotalQty = $currentTotalQty + $incomingQty;
            
            if ($newTotalQty > 0) {
                $newHPP = ($currentTotalValue + $incomingValue) / $newTotalQty;
                $product->update(['hpp' => (int) round($newHPP)]);
                
                Log::info("HPP updated for product {$destinationProductId} (Cross-Tenant Transfer)", [
                    'old_hpp' => $currentHPP,
                    'old_qty' => $currentTotalQty,
                    'old_total_value' => $currentTotalValue,
                    'incoming_qty' => $incomingQty,
                    'incoming_unit_price' => $incomingUnitPrice,
                    'incoming_value' => $incomingValue,
                    'new_total_qty' => $newTotalQty,
                    'new_total_value' => $currentTotalValue + $incomingValue,
                    'new_hpp' => $newHPP,
                    'rounded_hpp' => (int) round($newHPP)
                ]);
            }
            
        } catch (Exception $e) {
            Log::error("HPP calculation failed: " . $e->getMessage());
            // Don't throw, just log (HPP calculation failure shouldn't block transfer)
        }
    }

    /**
     * Simplified HPP calculation for transfer updates
     * Consolidates shipping allocation and line revaluation logic
     */
    protected function updateTransferHPP(Transfer $transfer, int $oldStatus, int $newStatus, float $oldShipping, array $input, array $oldQtyByProduct, array $oldAmountByProduct): void
    {
        try {
            $newShipping = (float) ($input['shipping'] ?? 0);
            $lineRevalueEnabled = (int) (getSettingValue('transfer_line_revalue_hpp') ?? 0) === 1;

            // Get current transfer items for calculations
            $currentItems = $transfer->transferItems;

            if ($currentItems->isEmpty()) {
                return;
            }

            // Group current items by product for efficient processing
            $currentProductData = $this->groupTransferItemsByProduct($currentItems);

            foreach ($currentProductData as $productId => $data) {
                $product = Product::find($productId);
                if (!$product) {
                    continue;
                }

                $totalStockQty = (float) ManageStock::where('product_id', $productId)->sum('quantity');
                if ($totalStockQty <= 0) {
                    continue;
                }

                $currentHPP = (float) ($product->hpp ?? 0);
                $totalCurrentValue = $currentHPP * $totalStockQty;

                // Calculate shipping cost allocation
                $shippingDelta = $this->calculateShippingDelta($oldShipping, $newShipping, $oldStatus, $newStatus);
                $shippingAllocation = $this->allocateShippingCost($shippingDelta, $data['quantity'], $currentItems->sum('quantity'));

                // Calculate line revaluation delta
                $lineRevaluationDelta = 0;
                if ($lineRevalueEnabled) {
                    $lineRevaluationDelta = $this->calculateLineRevaluationDelta(
                        $data['quantity'],
                        $data['total_value'],
                        $oldQtyByProduct[$productId] ?? 0,
                        $oldAmountByProduct[$productId] ?? 0,
                        $currentHPP,
                        $oldStatus,
                        $newStatus
                    );
                }

                // Calculate final HPP adjustment
                $totalDelta = $shippingAllocation + $lineRevaluationDelta;

                if (abs($totalDelta) > 0.01) { // Only update if significant change
                    $newTotalValue = $totalCurrentValue + $totalDelta;
                    $newHPP = $newTotalValue / $totalStockQty;

                    $product->update(['hpp' => (int) round($newHPP)]);

                    Log::info("HPP updated for product {$productId}", [
                        'old_hpp' => $currentHPP,
                        'new_hpp' => $newHPP,
                        'shipping_delta' => $shippingAllocation,
                        'line_revaluation_delta' => $lineRevaluationDelta,
                        'total_delta' => $totalDelta
                    ]);
                }
            }

        } catch (Exception $e) {
            Log::error("HPP calculation failed: " . $e->getMessage());
            // Don't throw - HPP calculation failure shouldn't block transfer
        }
    }

    /**
     * Group transfer items by product for efficient processing
     */
    protected function groupTransferItemsByProduct($transferItems): array
    {
        $grouped = [];

        foreach ($transferItems as $item) {
            $productId = $item->product_id;

            if (!isset($grouped[$productId])) {
                $grouped[$productId] = [
                    'quantity' => 0,
                    'total_value' => 0
                ];
            }

            $grouped[$productId]['quantity'] += (float) $item->quantity;
            $grouped[$productId]['total_value'] += (float) $item->sub_total;
        }

        return $grouped;
    }

    /**
     * Calculate shipping cost delta based on status changes
     */
    protected function calculateShippingDelta(float $oldShipping, float $newShipping, int $oldStatus, int $newStatus): float
    {
        if ($oldStatus == Transfer::COMPLETED && $newStatus == Transfer::COMPLETED) {
            return $newShipping - $oldShipping; // Adjustment
        } elseif ($oldStatus != Transfer::COMPLETED && $newStatus == Transfer::COMPLETED) {
            return $newShipping; // Apply new shipping
        } elseif ($oldStatus == Transfer::COMPLETED && $newStatus != Transfer::COMPLETED) {
            return -$oldShipping; // Remove shipping effect
        }

        return 0.0; // No shipping effect
    }

    /**
     * Allocate shipping cost proportionally to product quantity
     */
    protected function allocateShippingCost(float $shippingDelta, float $productQuantity, float $totalQuantity): float
    {
        if ($totalQuantity <= 0 || $productQuantity <= 0) {
            return 0.0;
        }

        return $shippingDelta * ($productQuantity / $totalQuantity);
    }

    /**
     * Calculate line revaluation delta when prices change
     */
    protected function calculateLineRevaluationDelta(
        float $newQuantity,
        float $newValue,
        float $oldQuantity,
        float $oldValue,
        float $currentHPP,
        int $oldStatus,
        int $newStatus
    ): float {
        if ($oldStatus == Transfer::COMPLETED && $newStatus == Transfer::COMPLETED) {
            // Price adjustment during completed status
            $qtyDelta = $newQuantity - $oldQuantity;
            $valueDelta = $newValue - $oldValue;
            return $valueDelta - $currentHPP * $qtyDelta;
        } elseif ($oldStatus != Transfer::COMPLETED && $newStatus == Transfer::COMPLETED) {
            // Initial application
            return $newValue - $currentHPP * $newQuantity;
        } elseif ($oldStatus == Transfer::COMPLETED && $newStatus != Transfer::COMPLETED) {
            // Removal effect
            return -($oldValue - $currentHPP * $oldQuantity);
        }

        return 0.0; // No revaluation effect
    }

    /**
     * Handle transfer errors dengan compensation logic
     * Attempt to rollback changes yang sudah dilakukan untuk maintain consistency
     */
    protected function handleTransferError(Exception $e, array $syncedProductIds, array $stockMovements, array $input): void
    {
        Log::error("Transfer error occurred, attempting compensation logic", [
            'error_message' => $e->getMessage(),
            'synced_products_count' => count($syncedProductIds),
            'stock_movements_count' => count($stockMovements),
            'from_warehouse' => $input['from_warehouse_id'] ?? null,
            'to_warehouse' => $input['to_warehouse_id'] ?? null
        ]);

        try {
            // 1. Rollback synced products jika mereka baru dibuat
            if (!empty($syncedProductIds)) {
                foreach ($syncedProductIds as $productId) {
                    $productToDelete = Product::withoutGlobalScope('tenant')->find($productId);
                    if ($productToDelete) {
                        // Hapus juga stock records yang terkait
                        ManageStock::withoutGlobalScope('tenant')
                            ->where('product_id', $productId)
                            ->delete();

                        // Hapus product
                        $productToDelete->delete();

                        Log::info("Rolled back synced product: {$productId}");
                    }
                }
            }

            // 2. Revert stock movements yang sudah terjadi
            if (!empty($stockMovements)) {
                foreach (array_reverse($stockMovements) as $movement) {
                    try {
                        // Reverse OUT movement (ke source warehouse) - always same tenant
                        manageStock($movement['from_warehouse'], $movement['from_product'], $movement['quantity']);

                        // Reverse IN movement (dari destination warehouse) - potentially cross-tenant
                        // Use cross-tenant method for destination rollback
                        $this->createCrossTenantStock(
                            $movement['to_warehouse'],
                            $movement['to_product'],
                            -$movement['quantity']
                        );

                        Log::info("Reverted stock movement", [
                            'product_from' => $movement['from_product'],
                            'product_to' => $movement['to_product'],
                            'quantity' => $movement['quantity'],
                            'from_warehouse' => $movement['from_warehouse'],
                            'to_warehouse' => $movement['to_warehouse']
                        ]);

                    } catch (Exception $rollbackError) {
                        Log::error("Failed to revert stock movement", [
                            'error' => $rollbackError->getMessage(),
                            'movement' => $movement
                        ]);
                        // Continue dengan rollback lainnya
                    }
                }
            }

            Log::info("Transfer compensation logic completed successfully");

        } catch (Exception $rollbackException) {
            Log::error("Failed to execute transfer compensation logic", [
                'original_error' => $e->getMessage(),
                'rollback_error' => $rollbackException->getMessage(),
                'synced_products' => $syncedProductIds,
                'stock_movements' => $stockMovements
            ]);

            // Enhanced error notification untuk admin
            Log::critical("CRITICAL: Transfer failed AND rollback failed. Manual intervention required!", [
                'original_error' => $e->getMessage(),
                'rollback_error' => $rollbackException->getMessage(),
                'transfer_input' => $input
            ]);
        }
    }

    /**
     * Create ManageStock record untuk cross-tenant scenarios
     * Handle creation di destination tenant dengan proper scoping
     */
    protected function createCrossTenantStock($warehouseId, $productId, $quantity): void
    {
        try {
            // Cek existing stock di warehouse tujuan
            $existingStock = ManageStock::withoutGlobalScope('tenant')
                ->where('warehouse_id', $warehouseId)
                ->where('product_id', $productId)
                ->first();

            if ($existingStock) {
                // Update existing stock
                $oldQuantity = $existingStock->quantity;
                $newQuantity = $oldQuantity + $quantity;

                if ($newQuantity < 0) {
                    throw new UnprocessableEntityHttpException(
                        "Insufficient stock for Product ID {$productId} in Warehouse {$warehouseId}. " .
                        "Available: {$oldQuantity}, Requested: " . abs($quantity)
                    );
                }

                $existingStock->update(['quantity' => $newQuantity]);

                Log::info("Cross-tenant Stock Updated", [
                    'warehouse_id' => $warehouseId,
                    'product_id' => $productId,
                    'old_quantity' => $oldQuantity,
                    'new_quantity' => $newQuantity,
                    'change' => $quantity,
                    'change_type' => $quantity >= 0 ? 'IN' : 'OUT'
                ]);

            } else {
                // Create new stock record
                if ($quantity < 0) {
                    throw new UnprocessableEntityHttpException(
                        "Cannot create negative stock for Product ID {$productId} in Warehouse {$warehouseId}"
                    );
                }

                ManageStock::withoutGlobalScope('tenant')->create([
                    'warehouse_id' => $warehouseId,
                    'product_id' => $productId,
                    'quantity' => $quantity,
                ]);

                Log::info("Cross-tenant Stock Created", [
                    'warehouse_id' => $warehouseId,
                    'product_id' => $productId,
                    'quantity' => $quantity,
                    'change_type' => 'INITIAL'
                ]);
            }

            // Create stock movement record
            $product = Product::withoutGlobalScope('tenant')->find($productId);
            StockMovement::createMovement([
                'product_id' => $productId,
                'warehouse_id' => $warehouseId,
                'quantity' => $quantity,
                'type' => $quantity >= 0 ? StockMovement::TYPE_TRANSFER_IN : StockMovement::TYPE_TRANSFER_OUT,
                'reference_type' => 'cross_tenant_transfer',
                'reference_id' => null,
                'old_hpp' => $product ? $product->hpp : null,
                'new_hpp' => $product ? $product->hpp : null,
                'notes' => 'Cross-tenant stock movement during transfer'
            ]);

        } catch (Exception $e) {
            Log::error("Failed to create cross-tenant stock: " . $e->getMessage(), [
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'quantity' => $quantity
            ]);
            throw $e;
        }
    }

    /**
     * Release all acquired locks with proper error handling
     *
     * @param TransferLockService $lockService
     * @param array $acquiredLocks
     */
    protected function releaseAllLocks(TransferLockService $lockService, array $acquiredLocks): void
    {
        if (empty($acquiredLocks)) {
            return;
        }

        // Release locks in reverse order to avoid potential deadlocks
        foreach (array_reverse($acquiredLocks) as $lock) {
            try {
                $released = $lockService->releaseLock($lock['key'], $lock['token']);

                if ($released) {
                    Log::info("Lock released successfully", [
                        'lock_type' => $lock['type'],
                        'lock_key' => $lock['key'],
                        'token' => $lock['token']
                    ]);
                } else {
                    Log::warning("Failed to release lock", [
                        'lock_type' => $lock['type'],
                        'lock_key' => $lock['key'],
                        'token' => $lock['token']
                    ]);
                }
            } catch (Exception $e) {
                Log::error("Error releasing lock", [
                    'lock_type' => $lock['type'],
                    'lock_key' => $lock['key'],
                    'token' => $lock['token'],
                    'error' => $e->getMessage()
                ]);
                // Continue trying to release other locks even if one fails
            }
        }

        Log::info("All locks release attempt completed", [
            'total_locks' => count($acquiredLocks)
        ]);
    }
}
