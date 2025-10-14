<?php

namespace App\Http\Controllers;

use App\Enums\DigitalProductStatus;
use App\Models\DigitalSale;
use App\Models\StoreDigitalProvider;
use App\Services\DigitalProviderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class DigitalSaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $storeId = $request->get('store_id');
        $providerId = $request->get('digital_provider_id');
        $status = $request->get('status');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $query = DigitalSale::where('tenant_id', Auth::user()->tenant_id)
                           ->with(['store', 'digitalProvider', 'digitalProduct', 'user']);

        if ($storeId) {
            $query->where('store_id', $storeId);
        }

        if ($providerId) {
            $query->where('digital_provider_id', $providerId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        }

        $digitalSales = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $digitalSales->map(function ($sale) {
                return $sale->prepareAttributes();
            }),
            'total' => $digitalSales->count(),
            'message' => 'Digital sales retrieved successfully',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $statusValues = array_map(fn ($status) => $status->value, DigitalProductStatus::values());

        $validator = Validator::make($request->all(), [
            'store_id' => 'required|exists:stores,id',
            'digital_provider_id' => 'required|exists:digital_providers,id',
            'digital_product_id' => 'required|exists:digital_products,id',
            'cost_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'notes' => 'nullable|string|max:500',
            'status' => ['nullable', Rule::in($statusValues)],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check if provider is configured for the store
        $storeProvider = StoreDigitalProvider::where('store_id', $request->store_id)
                                           ->where('digital_provider_id', $request->digital_provider_id)
                                           ->where('is_active', true)
                                           ->first();

        if (!$storeProvider) {
            return response()->json([
                'message' => 'Provider not configured for this store',
            ], 422);
        }

        // Check if balance is sufficient
        if (!$storeProvider->hasSufficientBalance($request->cost_price)) {
            return response()->json([
                'message' => 'Insufficient balance for this transaction',
            ], 422);
        }

        try {
            DB::beginTransaction();

            $oldBalance = $storeProvider->balance;

            // Create digital sale
            $status = $request->status ?? DigitalProductStatus::COMPLETED->value;

            $digitalSale = DigitalSale::create([
                'tenant_id' => Auth::user()->tenant_id,
                'date' => now()->toDateString(),
                'store_id' => $request->store_id,
                'digital_provider_id' => $request->digital_provider_id,
                'digital_product_id' => $request->digital_product_id,
                'user_id' => Auth::id(),
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'cost_price' => $request->cost_price,
                'sell_price' => $request->sell_price,
                'provider_balance_before' => $oldBalance,
                'provider_balance_after' => $oldBalance - $request->cost_price,
                'status' => $status,
                'notes' => $request->notes,
                'completed_at' => $status === DigitalProductStatus::COMPLETED->value ? now() : null,
            ]);

            // Deduct balance from store provider
            $storeProvider->deductBalance($request->cost_price);

            DB::commit();

            $digitalSale->load(['store', 'digitalProvider', 'digitalProduct', 'user']);

            return response()->json([
                'data' => $digitalSale->prepareAttributes(),
                'message' => 'Digital sale created successfully',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create digital sale',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $digitalSale = DigitalSale::where('tenant_id', Auth::user()->tenant_id)
                                 ->with(['store', 'digitalProvider', 'digitalProduct', 'user'])
                                 ->find($id);

        if (!$digitalSale) {
            return response()->json([
                'message' => 'Digital sale not found',
            ], 404);
        }

        return response()->json([
            'data' => $digitalSale->prepareAttributes(),
            'message' => 'Digital sale retrieved successfully',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $digitalSale = DigitalSale::where('tenant_id', Auth::user()->tenant_id)
                                 ->find($id);

        if (!$digitalSale) {
            return response()->json([
                'message' => 'Digital sale not found',
            ], 404);
        }

        $statusValues = array_map(fn ($status) => $status->value, DigitalProductStatus::values());

        $validator = Validator::make($request->all(), [
            'store_id' => 'required|exists:stores,id',
            'digital_provider_id' => 'required|exists:digital_providers,id',
            'digital_product_id' => 'required|exists:digital_products,id',
            'cost_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'notes' => 'nullable|string|max:500',
            'status' => ['nullable', Rule::in($statusValues)],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $oldStoreProvider = StoreDigitalProvider::where('store_id', $digitalSale->store_id)
                ->where('digital_provider_id', $digitalSale->digital_provider_id)
                ->lockForUpdate()
                ->first();

            if (!$oldStoreProvider) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Konfigurasi provider lama tidak ditemukan',
                ], 422);
            }

            $newStoreProvider = StoreDigitalProvider::where('store_id', $request->store_id)
                ->where('digital_provider_id', $request->digital_provider_id)
                ->where('is_active', true)
                ->lockForUpdate()
                ->first();

            if (!$newStoreProvider) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Provider tidak dikonfigurasi untuk store yang dipilih',
                ], 422);
            }

            $oldCost = (float) $digitalSale->cost_price;
            $newCost = (float) $request->cost_price;

            if ($oldStoreProvider->id === $newStoreProvider->id) {
                $difference = round($newCost - $oldCost, 2);

                if ($difference > 0 && !$newStoreProvider->hasSufficientBalance($difference)) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Saldo provider tidak mencukupi untuk penyesuaian harga beli',
                    ], 422);
                }

                if ($difference !== 0.0) {
                    $adjustmentDescription = $difference > 0
                        ? "Penyesuaian penjualan digital #{$digitalSale->reference_code} (kenaikan HPP)"
                        : "Penyesuaian penjualan digital #{$digitalSale->reference_code} (penurunan HPP)";

                    if (!$newStoreProvider->applyAdjustment(-$difference, $adjustmentDescription, [
                        'sale_id' => $digitalSale->id,
                        'reference_code' => $digitalSale->reference_code,
                        'adjustment_amount' => $difference,
                    ])) {
                        DB::rollBack();
                        return response()->json([
                            'message' => 'Gagal melakukan penyesuaian saldo provider',
                        ], 422);
                    }
                }
            } else {
                if ($oldCost > 0) {
                    $oldStoreProvider->applyAdjustment(
                        $oldCost,
                        "Pengembalian saldo atas perubahan penjualan #{$digitalSale->reference_code}",
                        [
                            'sale_id' => $digitalSale->id,
                            'reference_code' => $digitalSale->reference_code,
                            'adjustment_type' => 'refund_previous_provider',
                        ]
                    );
                }

                if ($newCost > 0 && !$newStoreProvider->hasSufficientBalance($newCost)) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Saldo provider baru tidak mencukupi untuk penjualan ini',
                    ], 422);
                }

                if ($newCost > 0 && !$newStoreProvider->applyAdjustment(
                    -$newCost,
                    "Pemotongan saldo untuk penjualan digital #{$digitalSale->reference_code}",
                    [
                        'sale_id' => $digitalSale->id,
                        'reference_code' => $digitalSale->reference_code,
                        'adjustment_type' => 'apply_new_provider',
                    ]
                )) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Gagal memotong saldo provider baru',
                    ], 422);
                }
            }

            $providerBalanceAfter = $newStoreProvider->balance;
            $providerBalanceBefore = $providerBalanceAfter + $newCost;

            $newStatus = $request->status ?? $digitalSale->status;

            $digitalSale->update([
                'store_id' => $request->store_id,
                'digital_provider_id' => $request->digital_provider_id,
                'digital_product_id' => $request->digital_product_id,
                'cost_price' => $newCost,
                'sell_price' => $request->sell_price,
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'notes' => $request->notes,
                'status' => $newStatus,
                'provider_balance_before' => $providerBalanceBefore,
                'provider_balance_after' => $providerBalanceAfter,
                'completed_at' => $newStatus === DigitalProductStatus::COMPLETED->value ? ($digitalSale->completed_at ?? now()) : null,
            ]);

            DB::commit();

            $digitalSale->load(['store', 'digitalProvider', 'digitalProduct', 'user']);
        } catch (\Exception $exception) {
            DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan saat memperbarui penjualan digital',
                'error' => $exception->getMessage(),
            ], 500);
        }

        return response()->json([
            'data' => $digitalSale->prepareAttributes(),
            'message' => 'Digital sale updated successfully',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $digitalSale = DigitalSale::where('tenant_id', Auth::user()->tenant_id)
                                 ->find($id);

        if (!$digitalSale) {
            return response()->json([
                'message' => 'Digital sale not found',
            ], 404);
        }

        DB::beginTransaction();

        try {
            $storeProvider = StoreDigitalProvider::where('store_id', $digitalSale->store_id)
                ->where('digital_provider_id', $digitalSale->digital_provider_id)
                ->lockForUpdate()
                ->first();

            if ($storeProvider && $digitalSale->cost_price > 0) {
                $storeProvider->applyAdjustment(
                    (float) $digitalSale->cost_price,
                    "Pengembalian saldo akibat penghapusan penjualan digital #{$digitalSale->reference_code}",
                    [
                        'sale_id' => $digitalSale->id,
                        'reference_code' => $digitalSale->reference_code,
                        'adjustment_type' => 'delete_sale',
                    ]
                );
            }

            $digitalSale->delete();

            DB::commit();
        } catch (\Exception $exception) {
            DB::rollBack();

            return response()->json([
                'message' => 'Gagal menghapus penjualan digital',
                'error' => $exception->getMessage(),
            ], 500);
        }

        return response()->json([
            'message' => 'Digital sale deleted successfully',
        ]);
    }

    /**
     * Get sales by store
     */
    public function getByStore(Request $request, string $storeId): JsonResponse
    {
        $sales = DigitalSale::where('tenant_id', Auth::user()->tenant_id)
                           ->where('store_id', $storeId)
                           ->with(['digitalProvider', 'digitalProduct'])
                           ->orderBy('created_at', 'desc')
                           ->get();

        return response()->json([
            'data' => $sales->map(function ($sale) {
                return $sale->prepareAttributes();
            }),
            'message' => 'Digital sales by store retrieved successfully',
        ]);
    }

    /**
     * Get sales summary for dashboard
     */
    public function getSummary(Request $request): JsonResponse
    {
        $storeId = $request->get('store_id');
        $startDate = $request->get('start_date', now()->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());

        $query = DigitalSale::where('tenant_id', Auth::user()->tenant_id)
                           ->where('status', DigitalProductStatus::COMPLETED->value)
                           ->whereBetween('date', [$startDate, $endDate]);

        if ($storeId) {
            $query->where('store_id', $storeId);
        }

        $sales = $query->get();

        $summary = [
            'total_sales' => $sales->count(),
            'total_amount' => $sales->sum('sell_price'),
            'total_cost' => $sales->sum('cost_price'),
            'total_margin' => $sales->sum('margin'),
            'average_margin' => $sales->count() > 0 ? $sales->sum('margin') / $sales->count() : 0,
        ];

        return response()->json([
            'data' => $summary,
            'message' => 'Digital sales summary retrieved successfully',
        ]);
    }
}
