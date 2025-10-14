<?php

namespace App\Http\Controllers;

use App\Models\DigitalWithdrawal;
use App\Models\StoreDigitalProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DigitalWithdrawalController extends Controller
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

        $query = DigitalWithdrawal::where('tenant_id', Auth::user()->tenant_id)
                                 ->with(['store', 'digitalProvider', 'user']);

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

        $digitalWithdrawals = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $digitalWithdrawals->map(function ($withdrawal) {
                return $withdrawal->prepareAttributes();
            }),
            'message' => 'Digital withdrawals retrieved successfully',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'store_id' => 'required|exists:stores,id',
            'digital_provider_id' => 'required|exists:digital_providers,id',
            'customer_name' => 'required|string|max:255',
            'withdrawal_amount' => 'required|numeric|min:0.01',
            'admin_fee' => 'required|numeric|min:0',
            'customer_phone' => 'nullable|string|max:20',
            'notes' => 'nullable|string|max:500',
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
        if (!$storeProvider->hasSufficientBalance($request->withdrawal_amount)) {
            return response()->json([
                'message' => 'Insufficient balance for this withdrawal',
            ], 422);
        }

        try {
            DB::beginTransaction();

            $oldBalance = $storeProvider->balance;

            // Create digital withdrawal
            $digitalWithdrawal = DigitalWithdrawal::create([
                'tenant_id' => Auth::user()->tenant_id,
                'date' => now()->toDateString(),
                'store_id' => $request->store_id,
                'digital_provider_id' => $request->digital_provider_id,
                'user_id' => Auth::id(),
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'withdrawal_amount' => $request->withdrawal_amount,
                'admin_fee' => $request->admin_fee,
                'provider_balance_before' => $oldBalance,
                'provider_balance_after' => $oldBalance - $request->withdrawal_amount,
                'status' => 'completed',
                'notes' => $request->notes,
                'completed_at' => now(),
            ]);

            // Deduct balance from store provider (withdrawal increases balance)
            $storeProvider->addBalance($request->withdrawal_amount);

            DB::commit();

            return response()->json([
                'data' => $digitalWithdrawal->prepareAttributes(),
                'message' => 'Digital withdrawal created successfully',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create digital withdrawal',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $digitalWithdrawal = DigitalWithdrawal::where('tenant_id', Auth::user()->tenant_id)
                                             ->with(['store', 'digitalProvider', 'user'])
                                             ->find($id);

        if (!$digitalWithdrawal) {
            return response()->json([
                'message' => 'Digital withdrawal not found',
            ], 404);
        }

        return response()->json([
            'data' => $digitalWithdrawal->prepareAttributes(),
            'message' => 'Digital withdrawal retrieved successfully',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $digitalWithdrawal = DigitalWithdrawal::where('tenant_id', Auth::user()->tenant_id)
                                             ->find($id);

        if (!$digitalWithdrawal) {
            return response()->json([
                'message' => 'Digital withdrawal not found',
            ], 404);
        }

        // Only allow update if status is pending
        if ($digitalWithdrawal->status !== 'pending') {
            return response()->json([
                'message' => 'Cannot update completed withdrawal',
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|max:255',
            'withdrawal_amount' => 'required|numeric|min:0.01',
            'admin_fee' => 'required|numeric|min:0',
            'customer_phone' => 'nullable|string|max:20',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $digitalWithdrawal->update([
            'customer_name' => $request->customer_name,
            'customer_phone' => $request->customer_phone,
            'withdrawal_amount' => $request->withdrawal_amount,
            'admin_fee' => $request->admin_fee,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'data' => $digitalWithdrawal->prepareAttributes(),
            'message' => 'Digital withdrawal updated successfully',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $digitalWithdrawal = DigitalWithdrawal::where('tenant_id', Auth::user()->tenant_id)
                                             ->find($id);

        if (!$digitalWithdrawal) {
            return response()->json([
                'message' => 'Digital withdrawal not found',
            ], 404);
        }

        // Only allow delete if status is pending
        if ($digitalWithdrawal->status === 'completed') {
            return response()->json([
                'message' => 'Cannot delete completed withdrawal',
            ], 422);
        }

        $digitalWithdrawal->delete();

        return response()->json([
            'message' => 'Digital withdrawal deleted successfully',
        ]);
    }

    /**
     * Get withdrawals by store
     */
    public function getByStore(Request $request, string $storeId): JsonResponse
    {
        $withdrawals = DigitalWithdrawal::where('tenant_id', Auth::user()->tenant_id)
                                       ->where('store_id', $storeId)
                                       ->with(['digitalProvider'])
                                       ->orderBy('created_at', 'desc')
                                       ->get();

        return response()->json([
            'data' => $withdrawals->map(function ($withdrawal) {
                return $withdrawal->prepareAttributes();
            }),
            'message' => 'Digital withdrawals by store retrieved successfully',
        ]);
    }

    /**
     * Get withdrawal summary for dashboard
     */
    public function getSummary(Request $request): JsonResponse
    {
        $storeId = $request->get('store_id');
        $startDate = $request->get('start_date', now()->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());

        $query = DigitalWithdrawal::where('tenant_id', Auth::user()->tenant_id)
                                 ->where('status', 'completed')
                                 ->whereBetween('date', [$startDate, $endDate]);

        if ($storeId) {
            $query->where('store_id', $storeId);
        }

        $withdrawals = $query->get();

        $summary = [
            'total_withdrawals' => $withdrawals->count(),
            'total_withdrawal_amount' => $withdrawals->sum('withdrawal_amount'),
            'total_admin_fee' => $withdrawals->sum('admin_fee'),
            'total_amount' => $withdrawals->sum('total_amount'),
            'average_admin_fee' => $withdrawals->count() > 0 ? $withdrawals->sum('admin_fee') / $withdrawals->count() : 0,
        ];

        return response()->json([
            'data' => $summary,
            'message' => 'Digital withdrawal summary retrieved successfully',
        ]);
    }
}
