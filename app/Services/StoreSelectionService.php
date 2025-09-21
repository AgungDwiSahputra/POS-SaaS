<?php

namespace App\Services;

use App\Models\Store;
use App\Models\Warehouse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Collection;

class StoreSelectionService
{
    /**
     * Get available stores for the current tenant
     */
    public function getAvailableStores(): Collection
    {
        return Store::where('tenant_id', Auth::user()->tenant_id)
                   ->where('status', 1) // Active stores only
                   ->orderBy('name')
                   ->get();
    }

    /**
     * Get warehouses for a specific store
     */
    public function getWarehousesForStore(int $storeId): Collection
    {
        $store = Store::find($storeId);
        if (!$store) {
            return collect();
        }

        return Warehouse::where('tenant_id', $store->tenant_id)
                       ->orderBy('name')
                       ->get();
    }

    /**
     * Get all warehouses for current tenant
     */
    public function getAllWarehouses(): Collection
    {
        return Warehouse::where('tenant_id', Auth::user()->tenant_id)
                       ->orderBy('name')
                       ->get();
    }

    /**
     * Validate store-to-warehouse transfer
     */
    public function validateStoreToWarehouseTransfer(int $fromStoreId, int $toWarehouseId): array
    {
        $errors = [];

        // Check if from store exists and belongs to current tenant
        $fromStore = Store::where('id', $fromStoreId)
                         ->where('tenant_id', Auth::user()->tenant_id)
                         ->first();
        
        if (!$fromStore) {
            $errors[] = 'Store asal tidak valid atau tidak ditemukan.';
        }

        // Check if to warehouse exists and belongs to current tenant
        $toWarehouse = Warehouse::where('id', $toWarehouseId)
                               ->where('tenant_id', Auth::user()->tenant_id)
                               ->first();
        
        if (!$toWarehouse) {
            $errors[] = 'Gudang tujuan tidak valid atau tidak ditemukan.';
        }

        // Check if both belong to same tenant
        if ($fromStore && $toWarehouse && $fromStore->tenant_id !== $toWarehouse->tenant_id) {
            $errors[] = 'Store asal dan gudang tujuan harus dalam tenant yang sama.';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'from_store' => $fromStore,
            'to_warehouse' => $toWarehouse
        ];
    }

    /**
     * Validate store-to-store transfer
     */
    public function validateStoreToStoreTransfer(int $fromStoreId, int $toStoreId): array
    {
        $errors = [];

        // Check if stores are different
        if ($fromStoreId === $toStoreId) {
            $errors[] = 'Store asal dan tujuan tidak boleh sama.';
        }

        // Check if from store exists and belongs to current tenant
        $fromStore = Store::where('id', $fromStoreId)
                         ->where('tenant_id', Auth::user()->tenant_id)
                         ->first();
        
        if (!$fromStore) {
            $errors[] = 'Store asal tidak valid atau tidak ditemukan.';
        }

        // Check if to store exists and belongs to current tenant
        $toStore = Store::where('id', $toStoreId)
                       ->where('tenant_id', Auth::user()->tenant_id)
                       ->first();
        
        if (!$toStore) {
            $errors[] = 'Store tujuan tidak valid atau tidak ditemukan.';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'from_store' => $fromStore,
            'to_store' => $toStore
        ];
    }

    /**
     * Validate store-to-warehouse purchase
     */
    public function validateStoreToWarehousePurchase(int $fromStoreId, int $toWarehouseId): array
    {
        $errors = [];

        // Check if from store exists and belongs to current tenant
        $fromStore = Store::where('id', $fromStoreId)
                         ->where('tenant_id', Auth::user()->tenant_id)
                         ->first();
        
        if (!$fromStore) {
            $errors[] = 'Store asal tidak valid atau tidak ditemukan.';
        }

        // Check if to warehouse exists and belongs to current tenant
        $toWarehouse = Warehouse::where('id', $toWarehouseId)
                               ->where('tenant_id', Auth::user()->tenant_id)
                               ->first();
        
        if (!$toWarehouse) {
            $errors[] = 'Gudang tujuan tidak valid atau tidak ditemukan.';
        }

        // Check if both belong to same tenant
        if ($fromStore && $toWarehouse && $fromStore->tenant_id !== $toWarehouse->tenant_id) {
            $errors[] = 'Store asal dan gudang tujuan harus dalam tenant yang sama.';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'from_store' => $fromStore,
            'to_warehouse' => $toWarehouse
        ];
    }

    /**
     * Get transfer type based on parameters
     */
    public function getTransferType(?int $fromStoreId, ?int $toStoreId, ?int $fromWarehouseId, ?int $toWarehouseId): int
    {
        // Constants for transfer types
        const WAREHOUSE_TO_WAREHOUSE = 1;
        const STORE_TO_WAREHOUSE = 2;
        const STORE_TO_STORE = 3;

        if ($fromStoreId && $toStoreId) {
            return self::STORE_TO_STORE;
        } elseif ($fromStoreId && $toWarehouseId) {
            return self::STORE_TO_WAREHOUSE;
        } else {
            return self::WAREHOUSE_TO_WAREHOUSE;
        }
    }

    /**
     * Get purchase type based on parameters
     */
    public function getPurchaseType(?int $fromStoreId): int
    {
        // Constants for purchase types
        const REGULAR_PURCHASE = 1;
        const STORE_TO_WAREHOUSE_PURCHASE = 2;

        return $fromStoreId ? self::STORE_TO_WAREHOUSE_PURCHASE : self::REGULAR_PURCHASE;
    }

    /**
     * Format store data for API response
     */
    public function formatStoreForApi(Store $store): array
    {
        return [
            'id' => $store->id,
            'name' => $store->name,
            'tenant_id' => $store->tenant_id,
            'status' => $store->status,
            'warehouses_count' => $this->getWarehousesForStore($store->id)->count()
        ];
    }

    /**
     * Format warehouse data for API response
     */
    public function formatWarehouseForApi(Warehouse $warehouse): array
    {
        return [
            'id' => $warehouse->id,
            'name' => $warehouse->name,
            'phone' => $warehouse->phone,
            'city' => $warehouse->city,
            'country' => $warehouse->country
        ];
    }
}
