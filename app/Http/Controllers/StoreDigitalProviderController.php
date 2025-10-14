<?php

namespace App\Http\Controllers;

use App\Models\StoreDigitalProvider;
use App\Models\DigitalProvider;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class StoreDigitalProviderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $storeId = $request->get('store_id');

        $query = StoreDigitalProvider::where('tenant_id', Auth::user()->tenant_id)
            ->with(['store', 'digitalProvider']);

        if ($storeId) {
            $query->where('store_id', $storeId);
        }

        $storeDigitalProviders = $query->get();

        return response()->json([
            'data' => $storeDigitalProviders->map->asJsonResource(),
            'total' => $storeDigitalProviders->count(),
            'message' => 'Store digital providers retrieved successfully',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'store_id' => 'required|exists:stores,id,tenant_id,' . Auth::user()->tenant_id,
            'digital_provider_id' => 'required|exists:digital_providers,id',
            'balance' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            \Log::error('StoreDigitalProvider validation failed', [
                'errors' => $validator->errors()->toArray(),
                'request_data' => $request->all(),
                'user_id' => Auth::id(),
                'tenant_id' => Auth::user()->tenant_id,
            ]);

            return response()->json([
                'message' => 'Validation failed: ' . implode(', ', $validator->errors()->all()),
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check if combination already exists
        $existing = StoreDigitalProvider::where('tenant_id', Auth::user()->tenant_id)
                                      ->where('store_id', $request->store_id)
                                      ->where('digital_provider_id', $request->digital_provider_id)
                                      ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Provider already configured for this store',
            ], 422);
        }

        $storeDigitalProvider = StoreDigitalProvider::create([
            'tenant_id' => Auth::user()->tenant_id,
            'store_id' => $request->store_id,
            'digital_provider_id' => $request->digital_provider_id,
            'balance' => $request->balance,
            'is_active' => $request->is_active ?? true,
            'settings' => $request->settings,
        ]);

        $storeDigitalProvider->load(['store', 'digitalProvider']);

        return response()->json([
            'data' => $storeDigitalProvider->asJsonResource(),
            'message' => 'Store digital provider created successfully',
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $storeDigitalProvider = StoreDigitalProvider::where('tenant_id', Auth::user()->tenant_id)
                                                  ->with(['store', 'digitalProvider'])
                                                  ->find($id);

        if (!$storeDigitalProvider) {
            return response()->json([
                'message' => 'Store digital provider not found',
            ], 404);
        }

        $storeDigitalProvider->load(['store', 'digitalProvider']);

        return response()->json([
            'data' => $storeDigitalProvider->asJsonResource(),
            'message' => 'Store digital provider retrieved successfully',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $storeDigitalProvider = StoreDigitalProvider::where('tenant_id', Auth::user()->tenant_id)
                                                  ->find($id);

        if (!$storeDigitalProvider) {
            return response()->json([
                'message' => 'Store digital provider not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'balance' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $storeDigitalProvider->update([
            'balance' => $request->balance,
            'is_active' => $request->is_active ?? $storeDigitalProvider->is_active,
            'settings' => $request->settings,
        ]);

        $storeDigitalProvider->load(['store', 'digitalProvider']);

        return response()->json([
            'data' => $storeDigitalProvider->asJsonResource(),
            'message' => 'Store digital provider updated successfully',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $storeDigitalProvider = StoreDigitalProvider::where('tenant_id', Auth::user()->tenant_id)
                                                  ->find($id);

        if (!$storeDigitalProvider) {
            return response()->json([
                'message' => 'Store digital provider not found',
            ], 404);
        }

        // Check if there are any transactions using this configuration
        $transactionCount = $storeDigitalProvider->digitalSales()->count() +
                           $storeDigitalProvider->withdrawals()->count();

        if ($transactionCount > 0) {
            return response()->json([
                'message' => 'Cannot delete provider configuration with existing transactions',
            ], 422);
        }

        $storeDigitalProvider->delete();

        return response()->json([
            'message' => 'Store digital provider deleted successfully',
        ]);
    }

    /**
     * Get providers for specific store
     */
    public function getProvidersByStore(Request $request, string $storeId): JsonResponse
    {
        $providers = StoreDigitalProvider::where('tenant_id', Auth::user()->tenant_id)
                                        ->where('store_id', $storeId)
                                        ->with(['digitalProvider'])
                                        ->get();

        return response()->json([
            'data' => $providers->map->asJsonResource(),
            'message' => 'Store providers retrieved successfully',
        ]);
    }

    /**
     * Add balance to store provider (topup)
     */
    public function addBalance(Request $request, string $id): JsonResponse
    {
        $storeDigitalProvider = StoreDigitalProvider::where('tenant_id', Auth::user()->tenant_id)
                                                  ->find($id);

        if (!$storeDigitalProvider) {
            return response()->json([
                'message' => 'Store digital provider not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldBalance = $storeDigitalProvider->balance;
        $newBalance = $oldBalance + $request->amount;

        $storeDigitalProvider->update([
            'balance' => $newBalance,
            'last_topup_at' => now(),
            'last_topup_amount' => $request->amount,
        ]);

        return response()->json([
            'data' => $storeDigitalProvider->prepareAttributes(),
            'message' => 'Balance added successfully',
        ]);
    }

    /**
     * Get balance for specific store and provider
     */
    public function getBalance(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'store_id' => 'required|exists:stores,id,tenant_id,' . Auth::user()->tenant_id,
            'digital_provider_id' => 'required|exists:digital_providers,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $storeDigitalProvider = StoreDigitalProvider::where('tenant_id', Auth::user()->tenant_id)
                                                  ->where('store_id', $request->store_id)
                                                  ->where('digital_provider_id', $request->digital_provider_id)
                                                  ->first();

        if (!$storeDigitalProvider) {
            \Log::info('Balance requested for non-existent store provider, attempting to auto-create', [
                'store_id' => $request->store_id,
                'digital_provider_id' => $request->digital_provider_id,
                'tenant_id' => Auth::user()->tenant_id,
                'user_id' => Auth::id(),
            ]);

            try {
                // Verify store exists and belongs to tenant (redundant but safe due to validation)
                $store = Store::where('id', $request->store_id)
                              ->where('tenant_id', Auth::user()->tenant_id)
                              ->first();

                if (!$store) {
                    return response()->json([
                        'message' => 'Store not found or does not belong to current tenant',
                        'debug_info' => [
                            'store_id' => $request->store_id,
                            'tenant_id' => Auth::user()->tenant_id,
                        ]
                    ], 422);
                }

                // Auto-create the store provider configuration
                $storeDigitalProvider = StoreDigitalProvider::create([
                    'tenant_id' => Auth::user()->tenant_id,
                    'store_id' => $request->store_id,
                    'digital_provider_id' => $request->digital_provider_id,
                    'balance' => 0,
                    'is_active' => true,
                    'settings' => null,
                ]);

                \Log::info('Auto-created store provider configuration for balance request', [
                    'store_provider_id' => $storeDigitalProvider->id,
                    'store_id' => $request->store_id,
                    'digital_provider_id' => $request->digital_provider_id,
                ]);

            } catch (\Exception $e) {
                \Log::error('Failed to auto-create store provider configuration for balance request', [
                    'error' => $e->getMessage(),
                    'store_id' => $request->store_id,
                    'digital_provider_id' => $request->digital_provider_id,
                    'tenant_id' => Auth::user()->tenant_id,
                ]);

                return response()->json([
                    'message' => 'Provider not configured for this store and auto-creation failed. Please contact administrator.',
                    'error' => $e->getMessage(),
                    'debug_info' => [
                        'store_id' => $request->store_id,
                        'digital_provider_id' => $request->digital_provider_id,
                        'tenant_id' => Auth::user()->tenant_id,
                    ]
                ], 422);
            }
        }

        return response()->json([
            'data' => [
                'balance' => $storeDigitalProvider->balance,
                'is_active' => $storeDigitalProvider->is_active,
            ],
            'message' => 'Balance retrieved successfully',
        ]);
    }
}
