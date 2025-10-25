<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateCashAdvanceIdentityRequest;
use App\Http\Requests\UpdateCashAdvanceIdentityRequest;
use App\Models\CashAdvanceIdentity;
use App\Repositories\CashAdvanceIdentityRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CashAdvanceIdentityAPIController extends AppBaseController
{
    private CashAdvanceIdentityRepository $cashAdvanceIdentityRepository;

    public function __construct(CashAdvanceIdentityRepository $cashAdvanceIdentityRepository)
    {
        $this->cashAdvanceIdentityRepository = $cashAdvanceIdentityRepository;
    }

    public function index(Request $request): JsonResponse
    {
        Log::info('CashAdvanceIdentityAPI: Starting index request', [
            'user_id' => auth()->id(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status_filter' => $request->get('status')
        ]);

        $status = $request->get('status', 'active');
        $query = CashAdvanceIdentity::withoutGlobalScopes();

        // Apply status filtering
        if ($status === 'active') {
            $query->active();
        } elseif ($status === 'inactive') {
            $query->inactive();
        }
        // For 'all' status, no additional filtering needed

        $cashAdvanceIdentities = $query->get();

        Log::info('CashAdvanceIdentityAPI: Index request completed', [
            'user_id' => auth()->id(),
            'count' => $cashAdvanceIdentities->count(),
            'status_filter' => $status,
            'execution_time' => microtime(true)
        ]);

        return $this->sendResponse(
            $cashAdvanceIdentities->toArray(),
            __('messages.cash_advance_identity.success.retrieved.message')
        );
    }

    public function store(CreateCashAdvanceIdentityRequest $request): JsonResponse
    {
        Log::info('CashAdvanceIdentityAPI: Starting store request', [
            'user_id' => auth()->id(),
            'ip' => $request->ip(),
            'input_data' => $request->except(['password', 'password_confirmation'])
        ]);

        try {
            $input = $request->all();

            // Ensure is_active is properly handled
            if (isset($input['is_active'])) {
                $input['is_active'] = (bool) $input['is_active'];
            } else {
                $input['is_active'] = true; // Default value
            }

            $cashAdvanceIdentity = $this->cashAdvanceIdentityRepository->storeCashAdvanceIdentity($input);

            Log::info('CashAdvanceIdentityAPI: Store request completed', [
                'user_id' => auth()->id(),
                'identity_id' => $cashAdvanceIdentity->id,
                'identity_name' => $cashAdvanceIdentity->name,
                'identity_type' => $cashAdvanceIdentity->type
            ]);

            return $this->sendResponse(
                $cashAdvanceIdentity->toArray(),
                __('messages.cash_advance_identity.success.create.message')
            );
        } catch (\Exception $e) {
            Log::error('CashAdvanceIdentityAPI: Store request failed', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->sendError($e->getMessage(), 422);
        }
    }

    public function show($id): JsonResponse
    {
        Log::info('CashAdvanceIdentityAPI: Starting show request', [
            'user_id' => auth()->id(),
            'identity_id' => $id
        ]);

        $cashAdvanceIdentity = $this->cashAdvanceIdentityRepository->find($id);

        if (empty($cashAdvanceIdentity)) {
            Log::warning('CashAdvanceIdentityAPI: Identity not found', [
                'user_id' => auth()->id(),
                'identity_id' => $id
            ]);
            return $this->sendError(__('messages.cash_advance_identity.not.found'));
        }

        Log::info('CashAdvanceIdentityAPI: Show request completed', [
            'user_id' => auth()->id(),
            'identity_id' => $cashAdvanceIdentity->id,
            'identity_name' => $cashAdvanceIdentity->name
        ]);

        return $this->sendResponse(
            $cashAdvanceIdentity->toArray(),
            __('messages.cash_advance_identity.success.retrieved.message')
        );
    }

    public function update($id, UpdateCashAdvanceIdentityRequest $request): JsonResponse
    {
        Log::info('CashAdvanceIdentityAPI: Starting update request', [
            'user_id' => auth()->id(),
            'identity_id' => $id,
            'input_data' => $request->except(['password', 'password_confirmation'])
        ]);

        $cashAdvanceIdentity = $this->cashAdvanceIdentityRepository->find($id);

        if (empty($cashAdvanceIdentity)) {
            Log::warning('CashAdvanceIdentityAPI: Update failed - Identity not found', [
                'user_id' => auth()->id(),
                'identity_id' => $id
            ]);
            return $this->sendError(__('messages.cash_advance_identity.not.found'));
        }

        $input = $request->all();

        // Handle deactivated_at timestamp when status changes
        if (isset($input['is_active'])) {
            $input['is_active'] = (bool) $input['is_active'];
            if (!$input['is_active']) {
                $input['deactivated_at'] = now();
            } else {
                $input['deactivated_at'] = null;
            }
        }

        $cashAdvanceIdentity = $this->cashAdvanceIdentityRepository->update($input, $id);

        Log::info('CashAdvanceIdentityAPI: Update request completed', [
            'user_id' => auth()->id(),
            'identity_id' => $cashAdvanceIdentity->id,
            'identity_name' => $cashAdvanceIdentity->name,
            'updated_fields' => array_keys($input)
        ]);

        return $this->sendResponse(
            $cashAdvanceIdentity->toArray(),
            __('messages.cash_advance_identity.success.edit.message')
        );
    }

    public function destroy($id): JsonResponse
    {
        Log::info('CashAdvanceIdentityAPI: Starting destroy request', [
            'user_id' => auth()->id(),
            'identity_id' => $id
        ]);

        $cashAdvanceIdentity = $this->cashAdvanceIdentityRepository->find($id);

        if (empty($cashAdvanceIdentity)) {
            Log::warning('CashAdvanceIdentityAPI: Destroy failed - Identity not found', [
                'user_id' => auth()->id(),
                'identity_id' => $id
            ]);
            return $this->sendError(__('messages.cash_advance_identity.not.found'));
        }

        $identityName = $cashAdvanceIdentity->name;
        $cashAdvanceIdentity->delete();

        Log::info('CashAdvanceIdentityAPI: Destroy request completed', [
            'user_id' => auth()->id(),
            'identity_id' => $id,
            'identity_name' => $identityName
        ]);

        return $this->sendSuccess(__('messages.cash_advance_identity.success.delete.message'));
    }

    public function getIdentitiesWithSummary(Request $request): JsonResponse
    {
        Log::info('CashAdvanceIdentityAPI: Starting getIdentitiesWithSummary request', [
            'user_id' => auth()->id(),
            'ip' => $request->ip(),
            'request_params' => $request->all()
        ]);

        try {
            $identities = $this->cashAdvanceIdentityRepository->getIdentitiesWithSummary($request->all());

            Log::info('CashAdvanceIdentityAPI: getIdentitiesWithSummary request completed', [
                'user_id' => auth()->id(),
                'count' => $identities->count()
            ]);

            return $this->sendResponse(
                $identities->toArray(),
                __('messages.cash_advance_identity.success.summary_retrieved.message')
            );
        } catch (\Exception $e) {
            Log::error('CashAdvanceIdentityAPI: getIdentitiesWithSummary request failed', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->sendError(__('messages.cash_advance_identity.error.retrieving') . ': ' . $e->getMessage());
        }
    }

    public function getIdentityWithHistory($id): JsonResponse
    {
        Log::info('CashAdvanceIdentityAPI: Starting getIdentityWithHistory request', [
            'user_id' => auth()->id(),
            'identity_id' => $id
        ]);

        $identity = $this->cashAdvanceIdentityRepository->getIdentityWithHistory($id);

        Log::info('CashAdvanceIdentityAPI: getIdentityWithHistory request completed', [
            'user_id' => auth()->id(),
            'identity_id' => $identity->id,
            'identity_name' => $identity->name,
            'cash_advances_count' => $identity->cashAdvances->count() ?? 0
        ]);

        return $this->sendResponse(
            $identity->toArray(),
            __('messages.cash_advance_identity.success.history_retrieved.message')
        );
    }

    public function getActiveIdentitiesForSelect(): JsonResponse
    {
        Log::info('CashAdvanceIdentityAPI: Starting getActiveIdentitiesForSelect request', [
            'user_id' => auth()->id()
        ]);

        try {
            $identities = $this->cashAdvanceIdentityRepository->getActiveIdentitiesForSelect();

            Log::info('CashAdvanceIdentityAPI: getActiveIdentitiesForSelect request completed', [
                'user_id' => auth()->id(),
                'active_identities_count' => $identities->count()
            ]);

            return $this->sendResponse(
                $identities->toArray(),
                __('messages.cash_advance_identity.success.active_retrieved.message')
            );
        } catch (\Exception $e) {
            Log::error('CashAdvanceIdentityAPI: getActiveIdentitiesForSelect request failed', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->sendError($e->getMessage(), 500);
        }
    }
}
