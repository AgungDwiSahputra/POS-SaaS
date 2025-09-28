<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateCashAdvanceIdentityRequest;
use App\Http\Requests\UpdateCashAdvanceIdentityRequest;
use App\Models\CashAdvanceIdentity;
use App\Repositories\CashAdvanceIdentityRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashAdvanceIdentityAPIController extends AppBaseController
{
    private CashAdvanceIdentityRepository $cashAdvanceIdentityRepository;

    public function __construct(CashAdvanceIdentityRepository $cashAdvanceIdentityRepository)
    {
        $this->cashAdvanceIdentityRepository = $cashAdvanceIdentityRepository;
    }

    public function index(Request $request): JsonResponse
    {
        $cashAdvanceIdentities = CashAdvanceIdentity::withoutGlobalScopes()->get();

        return $this->sendResponse(
            $cashAdvanceIdentities->toArray(),
            __('messages.cash_advance_identity.success.retrieved.message')
        );
    }

    public function store(CreateCashAdvanceIdentityRequest $request): JsonResponse
    {
        $input = $request->all();

        $cashAdvanceIdentity = $this->cashAdvanceIdentityRepository->storeCashAdvanceIdentity($input);

        return $this->sendResponse(
            $cashAdvanceIdentity->toArray(),
            __('messages.cash_advance_identity.success.create.message')
        );
    }

    public function show($id): JsonResponse
    {
        $cashAdvanceIdentity = $this->cashAdvanceIdentityRepository->find($id);

        if (empty($cashAdvanceIdentity)) {
            return $this->sendError(__('messages.cash_advance_identity.not.found'));
        }

        return $this->sendResponse(
            $cashAdvanceIdentity->toArray(),
            __('messages.cash_advance_identity.success.retrieved.message')
        );
    }

    public function update($id, UpdateCashAdvanceIdentityRequest $request): JsonResponse
    {
        $cashAdvanceIdentity = $this->cashAdvanceIdentityRepository->find($id);

        if (empty($cashAdvanceIdentity)) {
            return $this->sendError(__('messages.cash_advance_identity.not.found'));
        }

        $input = $request->all();

        $cashAdvanceIdentity = $this->cashAdvanceIdentityRepository->update($input, $id);

        return $this->sendResponse(
            $cashAdvanceIdentity->toArray(),
            __('messages.cash_advance_identity.success.edit.message')
        );
    }

    public function destroy($id): JsonResponse
    {
        $cashAdvanceIdentity = $this->cashAdvanceIdentityRepository->find($id);

        if (empty($cashAdvanceIdentity)) {
            return $this->sendError(__('messages.cash_advance_identity.not.found'));
        }

        $cashAdvanceIdentity->delete();

        return $this->sendSuccess(__('messages.cash_advance_identity.success.delete.message'));
    }

    public function getIdentitiesWithSummary(Request $request): JsonResponse
    {
        try {
            $identities = $this->cashAdvanceIdentityRepository->getIdentitiesWithSummary($request->all());

            return $this->sendResponse(
                $identities->toArray(),
                __('messages.cash_advance_identity.success.summary_retrieved.message')
            );
        } catch (\Exception $e) {
            return $this->sendError(__('messages.cash_advance_identity.error.retrieving') . ': ' . $e->getMessage());
        }
    }

    public function getIdentityWithHistory($id): JsonResponse
    {
        $identity = $this->cashAdvanceIdentityRepository->getIdentityWithHistory($id);

        return $this->sendResponse(
            $identity->toArray(),
            __('messages.cash_advance_identity.success.history_retrieved.message')
        );
    }

    public function getActiveIdentitiesForSelect(): JsonResponse
    {
        $identities = $this->cashAdvanceIdentityRepository->getActiveIdentitiesForSelect();

        return $this->sendResponse(
            $identities->toArray(),
            __('messages.cash_advance_identity.success.active_retrieved.message')
        );
    }
}
