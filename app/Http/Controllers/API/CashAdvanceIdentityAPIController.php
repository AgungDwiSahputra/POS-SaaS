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
            'Cash Advance Identities retrieved successfully.'
        );
    }

    public function store(CreateCashAdvanceIdentityRequest $request): JsonResponse
    {
        $input = $request->all();

        $cashAdvanceIdentity = $this->cashAdvanceIdentityRepository->storeCashAdvanceIdentity($input);

        return $this->sendResponse(
            $cashAdvanceIdentity->toArray(),
            'Cash Advance Identity saved successfully.'
        );
    }

    public function show($id): JsonResponse
    {
        $cashAdvanceIdentity = $this->cashAdvanceIdentityRepository->find($id);

        if (empty($cashAdvanceIdentity)) {
            return $this->sendError('Cash Advance Identity not found');
        }

        return $this->sendResponse(
            $cashAdvanceIdentity->toArray(),
            'Cash Advance Identity retrieved successfully.'
        );
    }

    public function update($id, UpdateCashAdvanceIdentityRequest $request): JsonResponse
    {
        $cashAdvanceIdentity = $this->cashAdvanceIdentityRepository->find($id);

        if (empty($cashAdvanceIdentity)) {
            return $this->sendError('Cash Advance Identity not found');
        }

        $input = $request->all();

        $cashAdvanceIdentity = $this->cashAdvanceIdentityRepository->update($input, $id);

        return $this->sendResponse(
            $cashAdvanceIdentity->toArray(),
            'Cash Advance Identity updated successfully.'
        );
    }

    public function destroy($id): JsonResponse
    {
        $cashAdvanceIdentity = $this->cashAdvanceIdentityRepository->find($id);

        if (empty($cashAdvanceIdentity)) {
            return $this->sendError('Cash Advance Identity not found');
        }

        $cashAdvanceIdentity->delete();

        return $this->sendSuccess('Cash Advance Identity deleted successfully.');
    }

    public function getIdentitiesWithSummary(Request $request): JsonResponse
    {
        try {
            $identities = $this->cashAdvanceIdentityRepository->getIdentitiesWithSummary($request->all());

            return $this->sendResponse(
                $identities->toArray(),
                'Cash Advance Identities with summary retrieved successfully.'
            );
        } catch (\Exception $e) {
            return $this->sendError('Error retrieving identities: ' . $e->getMessage());
        }
    }

    public function getIdentityWithHistory($id): JsonResponse
    {
        $identity = $this->cashAdvanceIdentityRepository->getIdentityWithHistory($id);

        return $this->sendResponse(
            $identity->toArray(),
            'Cash Advance Identity with history retrieved successfully.'
        );
    }

    public function getActiveIdentitiesForSelect(): JsonResponse
    {
        $identities = $this->cashAdvanceIdentityRepository->getActiveIdentitiesForSelect();

        return $this->sendResponse(
            $identities->toArray(),
            'Active identities for select retrieved successfully.'
        );
    }
}
