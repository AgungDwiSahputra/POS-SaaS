<?php

namespace App\Exports;

use App\Models\Sale;
use Maatwebsite\Excel\Concerns\FromView;

class SaleReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $startDate = request()->get('start_date');
        $endDate = request()->get('end_date');
        $userId = request()->get('user_id');

        $salesQuery = Sale::with(['saleItems', 'warehouse', 'customer', 'payments']);

        if ($startDate != 'null' && $endDate != 'null' && $startDate && $endDate) {
            $salesQuery->whereDate('created_at', '>=', $startDate)
                ->whereDate('created_at', '<=', $endDate);
        }

        if (!empty($userId) && $userId !== '0') {
            $salesQuery->where('user_id', $userId);
        }

        $sales = $salesQuery->get();

        return view('excel.all-sale-report-excel', ['sales' => $sales]);
    }
}
