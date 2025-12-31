<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateBalanceRequestRequest;
use App\Http\Requests\UpdateBalanceRequestRequest;
use App\Http\Resources\BalanceRequestCollection;
use App\Http\Resources\BalanceRequestResource;
use App\Models\BalanceRequest;
use App\Repositories\BalanceRequestRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Prettus\Validator\Exceptions\ValidatorException;

/**
 * Class BalanceRequestAPIController
 */
class BalanceRequestAPIController extends AppBaseController
{
    /** @var BalanceRequestRepository */
    private $balanceRequestRepository;

    public function __construct(BalanceRequestRepository $balanceRequestRepository)
    {
        $this->balanceRequestRepository = $balanceRequestRepository;
    }

    public function index(Request $request): BalanceRequestCollection
    {
        Log::info('BalanceRequestAPIController: index called', ['request' => $request->all()]);
        $perPage = getPageSize($request);

        $query = BalanceRequest::with(['provider', 'requestedBy', 'processedBy'])
            ->orderBy('created_at', 'desc');

        // Filter by requested_by for non-admin users
        $user = auth()->user();
        if ($user && !$user->hasRole('admin')) {
            $query->where('requested_by', $user->id);
        }

        // Filter by status if provided
        if ($request->has('status') && !empty($request->input('status'))) {
            $query->where('status', $request->input('status'));
        }

        // Filter by provider if provided
        if ($request->has('provider_id') && !empty($request->input('provider_id'))) {
            $query->where('provider_id', $request->input('provider_id'));
        }

        $balanceRequests = $query->paginate($perPage);

        Log::info('BalanceRequestAPIController: balance requests fetched', ['count' => $balanceRequests->count()]);
        BalanceRequestResource::usingWithCollection();

        return new BalanceRequestCollection($balanceRequests);
    }

    /**
     * @throws ValidatorException
     */
    public function store(CreateBalanceRequestRequest $request): BalanceRequestResource
    {
        Log::info('BalanceRequestAPIController: store called', ['input' => $request->all()]);
        $input = $request->all();
        $balanceRequest = $this->balanceRequestRepository->create($input);
        Log::info('BalanceRequestAPIController: balance request created', ['id' => $balanceRequest->id]);

        return new BalanceRequestResource($balanceRequest->load(['provider', 'requestedBy']));
    }

    public function show($id): BalanceRequestResource
    {
        $balanceRequest = BalanceRequest::with(['provider', 'requestedBy', 'processedBy'])
            ->find($id);

        if (!$balanceRequest) {
            return $this->sendError('Balance request not found');
        }

        return new BalanceRequestResource($balanceRequest);
    }

    /**
     * Approve or Reject balance request
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        Log::info('BalanceRequestAPIController: updateStatus called', ['id' => $id, 'input' => $request->all()]);

        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $status = $request->input('status');
        $balanceRequest = $this->balanceRequestRepository->find($id);

        if (!$balanceRequest) {
            return $this->sendError('Balance request not found');
        }

        if ($balanceRequest->status !== BalanceRequest::STATUS_PENDING) {
            return $this->sendError('Only pending requests can be processed');
        }

        try {
            if ($status === 'approved') {
                $balanceRequest = $this->balanceRequestRepository->approveRequest($id, auth()->id());
                $message = 'Balance request approved successfully';
            } else {
                $balanceRequest = $this->balanceRequestRepository->rejectRequest($id, auth()->id());
                $message = 'Balance request rejected successfully';
            }

            return $this->sendResponse(
                new BalanceRequestResource($balanceRequest->load(['provider', 'requestedBy', 'processedBy'])),
                $message
            );
        } catch (\Exception $e) {
            Log::error('BalanceRequestAPIController: updateStatus error', ['error' => $e->getMessage()]);
            return $this->sendError($e->getMessage());
        }
    }

    public function destroy($id): JsonResponse
    {
        Log::info('BalanceRequestAPIController: destroy called', ['id' => $id]);

        $balanceRequest = $this->balanceRequestRepository->find($id);

        if (!$balanceRequest) {
            return $this->sendError('Balance request not found');
        }

        // Only allow deletion of pending requests
        if ($balanceRequest->status !== BalanceRequest::STATUS_PENDING) {
            return $this->sendError('Only pending requests can be deleted');
        }

        $this->balanceRequestRepository->delete($id);
        Log::info('BalanceRequestAPIController: balance request deleted', ['id' => $id]);

        return $this->sendSuccess('Balance request deleted successfully');
    }

    /**
     * Get pending requests count
     */
    public function pendingCount(): JsonResponse
    {
        $count = $this->balanceRequestRepository->getPendingCount();

        return $this->sendSuccess('Pending requests count retrieved', [
            'count' => $count,
        ]);
    }
}
