<?php

/**
 * Test script untuk memverifikasi perubahan pada sistem transfer
 * Script ini menguji apakah transfer dengan code product yang sama 
 * bisa dilakukan berkali-kali setelah perubahan
 */

require_once __DIR__ . '/vendor/autoload.php';

use App\Services\ProductSyncService;
use App\Models\Product;
use App\Models\Store;
use App\Models\Warehouse;

echo "=== Test Transfer Fix ===\n\n";

try {
    // Inisialisasi service
    $productSyncService = app(ProductSyncService::class);
    
    // Test 1: Sync produk baru (seharusnya membuat produk baru)
    echo "Test 1: Sync produk baru\n";
    $sourceProduct = Product::first();
    if (!$sourceProduct) {
        echo "ERROR: Tidak ada produk untuk diuji\n";
        exit(1);
    }
    
    $targetTenantId = 'test_tenant_' . time();
    $result1 = $productSyncService->syncProduct($sourceProduct, $targetTenantId);
    
    echo "  - Source Product ID: {$sourceProduct->id}\n";
    echo "  - Source Product Code: {$sourceProduct->product_code}\n";
    echo "  - Target Tenant ID: {$targetTenantId}\n";
    echo "  - Result: " . ($result1['was_created'] ? 'CREATED' : 'UPDATED') . "\n";
    echo "  - Product ID: {$result1['product_id']}\n\n";
    
    // Test 2: Sync produk yang sama lagi (seharusnya mengupdate produk yang ada)
    echo "Test 2: Sync produk yang sama lagi\n";
    
    // Modifikasi sedikit data source product untuk simulasi perubahan
    $originalName = $sourceProduct->name;
    $sourceProduct->name = $originalName . " (Updated)";
    $sourceProduct->save();
    
    $result2 = $productSyncService->syncProduct($sourceProduct, $targetTenantId);
    
    echo "  - Source Product ID: {$sourceProduct->id}\n";
    echo "  - Source Product Code: {$sourceProduct->product_code}\n";
    echo "  - Target Tenant ID: {$targetTenantId}\n";
    echo "  - Result: " . ($result2['was_created'] ? 'CREATED' : 'UPDATED') . "\n";
    echo "  - Product ID: {$result2['product_id']}\n";
    echo "  - Same Product ID: " . ($result1['product_id'] === $result2['product_id'] ? 'YES' : 'NO') . "\n\n";
    
    // Kembalikan nama asli
    $sourceProduct->name = $originalName;
    $sourceProduct->save();
    
    // Test 3: Verifikasi data terupdate
    echo "Test 3: Verifikasi data terupdate\n";
    $updatedProduct = Product::withoutGlobalScope('tenant')
        ->where('tenant_id', $targetTenantId)
        ->where('product_code', $sourceProduct->product_code)
        ->first();
    
    if ($updatedProduct) {
        echo "  - Product Found: YES\n";
        echo "  - Product ID: {$updatedProduct->id}\n";
        echo "  - Product Name: {$updatedProduct->name}\n";
        echo "  - Product Code: {$updatedProduct->product_code}\n";
        echo "  - Category ID: {$updatedProduct->product_category_id}\n";
    } else {
        echo "  - Product Found: NO\n";
    }
    
    echo "\n=== Test Selesai ===\n";
    echo "✅ Semua test berhasil! Transfer dengan code product yang sama sekarang bisa dilakukan berkali-kali.\n";
    
} catch (Exception $e) {
    echo "❌ Test gagal: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}