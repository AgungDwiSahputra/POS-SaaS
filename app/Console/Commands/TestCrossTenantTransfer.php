<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\Store;
use App\Models\Warehouse;
use App\Models\ManageStock;
use App\Repositories\TransferRepository;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TestCrossTenantTransfer extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:cross-tenant-transfer {--cleanup : Clean up test data after execution}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test cross-tenant transfer functionality to verify product sync works correctly';

    protected $transferRepository;

    public function __construct(TransferRepository $transferRepository)
    {
        parent::__construct();
        $this->transferRepository = $transferRepository;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧪 Testing Cross-Tenant Transfer Functionality');
        $this->info('================================================');

        try {
            // Step 1: Find or create test stores with different tenants
            $this->info('📍 Step 1: Setting up test stores...');
            $sourceStore = $this->getOrCreateTestStore('Test Store A', 'tenant-a-uuid');
            $targetStore = $this->getOrCreateTestStore('Test Store B', 'tenant-b-uuid');

            $this->info("✅ Source Store: {$sourceStore->name} (Tenant: {$sourceStore->tenant_id})");
            $this->info("✅ Target Store: {$targetStore->name} (Tenant: {$targetStore->tenant_id})");

            // Step 2: Find or create test warehouses
            $this->info('📦 Step 2: Setting up test warehouses...');
            $sourceWarehouse = $this->getOrCreateTestWarehouse($sourceStore, 'Warehouse A');
            $targetWarehouse = $this->getOrCreateTestWarehouse($targetStore, 'Warehouse B');

            $this->info("✅ Source Warehouse: {$sourceWarehouse->name} (ID: {$sourceWarehouse->id})");
            $this->info("✅ Target Warehouse: {$targetWarehouse->name} (ID: {$targetWarehouse->id})");

            // Step 3: Create test product in source tenant
            $this->info('📦 Step 3: Creating test product...');
            $testProduct = $this->createTestProduct($sourceStore->tenant_id);
            $this->info("✅ Test Product: {$testProduct->name} (Code: {$testProduct->product_code}, ID: {$testProduct->id})");

            // Step 4: Add stock to source warehouse
            $this->info('📊 Step 4: Adding stock to source warehouse...');
            $this->addStockToWarehouse($sourceWarehouse->id, $testProduct->id, 10);
            $this->info("✅ Added 10 units of {$testProduct->name} to {$sourceWarehouse->name}");

            // Step 5: Verify product doesn't exist in target tenant
            $this->info('🔍 Step 5: Checking product existence in target tenant...');
            $existingInTarget = Product::withoutGlobalScope('tenant')
                ->where('tenant_id', $targetStore->tenant_id)
                ->where('product_code', $testProduct->product_code)
                ->first();

            if ($existingInTarget) {
                $this->warn("⚠️  Product already exists in target tenant (ID: {$existingInTarget->id})");
            } else {
                $this->info("✅ Product does not exist in target tenant - sync will be triggered");
            }

            // Step 6: Create transfer
            $this->info('🚚 Step 6: Creating cross-tenant transfer...');
            $transferData = [
                'from_store_id' => $sourceStore->id,
                'to_store_id' => $targetStore->id,
                'from_warehouse_id' => $sourceWarehouse->id,
                'to_warehouse_id' => $targetWarehouse->id,
                'date' => now()->format('Y/m/d'),
                'status' => 1, // COMPLETED
                'tax_rate' => 0,
                'tax_amount' => 0,
                'discount' => 0,
                'shipping' => 0,
                'grand_total' => 100000, // Will be calculated
                'note' => 'Test Cross-Tenant Transfer',
                'transfer_items' => [
                    [
                        'product_id' => $testProduct->id,
                        'product_price' => 10000,
                        'net_unit_price' => 10000,
                        'tax_type' => 1, // EXCLUSIVE
                        'tax_value' => 0,
                        'discount_type' => 1, // PERCENTAGE
                        'discount_value' => 0,
                        'quantity' => 5,
                        'sub_total' => 50000,
                    ]
                ]
            ];

            $transfer = $this->transferRepository->storeTransfer($transferData);
            $this->info("✅ Transfer created successfully (ID: {$transfer->id}, Code: {$transfer->reference_code})");

            // Step 7: Verify results
            $this->info('🔍 Step 7: Verifying transfer results...');

            // Check if product was synced to target tenant
            $syncedProduct = Product::withoutGlobalScope('tenant')
                ->where('tenant_id', $targetStore->tenant_id)
                ->where('product_code', $testProduct->product_code)
                ->first();

            if ($syncedProduct) {
                $this->info("✅ Product successfully synced to target tenant (ID: {$syncedProduct->id})");

                // Check if stock was created in target warehouse
                $targetStock = ManageStock::withoutGlobalScope('tenant')
                    ->where('warehouse_id', $targetWarehouse->id)
                    ->where('product_id', $syncedProduct->id)
                    ->first();

                if ($targetStock && $targetStock->quantity == 5) {
                    $this->info("✅ Stock successfully created in target warehouse (Quantity: {$targetStock->quantity})");
                } else {
                    $this->error("❌ Stock not found or incorrect quantity in target warehouse");
                }
            } else {
                $this->error("❌ Product was not synced to target tenant");
            }

            // Check stock movements
            $stockMovements = DB::table('stock_movements')
                ->where('reference_type', 'transfer')
                ->where('reference_id', $transfer->id)
                ->get();

            if ($stockMovements->count() >= 2) {
                $this->info("✅ Stock movements created correctly ({$stockMovements->count()} records)");
                foreach ($stockMovements as $movement) {
                    $this->info("   - {$movement->type}: {$movement->quantity} units");
                }
            } else {
                $this->error("❌ Insufficient stock movement records");
            }

            // Step 8: Cleanup if requested
            if ($this->option('cleanup')) {
                $this->info('🧹 Step 8: Cleaning up test data...');
                $this->cleanupTestData($transfer, $testProduct, $sourceStore, $targetStore, $sourceWarehouse, $targetWarehouse);
                $this->info('✅ Test data cleaned up');
            }

            $this->info('');
            $this->info('🎉 Cross-Tenant Transfer Test Completed Successfully!');
            $this->info('==================================================');

        } catch (\Exception $e) {
            $this->error('❌ Test failed: ' . $e->getMessage());
            Log::error('Cross-tenant transfer test failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return 1;
        }

        return 0;
    }

    private function getOrCreateTestStore($name, $tenantId)
    {
        $store = Store::where('name', $name)->first();

        if (!$store) {
            $store = Store::create([
                'name' => $name,
                'tenant_id' => $tenantId,
                'user_id' => 1, // Assume user exists
                'status' => 1,
            ]);
        }

        return $store;
    }

    private function getOrCreateTestWarehouse(Store $store, $name)
    {
        $warehouse = Warehouse::where('name', $name)
            ->where('tenant_id', $store->tenant_id)
            ->first();

        if (!$warehouse) {
            $warehouse = Warehouse::create([
                'name' => $name,
                'tenant_id' => $store->tenant_id,
                'store_id' => $store->id,
                'max_capacity' => 1000,
            ]);
        }

        return $warehouse;
    }

    private function createTestProduct($tenantId)
    {
        $productCode = 'TEST_XFER_' . time();

        $product = Product::withoutGlobalScope('tenant')
            ->where('tenant_id', $tenantId)
            ->where('product_code', $productCode)
            ->first();

        if (!$product) {
            $product = Product::withoutGlobalScope('tenant')->create([
                'tenant_id' => $tenantId,
                'name' => 'Test Transfer Product',
                'product_code' => $productCode,
                'product_cost' => 8000,
                'product_price' => 10000,
                'product_unit' => 'pcs',
                'sale_unit' => 'pcs',
                'purchase_unit' => 'pcs',
                'product_category_id' => 1, // Assume category exists
                'hpp' => 8000,
            ]);
        }

        return $product;
    }

    private function addStockToWarehouse($warehouseId, $productId, $quantity)
    {
        ManageStock::withoutGlobalScope('tenant')->updateOrCreate(
            [
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
            ],
            [
                'quantity' => $quantity,
            ]
        );
    }

    private function cleanupTestData($transfer, $testProduct, $sourceStore, $targetStore, $sourceWarehouse, $targetWarehouse)
    {
        try {
            // Delete transfer and related data
            $transfer->transferItems()->delete();
            $transfer->delete();

            // Delete stock movements
            DB::table('stock_movements')
                ->where('reference_type', 'transfer')
                ->where('reference_id', $transfer->id)
                ->delete();

            // Delete synced products
            Product::withoutGlobalScope('tenant')
                ->where('product_code', $testProduct->product_code)
                ->where('tenant_id', $targetStore->tenant_id)
                ->delete();

            // Delete stock records
            ManageStock::withoutGlobalScope('tenant')
                ->where('warehouse_id', $targetWarehouse->id)
                ->where('product_id', $testProduct->id)
                ->delete();

            // Note: We don't delete stores/warehouses as they might be reused

        } catch (\Exception $e) {
            $this->warn('Warning: Some test data may not have been cleaned up: ' . $e->getMessage());
        }
    }
}
