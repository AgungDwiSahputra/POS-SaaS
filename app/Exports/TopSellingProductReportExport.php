<?php

namespace App\Exports;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleReturn;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromView;

class TopSellingProductReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $startDate = null;
        $endDate = null;
        
        if (request()->get('start_date') && request()->get('start_date') != 'null' && 
            request()->get('end_date') && request()->get('end_date') != 'null') {
            $startDate = Carbon::parse(request()->get('start_date'))->startOfDay()->toDateTimeString();
            $endDate = Carbon::parse(request()->get('end_date'))->endOfDay()->toDateTimeString();
        }

        // Build subquery for sold quantities (only completed sales)
        $soldSubquery = DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->where('sales.status', Sale::COMPLETED)
            ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
                return $query->whereBetween('sales.date', [$startDate, $endDate]);
            })
            ->select(
                'sale_items.product_id',
                DB::raw('SUM(sale_items.quantity) as total_sold_quantity'),
                DB::raw('SUM(sale_items.sub_total) as total_sold_amount')
            )
            ->groupBy('sale_items.product_id');

        // Build subquery for returned quantities
        $returnedSubquery = DB::table('sale_return_items')
            ->join('sales_return', 'sale_return_items.sale_return_id', '=', 'sales_return.id')
            ->where('sales_return.status', SaleReturn::RECEIVED)
            ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
                return $query->whereBetween('sales_return.date', [$startDate, $endDate]);
            })
            ->select(
                'sale_return_items.product_id',
                DB::raw('SUM(sale_return_items.quantity) as total_returned_quantity'),
                DB::raw('SUM(sale_return_items.sub_total) as total_returned_amount')
            )
            ->groupBy('sale_return_items.product_id');

        // Main query: join products with sold and returned subqueries
        // Show ALL products sorted by net_sold_quantity DESC (most sold first)
        // Use CAST to ensure numeric sorting (not string sorting)
        // Note: Using 'net_sold_quantity' instead of 'total_quantity' to avoid conflict with Product model accessor
        $topSelling = Product::query()
            ->leftJoinSub($soldSubquery, 'sold', function ($join) {
                $join->on('products.id', '=', 'sold.product_id');
            })
            ->leftJoinSub($returnedSubquery, 'returned', function ($join) {
                $join->on('products.id', '=', 'returned.product_id');
            })
            ->selectRaw('products.*')
            ->selectRaw('COALESCE(sold.total_sold_quantity, 0) as sold_quantity')
            ->selectRaw('COALESCE(returned.total_returned_quantity, 0) as returned_quantity')
            ->selectRaw('COALESCE(sold.total_sold_quantity, 0) - COALESCE(returned.total_returned_quantity, 0) as net_sold_quantity')
            ->selectRaw('COALESCE(sold.total_sold_amount, 0) - COALESCE(returned.total_returned_amount, 0) as net_grand_total')
            ->orderByRaw('CAST(COALESCE(sold.total_sold_quantity, 0) - COALESCE(returned.total_returned_quantity, 0) AS DECIMAL(15,2)) DESC')
            ->orderBy('products.name', 'asc')
            ->get();

        $topSellingProducts = [];
        foreach ($topSelling as $item) {
            $topSellingProducts[] = [
                'name' => $item->name,
                'total_quantity' => $item->net_sold_quantity,
                'price' => $item->product_price,
                'grand_total' => $item->net_grand_total,
                'code' => $item->code,
                'product_code' => $item->product_code,
                'sale_unit' => isset($item->getSaleUnitName()['short_name']) ? $item->getSaleUnitName()['short_name'] : null,
            ];
        }

        return view('excel.top-selling-product-report-excel', ['topSellingProducts' => $topSellingProducts]);
    }
}
