<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ReportStockService
{
    public function getReport(array $filters): array
    {
        // Build base query based on warehouse filter
        if (!empty($filters['warehouse_id'])) {
            // If warehouse filter is applied, use warehouse-specific stock aggregation
            $base = $this->buildWarehouseFilteredQuery($filters['warehouse_id']);
        } else {
            // No warehouse filter, use all stock aggregation
            $base = $this->buildBaseQuery();
        }

        // Apply other filters
        $this->applyFilters($base, $filters);

        // Clone for filtered query (without pagination)
        $filtered = clone $base;

        // Get paginated items
        $items = (clone $filtered)
            ->orderBy('products.name')
            ->paginate($filters['per_page'] ?? 15);

        // Calculate filtered total (not affected by pagination)
        // Use the appropriate total calculation based on whether warehouse filter is applied
        if (!empty($filters['warehouse_id'])) {
            $filteredTotal = (clone $filtered)
                ->selectRaw('SUM(COALESCE(warehouse_stock.total_qty, 0) * COALESCE(products.product_cost, 0)) as total_asset')
                ->value('total_asset');
        } else {
            $filteredTotal = (clone $filtered)
                ->selectRaw('SUM(COALESCE(stock_summary.total_qty, 0) * COALESCE(products.product_cost, 0)) as total_asset')
                ->value('total_asset');
        }

        // Calculate grand total (all products, no filters applied)
        // Note: Grand total should always be the total of ALL products across ALL warehouses
        $grandTotal = $this->buildBaseQuery()
            ->selectRaw('SUM(COALESCE(stock_summary.total_qty, 0) * COALESCE(products.product_cost, 0)) as total_asset')
            ->value('total_asset');

        return [
            'data' => $items,
            'meta' => [
                'pagination' => [
                    'total' => $items->total(),
                    'per_page' => $items->perPage(),
                    'current_page' => $items->currentPage(),
                ],
                'totals' => [
                    'grand_total_asset' => (float) ($grandTotal ?? 0),
                    'filtered_total_asset' => (float) ($filteredTotal ?? 0),
                ],
            ],
        ];
    }

    private function buildBaseQuery()
    {
        return Product::query()
            ->select([
                'products.id',
                'products.name',
                'products.code',
                'products.product_cost',
                DB::raw('COALESCE(stock_summary.total_qty, 0) as qty'),
                DB::raw('COALESCE(products.product_cost, 0) as cost'),
                DB::raw('(COALESCE(stock_summary.total_qty, 0) * COALESCE(products.product_cost, 0)) as asset_value'),
                DB::raw('(SELECT bu.name FROM base_units bu WHERE bu.id = products.product_unit) as product_unit_name'),
            ])
            ->leftJoin(DB::raw('(
                SELECT product_id, SUM(quantity) as total_qty
                FROM manage_stocks
                GROUP BY product_id
            ) as stock_summary'), 'stock_summary.product_id', '=', 'products.id');
    }

    private function buildWarehouseFilteredQuery($warehouseId)
    {
        return Product::query()
            ->select([
                'products.id',
                'products.name',
                'products.code',
                'products.product_cost',
                DB::raw('COALESCE(warehouse_stock.total_qty, 0) as qty'),
                DB::raw('COALESCE(products.product_cost, 0) as cost'),
                DB::raw('(COALESCE(warehouse_stock.total_qty, 0) * COALESCE(products.product_cost, 0)) as asset_value'),
                DB::raw('(SELECT bu.name FROM base_units bu WHERE bu.id = products.product_unit) as product_unit_name'),
            ])
            ->leftJoin(DB::raw('(
                SELECT product_id, SUM(quantity) as total_qty
                FROM manage_stocks
                WHERE warehouse_id = ' . (int)$warehouseId . '
                GROUP BY product_id
            ) as warehouse_stock'), 'warehouse_stock.product_id', '=', 'products.id');
    }

    private function applyFilters($query, array $filters): void
    {
        if (!empty($filters['category_id'])) {
            $query->where('products.product_category_id', $filters['category_id']);
        }

        if (!empty($filters['supplier_id'])) {
            $query->where('products.brand_id', $filters['supplier_id']);
        }

        if (!empty($filters['q'])) {
            $q = $filters['q'];
            $query->where(function($query) use ($q) {
                $query->where('products.code', 'like', "%{$q}%")
                      ->orWhere('products.name', 'like', "%{$q}%");
            });
        }

        if (!empty($filters['start']) && !empty($filters['end'])) {
            // If date range filtering is needed for ledger-based stock calculation
            // This would require additional implementation based on business requirements
            // For now, we'll skip date filtering as it requires more complex ledger logic
        }
    }
}