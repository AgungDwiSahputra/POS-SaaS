<?php

namespace App\Http\Controllers;

use App\Enums\DigitalProductStatus;
use App\Models\DigitalTopupRequest;
use App\Models\StoreDigitalProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DigitalTopupRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $storeId = $request->get('store_id');
        $status = $request->get('status');

        $baseQuery = DigitalTopupRequest::where('tenant_id', Auth::user()->tenant_id)
            ->with(['store', 'digitalProvider', 'requestedBy', 'approvedBy']);

        if ($storeId) {
            $baseQuery->where('store_id', $storeId);
        }

        $filteredQuery = clone $baseQuery;

        if ($status) {
            $filteredQuery->where('status', $status);
        }

        $topupRequests = $filteredQuery->orderBy('created_at', 'desc')->get();

        $pendingCount = (clone $baseQuery)
            ->where('status', DigitalProductStatus::PENDING->value)
            ->count();

        return response()->json([
            'data' => $topupRequests->map->asJsonResource(),
            'total' => $topupRequests->count(),
            'pending_count' => $pendingCount,
            'message' => 'Topup requests retrieved successfully',
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
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|min:10|max:500',
        ]);

        if ($validator->fails()) {
            \Log::error('DigitalTopupRequest validation failed', [
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

        // Check if provider is configured for the store
        $storeProvider = StoreDigitalProvider::where('tenant_id', Auth::user()->tenant_id)
                                           ->where('store_id', $request->store_id)
                                           ->where('digital_provider_id', $request->digital_provider_id)
                                           ->first();

        if (!$storeProvider) {
            \Log::info('Provider not configured for store, attempting to auto-create', [
                'store_id' => $request->store_id,
                'digital_provider_id' => $request->digital_provider_id,
                'tenant_id' => Auth::user()->tenant_id,
                'user_id' => Auth::id(),
            ]);

            try {
                // Verify store exists and belongs to tenant
                $store = \App\Models\Store::where('id', $request->store_id)
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
                $storeProvider = StoreDigitalProvider::create([
                    'tenant_id' => Auth::user()->tenant_id,
                    'store_id' => $request->store_id,
                    'digital_provider_id' => $request->digital_provider_id,
                    'balance' => 0,
                    'is_active' => true,
                    'settings' => null,
                ]);

                \Log::info('Auto-created store provider configuration', [
                    'store_provider_id' => $storeProvider->id,
                    'store_id' => $request->store_id,
                    'digital_provider_id' => $request->digital_provider_id,
                ]);

            } catch (\Exception $e) {
                \Log::error('Failed to auto-create store provider configuration', [
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

        $topupRequest = DigitalTopupRequest::create([
            'tenant_id' => Auth::user()->tenant_id,
            'store_id' => $request->store_id,
            'digital_provider_id' => $request->digital_provider_id,
            'requested_by' => Auth::id(),
            'amount' => $request->amount,
            'reason' => $request->reason,
        ]);

        $topupRequest->load(['store', 'digitalProvider', 'requestedBy', 'approvedBy']);

        return response()->json([
            'data' => $topupRequest->asJsonResource(),
            'message' => 'Topup request created successfully',
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $topupRequest = DigitalTopupRequest::where('tenant_id', Auth::user()->tenant_id)
                                          ->with(['store', 'digitalProvider', 'requestedBy', 'approvedBy'])
                                          ->find($id);

        if (!$topupRequest) {
            return response()->json([
                'message' => 'Topup request not found',
            ], 404);
        }

        $topupRequest->load(['store', 'digitalProvider', 'requestedBy', 'approvedBy']);

        return response()->json([
            'data' => $topupRequest->asJsonResource(),
            'message' => 'Topup request retrieved successfully',
        ]);
    }

    /**
     * Approve the topup request
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        $topupRequest = DigitalTopupRequest::where('tenant_id', Auth::user()->tenant_id)
                                          ->find($id);

        if (!$topupRequest) {
            return response()->json([
                'message' => 'Topup request not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'admin_notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        if (!$topupRequest->approve(Auth::user(), $request->admin_notes)) {
            return response()->json([
                'message' => 'Cannot approve this request',
            ], 422);
        }

        $topupRequest->load(['store', 'digitalProvider', 'requestedBy', 'approvedBy']);

        return response()->json([
            'data' => $topupRequest->asJsonResource(),
            'message' => 'Topup request approved successfully',
        ]);
    }

    /**
     * Reject the topup request
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        $topupRequest = DigitalTopupRequest::where('tenant_id', Auth::user()->tenant_id)
                                          ->find($id);

        if (!$topupRequest) {
            return response()->json([
                'message' => 'Topup request not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'admin_notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        if (!$topupRequest->reject(Auth::user(), $request->admin_notes)) {
            return response()->json([
                'message' => 'Cannot reject this request',
            ], 422);
        }

        $topupRequest->load(['store', 'digitalProvider', 'requestedBy', 'approvedBy']);

        return response()->json([
            'data' => $topupRequest->asJsonResource(),
            'message' => 'Topup request rejected successfully',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $topupRequest = DigitalTopupRequest::where('tenant_id', Auth::user()->tenant_id)
                                          ->find($id);

        if (!$topupRequest) {
            return response()->json([
                'message' => 'Topup request not found',
            ], 404);
        }

        // Only allow editing pending requests
        if ($topupRequest->status !== DigitalProductStatus::PENDING->value) {
            return response()->json([
                'message' => 'Only pending requests can be edited',
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|min:10|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $topupRequest->update([
            'amount' => $request->amount,
            'reason' => $request->reason,
        ]);

        $topupRequest->load(['store', 'digitalProvider', 'requestedBy', 'approvedBy']);

        return response()->json([
            'data' => $topupRequest->asJsonResource(),
            'message' => 'Topup request updated successfully',
        ]);
    }

    /**
     * Complete the topup request (add balance)
     */
    public function complete(string $id): JsonResponse
    {
        $topupRequest = DigitalTopupRequest::where('tenant_id', Auth::user()->tenant_id)
                                          ->find($id);

        if (!$topupRequest) {
            return response()->json([
                'message' => 'Topup request not found',
            ], 404);
        }

        if (!$topupRequest->complete()) {
            return response()->json([
                'message' => 'Cannot complete this request',
            ], 422);
        }

        $topupRequest->load(['store', 'digitalProvider', 'requestedBy', 'approvedBy']);

        return response()->json([
            'data' => $topupRequest->asJsonResource(),
            'message' => 'Topup request completed successfully',
        ]);
    }

    /**
     * Get pending requests for approval
     */
    public function getPendingRequests(): JsonResponse
    {
        $requests = DigitalTopupRequest::where('tenant_id', Auth::user()->tenant_id)
                                      ->where('status', DigitalProductStatus::PENDING->value)
                                      ->with(['store', 'digitalProvider', 'requestedBy'])
                                      ->orderBy('created_at', 'asc')
                                      ->get();

        return response()->json([
            'data' => $requests->map->asJsonResource(),
            'total' => $requests->count(),
            'message' => 'Pending topup requests retrieved successfully',
        ]);
    }
}
