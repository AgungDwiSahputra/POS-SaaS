<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\SalesPaymentResource;
use App\Models\DigitalSale;
use App\Models\DigitalSalesPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class DigitalSalesPaymentAPIController extends AppBaseController
{
    public function getAllPayments(DigitalSale $sale)
    {
        $data = [
            'digital_sale_id' => $sale->id,
            'data' => $sale->payments,
        ];

        return $data;
    }

    public function createDigitalSalePayment(DigitalSale $sale, Request $request): SalesPaymentResource
    {
        $input = $request->all();

        $payment = DigitalSalesPayment::create([
            'digital_sale_id' => $sale->id,
            'reference' => $input['reference'] ?? null,
            'payment_date' => $input['payment_date'] ?? now(),
            'amount' => $input['amount'] ?? 0,
            'received_amount' => $input['received_amount'] ?? $sale->grand_total,
            'payment_type' => $input['payment_type'] ?? null,
        ]);

        // Update sale payment status
        $totalPaid = DigitalSalesPayment::whereDigitalSaleId($sale->id)->sum('amount');

        if (round($totalPaid, 2) >= round($sale->grand_total, 2)) {
            $sale->update([
                'payment_status' => DigitalSale::PAID,
                'paid_amount' => $totalPaid,
                'payment_type' => $payment->payment_type,
            ]);
        } else {
            $sale->update([
                'payment_status' => DigitalSale::PARTIAL_PAID,
                'paid_amount' => $totalPaid,
                'payment_type' => $payment->payment_type,
            ]);
        }

        return new SalesPaymentResource($payment);
    }

    public function updateDigitalSalePayment(DigitalSalesPayment $digitalSalesPayment, Request $request): SalesPaymentResource
    {
        $input = $request->all();

        $digitalSalesPayment->update([
            'reference' => $input['reference'] ?? $digitalSalesPayment->reference,
            'payment_date' => $input['payment_date'] ?? $digitalSalesPayment->payment_date,
            'amount' => $input['amount'] ?? $digitalSalesPayment->amount,
            'received_amount' => $input['received_amount'] ?? $digitalSalesPayment->received_amount,
            'payment_type' => $input['payment_type'] ?? $digitalSalesPayment->payment_type,
        ]);

        // Update sale payment status
        $sale = $digitalSalesPayment->digitalSale;
        $totalPaid = DigitalSalesPayment::whereDigitalSaleId($sale->id)->sum('amount');

        if (round($totalPaid, 2) >= round($sale->grand_total, 2)) {
            $sale->update([
                'payment_status' => DigitalSale::PAID,
                'paid_amount' => $totalPaid,
                'payment_type' => $digitalSalesPayment->payment_type,
            ]);
        } else {
            $sale->update([
                'payment_status' => DigitalSale::PARTIAL_PAID,
                'paid_amount' => $totalPaid,
                'payment_type' => $digitalSalesPayment->payment_type,
            ]);
        }

        return new SalesPaymentResource($digitalSalesPayment);
    }

    public function deletePayment($id)
    {
        try {
            DB::beginTransaction();

            $payment = DigitalSalesPayment::whereId($id)->firstOrFail();
            $saleID = $payment->digital_sale_id;

            $existAmount = DigitalSalesPayment::whereDigitalSaleId($saleID)->sum('amount') - $payment->amount;

            $status = $existAmount <= 0 ? DigitalSale::UNPAID : DigitalSale::PARTIAL_PAID;

            DigitalSale::whereId($saleID)->update([
                'payment_status' => $status,
                'paid_amount' => $existAmount,
            ]);

            DigitalSalesPayment::findOrFail($id)->delete();

            $latestPayment = DigitalSalesPayment::whereDigitalSaleId($saleID)->latest()->first();

            DigitalSale::whereId($saleID)->update([
                'payment_type' => !empty($latestPayment) ? $latestPayment->payment_type : null,
            ]);

            DB::commit();

            return $this->sendSuccess('Payment deleted successfully');
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }
}
