<?php

namespace App\Repositories;

use App\Models\CashAdvance;
use App\Models\CashAdvancePayment;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class CashAdvanceRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'date',
        'issued_to_name',
        'issued_to_phone',
        'issued_to_email',
        'amount',
        'reference_code',
        'notes',
        'created_at',
    ];

    public function getAvailableRelations(): array
    {
        return array_values(CashAdvance::$availableRelations);
    }

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model()
    {
        return CashAdvance::class;
    }

    /**
     * @return LengthAwarePaginator|Collection|mixed
     */
    public function storeCashAdvance(array $input)
    {
        try {
            DB::beginTransaction();
            if (empty($input['recorded_by']) && Auth::check()) {
                $input['recorded_by'] = Auth::id();
            }

            $input['paid_amount'] = $input['paid_amount'] ?? 0;
            $input['status'] = $input['status'] ?? CashAdvance::STATUS_PENDING;

            /** @var CashAdvance $cashAdvance */
            $cashAdvance = $this->create($input);
            $prefix = getSettingValue('cash_advance_code') ?? 'CA';
            $cashAdvance->update([
                'reference_code' => $prefix . '_11' . $cashAdvance->id,
            ]);
            DB::commit();

            return $cashAdvance;
        } catch (Exception $exception) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }

    /**
     * @throws UnprocessableEntityHttpException
     */
    public function addPayment(CashAdvance $cashAdvance, array $input): CashAdvancePayment
    {
        try {
            DB::beginTransaction();

            if (empty($input['recorded_by']) && Auth::check()) {
                $input['recorded_by'] = Auth::id();
            }

            $input['cash_advance_id'] = $cashAdvance->id;

            $payment = CashAdvancePayment::create($input);

            $this->recalculatePaidAmount($cashAdvance);

            DB::commit();

            return $payment;
        } catch (Exception $exception) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }

    public function recalculatePaidAmount(CashAdvance $cashAdvance): CashAdvance
    {
        $totalPaid = $cashAdvance->payments()->sum('amount');
        $status = $totalPaid >= $cashAdvance->amount
            ? CashAdvance::STATUS_PAID
            : CashAdvance::STATUS_PENDING;

        $cashAdvance->update([
            'paid_amount' => $totalPaid,
            'status' => $status,
        ]);

        return $cashAdvance->refresh();
    }
}
