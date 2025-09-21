<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Services\StoreSelectionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreAPIController extends AppBaseController
{
    private StoreSelectionService $storeSelectionService;

    public function __construct(StoreSelectionService $storeSelectionService)
    {
        $this->storeSelectionService = $storeSelectionService;
    }

    /**
     * Get available stores for current tenant
     */
    public function index(): JsonResponse
    {
        $stores = $this->storeSelectionService->getAvailableStores();
        
        $formattedStores = $stores->map(function ($store) {
            return $this->storeSelectionService->formatStoreForApi($store);
        });

        return $this->sendResponse($formattedStores, 'Stores retrieved successfully');
    }

    /**
     * Get warehouses for a specific store
     */
    public function warehouses(int $storeId): JsonResponse
    {
        $warehouses = $this->storeSelectionService->getWarehousesForStore($storeId);
        
        $formattedWarehouses = $warehouses->map(function ($warehouse) {
            return $this->storeSelectionService->formatWarehouseForApi($warehouse);
        });

        return $this->sendResponse($formattedWarehouses, 'Store warehouses retrieved successfully');
    }

    /**
     * Get all warehouses for current tenant
     */
    public function allWarehouses(): JsonResponse
    {
        $warehouses = $this->storeSelectionService->getAllWarehouses();
        
        $formattedWarehouses = $warehouses->map(function ($warehouse) {
            return $this->storeSelectionService->formatWarehouseForApi($warehouse);
        });

        return $this->sendResponse($formattedWarehouses, 'All warehouses retrieved successfully');
    }

    /**
     * Validate store-to-warehouse transfer
     */
    public function validateStoreToWarehouseTransfer(Request $request): JsonResponse
    {
        $request->validate([
            'from_store_id' => 'required|integer',
            'to_warehouse_id' => 'required|integer',
        ]);

        $validation = $this->storeSelectionService->validateStoreToWarehouseTransfer(
            $request->from_store_id,
            $request->to_warehouse_id
        );

        if ($validation['valid']) {
            return $this->sendResponse($validation, 'Validation successful');
        } else {
            return $this->sendError('Validation failed', $validation['errors'], 422);
        }
    }

    /**
     * Validate store-to-store transfer
     */
    public function validateStoreToStoreTransfer(Request $request): JsonResponse
    {
        $request->validate([
            'from_store_id' => 'required|integer',
            'to_store_id' => 'required|integer',
        ]);

        $validation = $this->storeSelectionService->validateStoreToStoreTransfer(
            $request->from_store_id,
            $request->to_store_id
        );

        if ($validation['valid']) {
            return $this->sendResponse($validation, 'Validation successful');
        } else {
            return $this->sendError('Validation failed', $validation['errors'], 422);
        }
    }

    /**
     * Validate store-to-warehouse purchase
     */
    public function validateStoreToWarehousePurchase(Request $request): JsonResponse
    {
        $request->validate([
            'from_store_id' => 'required|integer',
            'to_warehouse_id' => 'required|integer',
        ]);

        $validation = $this->storeSelectionService->validateStoreToWarehousePurchase(
            $request->from_store_id,
            $request->to_warehouse_id
        );

        if ($validation['valid']) {
            return $this->sendResponse($validation, 'Validation successful');
        } else {
            return $this->sendError('Validation failed', $validation['errors'], 422);
        }
    }
}
