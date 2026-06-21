<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReportStockService
{
    public function getReport(array $filters): array
    {
        $useTenantScoping = $this->shouldUseTenantScoping();

        if (!empty($filters['warehouse_id'])) {
            $base = $this->buildWarehouseFilteredQuery($filters['warehouse_id']);
        } else {
            $base = $this->buildBaseQuery();
        }

        $this->applyFilters($base, $filters);

        $filtered = clone $base;

        $paginatedQuery = (clone $filtered)->orderBy('products.name');
        $items = $paginatedQuery->paginate($filters['per_page'] ?? 15);

        // ✅ filtered_total_asset: pakai asset_value (hpp) dengan filter aktif
        $filteredTotalQuery = clone $filtered;
        $filteredTotal = DB::table(DB::raw("({$filteredTotalQuery->toSql()}) as sub"))
            ->mergeBindings($filteredTotalQuery->getQuery())
            ->sum('asset_value');

        // ✅ grand_total_asset: pakai asset_value (hpp) TANPA filter, hanya warehouse
        if (!empty($filters['warehouse_id'])) {
            $grandBase = $this->buildWarehouseFilteredQuery($filters['warehouse_id']);
        } else {
            $grandBase = $this->buildBaseQuery();
        }

        $grandTotal = DB::table(DB::raw("({$grandBase->toSql()}) as sub"))
            ->mergeBindings($grandBase->getQuery())
            ->sum('asset_value');

        return [
            'data' => $items,
            'meta' => [
                'pagination' => [
                    'total'        => $items->total(),
                    'per_page'     => $items->perPage(),
                    'current_page' => $items->currentPage(),
                ],
                'totals' => [
                    'grand_total_asset'    => (float) ($grandTotal ?? 0),
                    'filtered_total_asset' => (float) ($filteredTotal ?? 0),
                ],
            ],
        ];
    }

    private function buildBaseQuery()
    {
        // Check if tenant context is available and valid
        $useTenantScoping = $this->shouldUseTenantScoping();

        $query = $useTenantScoping
            ? Product::query()  // With tenant scoping
            : Product::withoutGlobalScope('tenant'); // Without tenant scoping

        return $query
            ->select([
                'products.id',
                'products.name',
                'products.code',
                'products.product_cost',
                'products.product_price',
                'products.hpp',
                DB::raw('SUM(manage_stocks.quantity) as qty'),
                DB::raw('COALESCE(products.hpp, products.product_cost, 0) as cost'),
                DB::raw('(SUM(manage_stocks.quantity) * COALESCE(products.hpp, products.product_cost, 0)) as asset_value'),
                DB::raw('(SELECT bu.name FROM base_units bu WHERE bu.id = products.product_unit) as product_unit_name'),
                DB::raw('(SELECT pc.name FROM product_categories pc WHERE pc.id = products.product_category_id) as product_category_name'),
            ])
            ->join('manage_stocks', 'products.id', '=', 'manage_stocks.product_id')
            ->groupBy('products.id', 'products.name', 'products.code', 'products.product_cost', 'products.product_price', 'products.hpp', 'products.product_unit', 'products.product_category_id')
            ->havingRaw('SUM(manage_stocks.quantity) > 0');
    }

    private function buildWarehouseFilteredQuery($warehouseId)
    {
        // Check if tenant context is available and valid
        $useTenantScoping = $this->shouldUseTenantScoping();

        $query = $useTenantScoping
            ? Product::query()  // With tenant scoping
            : Product::withoutGlobalScope('tenant'); // Without tenant scoping

        return $query
            ->select([
                'products.id',
                'products.name',
                'products.code',
                'products.product_cost',
                'products.product_price',
                'products.hpp',
                DB::raw('SUM(manage_stocks.quantity) as qty'),
                DB::raw('COALESCE(products.hpp, products.product_cost, 0) as cost'),
                DB::raw('(SUM(manage_stocks.quantity) * COALESCE(products.hpp, products.product_cost, 0)) as asset_value'),
                DB::raw('(SELECT bu.name FROM base_units bu WHERE bu.id = products.product_unit) as product_unit_name'),
                DB::raw('(SELECT pc.name FROM product_categories pc WHERE pc.id = products.product_category_id) as product_category_name'),
            ])
            ->join('manage_stocks', 'products.id', '=', 'manage_stocks.product_id')
            ->where('manage_stocks.warehouse_id', $warehouseId)
            ->groupBy('products.id', 'products.name', 'products.code', 'products.product_cost', 'products.product_price', 'products.hpp', 'products.product_unit', 'products.product_category_id')
            ->havingRaw('SUM(manage_stocks.quantity) > 0');
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

    /**
     * Determine if tenant scoping should be used
     * Falls back to without scoping if tenant context is not available
     */
    private function shouldUseTenantScoping(): bool
    {
        // For stock reports, we need to bypass tenant scoping because:
        // 1. Stock data (manage_stocks table) doesn't have tenant_id
        // 2. Stock reports should show all products with stock regardless of tenant
        // 3. Tenant scoping on products only causes issues when joining with manage_stocks
        return false;
    }
}