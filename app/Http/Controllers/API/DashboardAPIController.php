<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\SaleCollection;
use App\Http\Resources\SaleResource;
use App\Models\BaseUnit;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\ManageStock;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseReturn;
use App\Models\Sale;
use App\Models\SaleReturn;
use App\Models\SalesPayment;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardAPIController extends AppBaseController
{
    public function getPurchaseSalesCounts(): JsonResponse
    {
        $data = [];
        $today = Carbon::today();

        $data['today_sales'] = (float) Sale::where('date', $today)->sum('grand_total');
        $data['today_purchases'] = (float) Purchase::whereHas('warehouse')->where('date', $today)->sum('grand_total');
        $data['today_sale_return'] = (float) SaleReturn::whereHas('warehouse')->where('date', $today)->sum('grand_total');
        $data['today_purchase_return'] = (float) PurchaseReturn::whereHas('warehouse')->where('date', $today)->sum('grand_total');
        $data['today_sales_received_count'] = (float) SalesPayment::whereHas('sale')->where('payment_date', $today)->sum('amount');
        $data['today_expense_count'] = (float) Expense::whereHas('warehouse')->where('date', $today)->sum('amount');

        return $this->sendResponse($data, 'Sales Purchase Count Retrieved Successfully');
    }

    public function getAllPurchaseSalesCounts(): JsonResponse
    {
        $startDate = request()->query('start_date');
        $endDate = request()->query('end_date');

        $data = [];

        $salesQuery = Sale::query();
        $saleReturnQuery = SaleReturn::query()->whereHas('warehouse');
        $purchaseReturnQuery = PurchaseReturn::query()->whereHas('warehouse');
        $purchaseQuery = Purchase::query()->whereHas('warehouse');
        $salesPaymentQuery = SalesPayment::query()->whereHas('sale');
        $expenseQuery = Expense::query()->whereHas('warehouse');

        if ($startDate && $endDate) {
            $salesQuery->whereBetween('date', [$startDate, $endDate]);
            $saleReturnQuery->whereBetween('date', [$startDate, $endDate]);
            $purchaseReturnQuery->whereBetween('date', [$startDate, $endDate]);
            $purchaseQuery->whereBetween('date', [$startDate, $endDate]);
            $salesPaymentQuery->whereBetween('payment_date', [$startDate, $endDate]);
            $expenseQuery->whereBetween('date', [$startDate, $endDate]);
        }

        $data['all_sales_count'] = (float) $salesQuery->sum('grand_total');
        $data['all_sale_return_count'] = (float) $saleReturnQuery->sum('grand_total');
        $data['all_purchase_return_count'] = (float) $purchaseReturnQuery->sum('grand_total');
        $data['all_purchases_count'] = (float) $purchaseQuery->sum('grand_total') - $data['all_purchase_return_count'];
        $data['all_sales_received_count'] = (float) $salesPaymentQuery->sum('amount');
        $data['all_expense_count'] = (float) $expenseQuery->sum('amount');

        return $this->sendResponse($data, 'All Sales Purchase and Returns Count Retrieved Successfully');
    }

    public function getRecentSales(): SaleCollection
    {
        $recentSales = Sale::latest()->take(5)->get();
        SaleResource::usingWithCollection();

        return new SaleCollection($recentSales);
    }

    public function getTopSellingProducts(): JsonResponse
    {
        try {
            $month = Carbon::now()->month;
            $year = Carbon::now()->year;

            // Build subquery for sold quantities (only completed sales)
            $soldSubquery = DB::table('sale_items')
                ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->where('sales.status', Sale::COMPLETED)
                ->whereMonth('sales.date', $month)
                ->whereYear('sales.date', $year)
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
                ->whereMonth('sales_return.date', $month)
                ->whereYear('sales_return.date', $year)
                ->select(
                    'sale_return_items.product_id',
                    DB::raw('SUM(sale_return_items.quantity) as total_returned_quantity'),
                    DB::raw('SUM(sale_return_items.sub_total) as total_returned_amount')
                )
                ->groupBy('sale_return_items.product_id');

            // Main query: join products with sold and returned subqueries
            // Use CAST to ensure numeric sorting (not string sorting)
            // Note: Using 'net_sold_quantity' instead of 'total_quantity' to avoid conflict with Product model accessor
            $topSellings = Product::query()
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
                ->having('net_sold_quantity', '>', 0)
                ->orderByRaw('CAST(COALESCE(sold.total_sold_quantity, 0) - COALESCE(returned.total_returned_quantity, 0) AS DECIMAL(15,2)) DESC')
                ->orderBy('products.name', 'asc')
                ->take(5)
                ->get();

            $data = [];
            foreach ($topSellings as $topSelling) {
                $data[] = [
                    'name' => $topSelling->name,
                    'total_quantity' => $topSelling->net_sold_quantity,
                    'grand_total' => $topSelling->net_grand_total,
                    'sale_unit' => isset($topSelling->getSaleUnitName()['short_name']) ? $topSelling->getSaleUnitName()['short_name'] : null,
                    'image' => $topSelling->image_url,
                ];
            }

            return $this->sendResponse($data, 'Top Selling Products Retrieved Successfully');
        } catch (\Exception $e) {
            Log::error('Error in getTopSellingProducts: ' . $e->getMessage());
            return $this->sendResponse([], 'No top selling products found');
        }
    }

    public function getWeekSalePurchases(): JsonResponse
    {
        $count = 7;
        $days = [];
        $date = Carbon::tomorrow();
        for ($i = 0; $i < $count; $i++) {
            $days[] = $date->subDay()->format('Y-m-d');
        }
        $day['days'] = array_reverse($days);
        $sales = Sale::whereBetween('date', [$day['days'][0], $day['days'][6]])
            ->orderBy('date', 'desc')
            ->groupBy('date')
            ->get([
                DB::raw('DATE_FORMAT(date,"%Y-%m-%d") as week'),
                DB::raw('SUM(grand_total) as grand_total'),
            ])->keyBy('week');
        $period = CarbonPeriod::create($day['days'][0], $day['days'][6]);
        $data['dates'] = array_map(function ($datePeriod) {
            return $datePeriod->format('Y-m-d');
        }, iterator_to_array($period));

        $data['sales'] = array_map(function ($datePeriod) use ($sales) {
            $week = $datePeriod->format('Y-m-d');

            return $sales->has($week) ? $sales->get($week)->grand_total : 0;
        }, iterator_to_array($period));

        $purchases = Purchase::whereHas('warehouse')->whereBetween('date', [$day['days'][0], $day['days'][6]])
            ->orderBy('date', 'desc')
            ->groupBy('date')
            ->get([
                DB::raw('DATE_FORMAT(date,"%Y-%m-%d") as week'),
                DB::raw('SUM(grand_total) as grand_total'),
            ])->keyBy('week');
        $data['purchases'] = array_map(function ($datePeriod) use ($purchases) {
            $week = $datePeriod->format('Y-m-d');

            return $purchases->has($week) ? $purchases->get($week)->grand_total : 0;
        }, iterator_to_array($period));

        return $this->sendResponse($data, 'Week of Sales Purchase Retrieved Successfully');
    }

    public function getYearlyTopSelling(): JsonResponse
    {
        try {
            $year = Carbon::now()->year;

            // Build subquery for sold quantities (only completed sales)
            $soldSubquery = DB::table('sale_items')
                ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->where('sales.status', Sale::COMPLETED)
                ->whereYear('sales.date', $year)
                ->select(
                    'sale_items.product_id',
                    DB::raw('SUM(sale_items.quantity) as total_sold_quantity')
                )
                ->groupBy('sale_items.product_id');

            // Build subquery for returned quantities
            $returnedSubquery = DB::table('sale_return_items')
                ->join('sales_return', 'sale_return_items.sale_return_id', '=', 'sales_return.id')
                ->where('sales_return.status', SaleReturn::RECEIVED)
                ->whereYear('sales_return.date', $year)
                ->select(
                    'sale_return_items.product_id',
                    DB::raw('SUM(sale_return_items.quantity) as total_returned_quantity')
                )
                ->groupBy('sale_return_items.product_id');

            // Main query: join products with sold and returned subqueries
            // Use CAST to ensure numeric sorting (not string sorting)
            // Note: Using 'net_sold_quantity' instead of 'total_quantity' to avoid conflict with Product model accessor
            $topSellings = Product::query()
                ->leftJoinSub($soldSubquery, 'sold', function ($join) {
                    $join->on('products.id', '=', 'sold.product_id');
                })
                ->leftJoinSub($returnedSubquery, 'returned', function ($join) {
                    $join->on('products.id', '=', 'returned.product_id');
                })
                ->selectRaw('products.*')
                ->selectRaw('COALESCE(sold.total_sold_quantity, 0) - COALESCE(returned.total_returned_quantity, 0) as net_sold_quantity')
                ->having('net_sold_quantity', '>', 0)
                ->orderByRaw('CAST(COALESCE(sold.total_sold_quantity, 0) - COALESCE(returned.total_returned_quantity, 0) AS DECIMAL(15,2)) DESC')
                ->orderBy('products.name', 'asc')
                ->take(5)
                ->get();

            $data = [];
            foreach ($topSellings as $topSelling) {
                $data['name'][] = $topSelling->name ?? 'Unknown Product';
                $data['total_quantity'][] = $topSelling->net_sold_quantity ?? 0;
            }

            return $this->sendResponse($data, 'Yearly TopSelling Products Retrieved Successfully');
        } catch (\Exception $e) {
            Log::error('Error in getYearlyTopSelling: ' . $e->getMessage());
            return $this->sendResponse(['name' => [], 'total_quantity' => []], 'No yearly top selling products found');
        }
    }

    public function getTopCustomer(): JsonResponse
    {
        $month = Carbon::now()->month;
        $topCustomers = Customer::withoutGlobalScope('tenant')
            ->where('customers.tenant_id', Auth::user()->tenant_id)
            ->leftJoin('sales', 'customers.id', '=', 'sales.customer_id')
            ->whereMonth('sales.date', $month)
            ->select('customers.*', DB::raw('sum(sales.grand_total) as grand_total'))
            ->groupBy('customers.id')
            ->orderBy('grand_total', 'desc')
            ->latest()
            ->take(5)
            ->get();
        $data = [];
        foreach ($topCustomers as $topCustomer) {
            $data['name'][] = $topCustomer->name;
            $data['grand_total'][] = (float) $topCustomer->grand_total;
        }

        return $this->sendResponse($data, 'Top Customers Retrieved Successfully');
    }

    public function stockAlerts(): JsonResponse
    {
        $manageStocks = ManageStock::with('warehouse')->where('alert', true)->limit(10)->latest()->get();
        $productResponse = [];
        foreach ($manageStocks as $stock) {
            $product = Product::where('id', $stock->product_id)->first();
            if (!empty($product)) {
                $productUnitName = BaseUnit::whereId($product->product_unit)->value('name');
                $stock['product_unit_name'] = $productUnitName;
                $product->stock = $stock;
                $productResponse[] = $product;
                $product = null;
                $stock = null;
            }
        }

        return $this->sendResponse($productResponse, 'Stocks retrieved successfully');
    }
}
