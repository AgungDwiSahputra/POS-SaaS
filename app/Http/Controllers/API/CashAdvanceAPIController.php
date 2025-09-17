<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateCashAdvancePaymentRequest;
use App\Http\Requests\CreateCashAdvanceRequest;
use App\Http\Requests\UpdateCashAdvanceRequest;
use App\Http\Resources\CashAdvanceCollection;
use App\Http\Resources\CashAdvancePaymentCollection;
use App\Http\Resources\CashAdvancePaymentResource;
use App\Http\Resources\CashAdvanceResource;
use App\Models\CashAdvance;
use App\Models\CashAdvancePayment;
use App\Repositories\CashAdvanceRepository;
use Carbon\Carbon;
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
        $cashAdvances = CashAdvance::with(['warehouse', 'recordedBy'])->withCount('payments');

        if ($request->get('warehouse_id')) {
            $cashAdvances->where('warehouse_id', $request->get('warehouse_id'));
        }

        if ($request->filled('recorded_by')) {
            $cashAdvances->where('recorded_by', $request->get('recorded_by'));
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $start = Carbon::parse($request->get('start_date'))->startOfDay();
            $end = Carbon::parse($request->get('end_date'))->endOfDay();
            $cashAdvances->whereBetween('date', [$start, $end]);
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

        $summaryQuery = clone $cashAdvances;

        $paidCount = (clone $summaryQuery)->where('status', CashAdvance::STATUS_PAID)->count();
        $pendingCount = (clone $summaryQuery)->where('status', CashAdvance::STATUS_PENDING)->count();

        if ($request->filled('status') && $request->get('status') !== 'all') {
            $cashAdvances->where('status', $request->get('status'));
        }

        $cashAdvances = $cashAdvances->paginate($perPage);
        CashAdvanceResource::usingWithCollection();

        return (new CashAdvanceCollection($cashAdvances))->additional([
            'summary' => [
                'paid_off' => $paidCount,
                'pending' => $pendingCount,
            ],
            'meta' => [
                'total' => $cashAdvances->total(),
            ],
        ]);
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

    public function payments(CashAdvance $cashAdvance): CashAdvancePaymentCollection
    {
        $payments = $cashAdvance->payments()->with('recordedBy')->orderByDesc('paid_on')->get();
        CashAdvancePaymentResource::usingWithCollection();

        return (new CashAdvancePaymentCollection($payments))->additional([
            'summary' => [
                'total_paid' => $cashAdvance->payments()->sum('amount'),
                'outstanding' => max(0, $cashAdvance->amount - $cashAdvance->paid_amount),
            ],
        ]);
    }

    public function storePayment(CreateCashAdvancePaymentRequest $request, CashAdvance $cashAdvance): JsonResponse
    {
        $input = $request->validated();

        $payment = $this->cashAdvanceRepository->addPayment($cashAdvance, $input);
        $cashAdvance->refresh();

        return $this->sendResponse([
            'cash_advance' => new CashAdvanceResource($cashAdvance->load(['warehouse', 'recordedBy'])),
            'payment' => new CashAdvancePaymentResource($payment->load('recordedBy')),
        ], 'Payment recorded successfully');
    }

    public function report(Request $request): CashAdvanceCollection
    {
        $perPage = getPageSize($request);

        $cashAdvances = CashAdvance::with(['warehouse', 'recordedBy'])->withCount('payments');

        if ($request->filled('recorded_by')) {
            $cashAdvances->where('recorded_by', $request->get('recorded_by'));
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $start = Carbon::parse($request->get('start_date'))->startOfDay();
            $end = Carbon::parse($request->get('end_date'))->endOfDay();
            $cashAdvances->whereBetween('date', [$start, $end]);
        }

        if ($request->filled('status') && $request->get('status') !== 'all') {
            $cashAdvances->where('status', $request->get('status'));
        }

        $search = $request->filter['search'] ?? '';
        if (!empty($search)) {
            $cashAdvances->where(function (Builder $query) use ($search) {
                $query->where('issued_to_name', 'LIKE', "%{$search}%")
                    ->orWhere('reference_code', 'LIKE', "%{$search}%");
            });
        }

        $summaryQuery = clone $cashAdvances;
        $totals = [
            'total_amount' => (clone $summaryQuery)->sum('amount'),
            'total_paid' => (clone $summaryQuery)->sum('paid_amount'),
            'total_outstanding' => (clone $summaryQuery)->selectRaw('SUM(GREATEST(amount - paid_amount, 0)) as outstanding')->value('outstanding') ?? 0,
            'paid_off' => (clone $summaryQuery)->where('status', CashAdvance::STATUS_PAID)->count(),
            'pending' => (clone $summaryQuery)->where('status', CashAdvance::STATUS_PENDING)->count(),
        ];

        $cashAdvances = $cashAdvances->paginate($perPage);
        CashAdvanceResource::usingWithCollection();

        return (new CashAdvanceCollection($cashAdvances))->additional([
            'summary' => $totals,
            'meta' => [
                'total' => $cashAdvances->total(),
            ],
        ]);
    }
}
