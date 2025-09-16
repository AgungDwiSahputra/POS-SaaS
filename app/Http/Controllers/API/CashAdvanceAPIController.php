<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateCashAdvanceRequest;
use App\Http\Requests\UpdateCashAdvanceRequest;
use App\Http\Resources\CashAdvanceCollection;
use App\Http\Resources\CashAdvanceResource;
use App\Models\CashAdvance;
use App\Repositories\CashAdvanceRepository;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashAdvanceAPIController extends AppBaseController
{
    public function __construct(private readonly CashAdvanceRepository $cashAdvanceRepository)
    {
    }

    public function index(Request $request): CashAdvanceCollection
    {
        $perPage = getPageSize($request);
        $cashAdvances = CashAdvance::with(['warehouse', 'recordedBy']);

        if ($request->get('warehouse_id')) {
            $cashAdvances->where('warehouse_id', $request->get('warehouse_id'));
        }

        $search = $request->filter['search'] ?? '';
        if (!empty($search)) {
            $cashAdvances->where(function (Builder $query) use ($search) {
                $query->where('issued_to_name', 'LIKE', "%{$search}%")
                    ->orWhere('issued_to_phone', 'LIKE', "%{$search}%")
                    ->orWhere('issued_to_email', 'LIKE', "%{$search}%")
                    ->orWhere('reference_code', 'LIKE', "%{$search}%")
                    ->orWhereHas('warehouse', function (Builder $warehouseQuery) use ($search) {
                        $warehouseQuery->where('name', 'LIKE', "%{$search}%");
                    });
            });
        }

        $cashAdvances = $cashAdvances->paginate($perPage);
        CashAdvanceResource::usingWithCollection();

        return new CashAdvanceCollection($cashAdvances);
    }

    public function store(CreateCashAdvanceRequest $request): CashAdvanceResource
    {
        $input = $request->all();
        $cashAdvance = $this->cashAdvanceRepository->storeCashAdvance($input);

        return new CashAdvanceResource($cashAdvance);
    }

    public function show(int $id): CashAdvanceResource
    {
        $cashAdvance = $this->cashAdvanceRepository->find($id);

        return new CashAdvanceResource($cashAdvance);
    }

    public function update(UpdateCashAdvanceRequest $request, int $id): CashAdvanceResource
    {
        $input = $request->all();
        $cashAdvance = $this->cashAdvanceRepository->update($input, $id);

        return new CashAdvanceResource($cashAdvance);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->cashAdvanceRepository->delete($id);

        return $this->sendSuccess('Cash advance deleted successfully');
    }
}
