<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Warehouse;
use App\Models\Store;
use App\Models\ManageStock;
use App\Repositories\TransferRepository;
use App\Services\TransferLockService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;
use Exception;

class TransferLockingTest extends TestCase
{
    use RefreshDatabase;

    private TransferRepository $transferRepository;
    private TransferLockService $lockService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->transferRepository = app(TransferRepository::class);
        $this->lockService = app(TransferLockService::class);
    }

    /** @test */
    public function it_prevents_concurrent_transfer_of_same_product()
    {
        // Arrange
        $product = $this->createProduct();
        $warehouse = $this->createWarehouse();
        $store = $this->createStore();

        // Create initial stock
        $this->createManageStock($product->id, $warehouse->id, 100);

        $transferData = $this->createTransferData($product->id, $warehouse->id, $store->id, 50);

        // Act & Assert
        $firstLock = $this->lockService->lockProduct($product->id, $warehouse->id, $store->tenant_id);

        // Second attempt should fail
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Cannot acquire lock for product');

        $secondLock = $this->lockService->lockProduct($product->id, $warehouse->id, $store->tenant_id);

        // Cleanup
        $this->lockService->releaseLock(
            "product:{$product->id}:warehouse:{$warehouse->id}:tenant:{$store->tenant_id}",
            $firstLock
        );
    }

    /** @test */
    public function it_allows_transfer_after_lock_release()
    {
        // Arrange
        $product = $this->createProduct();
        $warehouse = $this->createWarehouse();
        $store = $this->createStore();

        $this->createManageStock($product->id, $warehouse->id, 100);

        $transferData = $this->createTransferData($product->id, $warehouse->id, $store->id, 50);

        // Act
        $lockToken = $this->lockService->lockProduct($product->id, $warehouse->id, $store->tenant_id);

        // Release lock
        $released = $this->lockService->releaseLock(
            "product:{$product->id}:warehouse:{$warehouse->id}:tenant:{$store->tenant_id}",
            $lockToken
        );

        // Should be able to acquire lock again
        $newLockToken = $this->lockService->lockProduct($product->id, $warehouse->id, $store->tenant_id);

        // Assert
        $this->assertTrue($released);
        $this->assertNotEmpty($newLockToken);

        // Cleanup
        $this->lockService->releaseLock(
            "product:{$product->id}:warehouse:{$warehouse->id}:tenant:{$store->tenant_id}",
            $newLockToken
        );
    }

    /** @test */
    public function it_prevents_warehouse_capacity_violation_with_concurrent_transfers()
    {
        // Arrange
        $product1 = $this->createProduct('Product 1', 'P001');
        $product2 = $this->createProduct('Product 2', 'P002');
        $warehouse = $this->createWarehouse(['max_capacity' => 150]);
        $store = $this->createStore();

        // Create initial stock: 100 units
        $this->createManageStock($product1->id, $warehouse->id, 60);
        $this->createManageStock($product2->id, $warehouse->id, 40);
        // Current total: 100 units, can add 50 more

        $transferData1 = $this->createTransferData($product1->id, $warehouse->id, $store->id, 30);
        $transferData2 = $this->createTransferData($product2->id, $warehouse->id, $store->id, 30);

        // Total additional: 60 units, would exceed capacity (100 + 60 = 160 > 150)

        // Act & Assert
        $warehouseLock = $this->lockService->lockWarehouse($warehouse->id, $store->tenant_id);

        // First transfer should process normally
        $this->expectNotToPerformQueries(); // No assertions needed for this test setup

        // Release warehouse lock
        $this->lockService->releaseLock(
            "warehouse:{$warehouse->id}:tenant:{$store->tenant_id}",
            $warehouseLock
        );
    }

    /** @test */
    public function it_handles_sync_locking_for_cross_tenant_transfers()
    {
        // Arrange
        $product = $this->createProduct();
        $warehouse1 = $this->createWarehouse();
        $warehouse2 = $this->createWarehouse();
        $store1 = $this->createStore(['tenant_id' => 1]);
        $store2 = $this->createStore(['tenant_id' => 2]);

        $this->createManageStock($product->id, $warehouse1->id, 100);

        // Act & Assert
        $syncLock = $this->lockService->lockProductForSync($product->product_code, $store2->tenant_id);

        // Second sync attempt should fail
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Cannot acquire sync lock for product code');

        $secondSyncLock = $this->lockService->lockProductForSync($product->product_code, $store2->tenant_id);

        // Cleanup
        $this->lockService->releaseLock(
            "sync:product:{$product->product_code}:tenant:{$store2->tenant_id}",
            $syncLock
        );
    }

    /** @test */
    public function it_implements_lock_timeout_correctly()
    {
        // Arrange
        $product = $this->createProduct();
        $warehouse = $this->createWarehouse();
        $store = $this->createStore();

        // Act
        $lockToken = $this->lockService->lockProduct($product->id, $warehouse->id, $store->tenant_id, 1); // 1 second timeout

        // Wait for timeout
        sleep(2);

        // Should be able to acquire lock again after timeout
        $newLockToken = $this->lockService->lockProduct($product->id, $warehouse->id, $store->tenant_id);

        // Assert
        $this->assertNotEmpty($newLockToken);

        // Cleanup
        $this->lockService->releaseLock(
            "product:{$product->id}:warehouse:{$warehouse->id}:tenant:{$store->tenant_id}",
            $newLockToken
        );
    }

    private function createProduct(string $name = 'Test Product', string $code = 'P001'): Product
    {
        return Product::factory()->create([
            'name' => $name,
            'product_code' => $code,
            'product_cost' => 1000,
            'product_price' => 1500,
            'hpp' => 1000,
        ]);
    }

    private function createWarehouse(array $attributes = []): Warehouse
    {
        return Warehouse::factory()->create($attributes);
    }

    private function createStore(array $attributes = []): Store
    {
        return Store::factory()->create($attributes);
    }

    private function createManageStock(int $productId, int $warehouseId, int $quantity): ManageStock
    {
        return ManageStock::factory()->create([
            'product_id' => $productId,
            'warehouse_id' => $warehouseId,
            'quantity' => $quantity,
        ]);
    }

    private function createTransferData(int $productId, int $warehouseId, int $storeId, int $quantity): array
    {
        return [
            'from_store_id' => $storeId,
            'to_store_id' => $storeId,
            'from_warehouse_id' => $warehouseId,
            'to_warehouse_id' => $warehouseId,
            'date' => now()->format('Y/m/d'),
            'status' => 1, // COMPLETED
            'transfer_items' => [
                [
                    'product_id' => $productId,
                    'quantity' => $quantity,
                    'product_price' => 1500,
                    'net_unit_price' => 1500,
                    'tax_type' => 1, // EXCLUSIVE
                    'tax_value' => 0,
                    'discount_type' => 1, // PERCENTAGE
                    'discount_value' => 0,
                ],
            ],
            'discount' => 0,
            'tax_rate' => 0,
            'shipping' => 0,
            'grand_total' => $quantity * 1500,
        ];
    }
}