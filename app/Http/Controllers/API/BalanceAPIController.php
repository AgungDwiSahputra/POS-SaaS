<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateBalanceRequest;
use App\Http\Resources\BalanceCollection;
use App\Http\Resources\BalanceResource;
use App\Models\BalanceRequest;
use App\Models\Role;
use App\Repositories\BalanceRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Exception;
use Prettus\Validator\Exceptions\ValidatorException;

/**
 * Class BalanceAPIController
 */
class BalanceAPIController extends AppBaseController
{
    /** @var BalanceRepository */
    private $balanceRepository;

    public function __construct(BalanceRepository $balanceRepository)
    {
        $this->balanceRepository = $balanceRepository;
    }

    public function index(Request $request): BalanceCollection
    {
        Log::info('BalanceAPIController: index called', ['request' => $request->all()]);
        $perPage = getPageSize($request);
        $balanceRequests = $this->balanceRepository->paginate($perPage);
        Log::info('BalanceAPIController: balance requests fetched', ['count' => $balanceRequests->count()]);
        BalanceResource::usingWithCollection();

        return new BalanceCollection($balanceRequests);
    }

    /**
     * @throws ValidatorException
     */
    public function store(CreateBalanceRequest $request): BalanceResource
    {
        Log::info('BalanceAPIController: store called', ['input' => $request->all()]);
        $input = $request->all();
        $input['user_id'] = Auth::id(); // Set user_id to current authenticated user
        $balanceRequest = $this->balanceRepository->create($input);
        Log::info('BalanceAPIController: balance request created', ['id' => $balanceRequest->id]);

        return new BalanceResource($balanceRequest);
    }

    public function show($id): BalanceResource
    {
        $balanceRequest = $this->balanceRepository->find($id);

        return new BalanceResource($balanceRequest);
    }

    /**
     * Approve a balance request
     */
    public function approve($id, Request $request)
    {
        Log::info('BalanceAPIController: approve called', ['id' => $id]);

        // Check if user has ADMIN role
        if (!Auth::user()->hasRole(Role::ADMIN)) {
            return $this->sendError('Only ADMIN can approve balance requests', 403);
        }

        try {
            $approvedRequest = $this->balanceRepository->approve($id);
            Log::info('BalanceAPIController: balance request approved', ['id' => $approvedRequest->id]);

            return new BalanceResource($approvedRequest);
        } catch (Exception $e) {
            Log::error('BalanceAPIController: approve failed', ['id' => $id, 'error' => $e->getMessage()]);
            return $this->sendError($e->getMessage(), 400);
        }
    }

    /**
     * Reject a balance request
     */
    public function reject($id, Request $request)
    {
        Log::info('BalanceAPIController: reject called', ['id' => $id]);

        // Check if user has ADMIN role
        if (!Auth::user()->hasRole(Role::ADMIN)) {
            return $this->sendError('Only ADMIN can reject balance requests', 403);
        }

        $balanceRequest = $this->balanceRepository->find($id);

        if (!$balanceRequest) {
            return $this->sendError('Balance request not found', 404);
        }

        if (!$balanceRequest->isPending()) {
            return $this->sendError('Only pending requests can be rejected', 400);
        }

        $rejectedRequest = $this->balanceRepository->reject($id);
        Log::info('BalanceAPIController: balance request rejected', ['id' => $rejectedRequest->id]);

        return new BalanceResource($rejectedRequest);
    }
}
