<?php

namespace App\Console\Commands;

use App\Services\ReportStockService;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TestStockReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:stock-report {--warehouse_id= : Filter by warehouse ID} {--limit=5 : Number of items to show}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test stock report functionality and debug product_cost display issues';

    protected $reportStockService;

    public function __construct(ReportStockService $reportStockService)
    {
        parent::__construct();
        $this->reportStockService = $reportStockService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧪 Testing Stock Report - Product Cost Debug');
        $this->info('================================================');

        // Set up filters
        $filters = [
            'warehouse_id' => $this->option('warehouse_id'),
            'per_page' => $this->option('limit'),
        ];

        $this->info('📊 Filters: ' . json_encode($filters, JSON_PRETTY_PRINT));

        // Check tenant context
        $this->checkTenantContext();

        // Test with different tenant contexts
        $tenants = \App\Models\Store::select('tenant_id')->distinct()->pluck('tenant_id')->toArray();

        if (empty($tenants)) {
            $this->error('❌ No tenants found in database');
            return 1;
        }

        $this->info('🏢 Available Tenants: ' . implode(', ', $tenants));

        // Test with ReportStockService (should now handle tenant scoping properly)
        $this->info("🔄 Testing with ReportStockService (with tenant scoping fallback)");
        $this->testWithReportService($filters);

        // Test with direct query bypassing tenant scoping
        $this->info("🔄 Testing with Direct Query (bypassing tenant scoping)");
        $this->testWithDirectQuery($filters);

        $this->info('');
        $this->info('✅ Stock Report Test Completed for All Tenants');
        $this->info('Check logs for detailed API response debugging');

        return 0;
    }

    private function testWithTenant($tenantId, $filters)
    {
        try {
            // Temporarily set tenant context (if using stancl/tenancy)
            if (function_exists('tenancy')) {
                tenancy()->initialize($tenantId);
            }

            // Get report data
            $reportData = $this->reportStockService->getReport($filters);

            $items = $reportData['data']['data'] ?? [];
            $totalItems = count($items);

            $this->info("   📈 Total items found: {$totalItems}");

            if ($totalItems === 0) {
                $this->warn('   ⚠️  No items found in this tenant');
                return;
            }

            // Display first few items with detailed analysis
            $limit = min($this->option('limit'), $totalItems);
            $this->info("   📋 Showing first {$limit} items:");

            for ($i = 0; $i < $limit; $i++) {
                $item = $items[$i];
                $this->displayItemAnalysis($item, $i + 1, $tenantId);
            }

            // Summary analysis
            $this->displaySummaryAnalysis($items, $tenantId);

        } catch (\Exception $e) {
            $this->error("   ❌ Test failed for tenant {$tenantId}: " . $e->getMessage());
        }
    }

    private function testWithReportService($filters)
    {
        try {
            // Test ReportStockService with tenant scoping fallback
            $reportData = $this->reportStockService->getReport($filters);

            $items = $reportData['data']->items() ?? [];
            $totalItems = count($items);

            $this->info("   📈 Total items found (ReportStockService): {$totalItems}");

            if ($totalItems === 0) {
                $this->warn('   ⚠️  No items found with ReportStockService');
                return;
            }

            // Display first few items with detailed analysis
            $limit = min($this->option('limit'), $totalItems);
            $this->info("   📋 Showing first {$limit} items (ReportStockService):");

            for ($i = 0; $i < $limit; $i++) {
                $item = $items[$i];
                $this->displayItemAnalysis($item, $i + 1, 'REPORT_SERVICE');
            }

            // Summary analysis
            $this->displaySummaryAnalysis($items, 'REPORT_SERVICE');

        } catch (\Exception $e) {
            $this->error("   ❌ ReportStockService test failed: " . $e->getMessage());
        }
    }

    private function testWithDirectQuery($filters)
    {
        try {
            // Create a modified version of ReportStockService that bypasses tenant scoping
            $directReportData = $this->getDirectStockReport($filters);

            $items = $directReportData['data'] ?? [];
            $totalItems = count($items);

            $this->info("   📈 Total items found (direct query): {$totalItems}");

            if ($totalItems === 0) {
                $this->warn('   ⚠️  No items found with direct query');
                return;
            }

            // Display first few items with detailed analysis
            $limit = min($this->option('limit'), $totalItems);
            $this->info("   📋 Showing first {$limit} items (direct query):");

            for ($i = 0; $i < $limit; $i++) {
                $item = $items[$i];
                $this->displayItemAnalysis($item, $i + 1, 'DIRECT');
            }

            // Summary analysis
            $this->displaySummaryAnalysis($items, 'DIRECT');

        } catch (\Exception $e) {
            $this->error("   ❌ Direct query test failed: " . $e->getMessage());
        }
    }

    private function getDirectStockReport($filters)
    {
        // Direct query bypassing tenant scoping
        $query = \App\Models\Product::withoutGlobalScope('tenant')
            ->select([
                'products.id',
                'products.name',
                'products.code',
                'products.product_cost',
                'products.hpp',
                DB::raw('COALESCE(stock_summary.total_qty, 0) as qty'),
                DB::raw('COALESCE(products.hpp, products.product_cost, 0) as cost'),
                DB::raw('(COALESCE(stock_summary.total_qty, 0) * COALESCE(products.hpp, products.product_cost, 0)) as asset_value'),
                DB::raw('(SELECT bu.name FROM base_units bu WHERE bu.id = products.product_unit) as product_unit_name'),
            ])
            ->leftJoin(DB::raw('(
                SELECT product_id, SUM(quantity) as total_qty
                FROM manage_stocks
                GROUP BY product_id
            ) as stock_summary'), 'stock_summary.product_id', '=', 'products.id')
            ->whereRaw('COALESCE(stock_summary.total_qty, 0) > 0'); // Only products with stock

        // Apply filters if needed
        if (!empty($filters['q'])) {
            $q = $filters['q'];
            $query->where(function($query) use ($q) {
                $query->where('products.code', 'like', "%{$q}%")
                      ->orWhere('products.name', 'like', "%{$q}%");
            });
        }

        $items = $query->orderBy('products.name')
                      ->limit($filters['per_page'] ?? 15)
                      ->get()
                      ->toArray();

        return ['data' => $items];
    }

    public function handleOld()
    {
        // This method preserved for reference but not used
        return 0;
    }

    private function displayItemAnalysis($item, $index, $tenantId)
    {
        $this->info("   --- Item #{$index} (Tenant: {$tenantId}) ---");
        $this->info("   ID: {$item['id']} | Name: {$item['name']} | Code: {$item['code']}");

        // Analyze product_cost field
        $productCost = $item['product_cost'] ?? null;
        $hpp = $item['hpp'] ?? null;
        $cost = $item['cost'] ?? null;

        $this->info("   💰 Product Cost: " . $this->formatValue($productCost) . " (type: " . gettype($productCost) . ")");
        $this->info("   📈 HPP: " . $this->formatValue($hpp) . " (type: " . gettype($hpp) . ")");
        $this->info("   💵 Cost (displayed): " . $this->formatValue($cost) . " (type: " . gettype($cost) . ")");

        // Analysis
        if ($productCost == 0 || $productCost === null) {
            $this->warn("   ⚠️  Product Cost is 0/null - This is the issue!");
            $this->warn("      Possible causes:");
            $this->warn("      - Database field is actually NULL or 0");
            $this->warn("      - Casting issue in query");
            $this->warn("      - Tenant scoping problem");
        } else {
            $this->info("   ✅ Product Cost looks good");
        }

        // Check calculation logic
        $expectedCost = ($hpp !== null && $hpp > 0) ? $hpp : $productCost;
        if ($cost != $expectedCost) {
            $this->warn("   ⚠️  Cost calculation mismatch!");
            $this->warn("      Expected: {$expectedCost}, Got: {$cost}");
        }

        $this->info("   📦 Quantity: {$item['qty']} | Asset Value: {$item['asset_value']}");
        $this->info('');
    }

    private function displaySummaryAnalysis($items, $tenantId)
    {
        $this->info("   📊 Summary Analysis (Tenant: {$tenantId}):");
        $this->info('   ==================');

        $totalItems = count($items);
        $zeroCostCount = 0;
        $nullCostCount = 0;
        $validCostCount = 0;

        foreach ($items as $item) {
            $cost = $item['product_cost'] ?? null;
            if ($cost === null) {
                $nullCostCount++;
            } elseif ($cost == 0) {
                $zeroCostCount++;
            } else {
                $validCostCount++;
            }
        }

        $this->info("   📈 Total Items: {$totalItems}");
        $this->info("   ✅ Valid Product Cost: {$validCostCount}");
        $this->info("   ⚠️  Zero Product Cost: {$zeroCostCount}");
        $this->info("   ❌ Null Product Cost: {$nullCostCount}");

        if ($zeroCostCount > 0 || $nullCostCount > 0) {
            $this->warn("   🚨 ISSUE FOUND: {$zeroCostCount} items have zero cost, {$nullCostCount} items have null cost");
            $this->warn("   This explains why product_cost appears as 0 in the API response!");
        } else {
            $this->info("   ✅ All items have valid product costs");
        }

        $this->info('');
    }

    private function checkTenantContext()
    {
        $this->info('🔍 Tenant Context Check:');

        if (function_exists('tenant')) {
            $tenantId = tenant('id');
            $this->info("Current Tenant ID: " . ($tenantId ?? 'null'));
        } else {
            $this->warn("Tenant function not available");
        }

        if (Auth::check()) {
            $user = Auth::user();
            $this->info("Current User ID: {$user->id}");
            $this->info("User Tenant ID: " . ($user->tenant_id ?? 'null'));
        } else {
            $this->warn("No authenticated user");
        }
    }

    private function formatValue($value)
    {
        if ($value === null) {
            return 'NULL';
        }
        if ($value === 0) {
            return '0';
        }
        return number_format($value, 2);
    }
}
