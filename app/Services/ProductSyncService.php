<?php

namespace App\Services;

use App\Models\Brand;
use App\Models\MainProduct;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\VariationProduct;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductSyncService
{
    /**
     * Main sync method: Find or create product in destination tenant
     * 
     * @param Product $sourceProduct
     * @param string $targetTenantId
     * @return array ['product_id' => int, 'was_created' => bool, 'was_updated' => bool]
     * @throws \Exception
     */
    public function syncProduct(Product $sourceProduct, string $targetTenantId): array
    {
        // 1. Check for conflicts (code sama tapi produk beda)
        if ($this->detectConflict($sourceProduct, $targetTenantId)) {
            throw new \Exception(
                "Product code {$sourceProduct->product_code} already exists with different details (name or category) in destination store"
            );
        }
        
        // 2. Try to match existing product (code + name + category)
        $existingProduct = $this->matchProduct($sourceProduct, $targetTenantId);
        
        if ($existingProduct) {
            // Product exists, update synced fields only
            $this->syncProductFields($existingProduct, $sourceProduct);
            
            return [
                'product_id' => $existingProduct->id,
                'was_created' => false,
                'was_updated' => true,
            ];
        }
        
        // 3. Product not found, create new (replicate)
        $newProduct = $this->replicateProduct($sourceProduct, $targetTenantId);
        
        return [
            'product_id' => $newProduct->id,
            'was_created' => true,
            'was_updated' => false,
        ];
    }
    
    /**
     * Match product by: product_code + name + product_category_id
     */
    public function matchProduct(Product $sourceProduct, string $targetTenantId): ?Product
    {
        return Product::withoutGlobalScope('tenant')
            ->where('tenant_id', $targetTenantId)
            ->where('product_code', $sourceProduct->product_code)
            ->where('name', $sourceProduct->name)
            ->where('product_category_id', $sourceProduct->product_category_id)
            ->first();
    }
    
    /**
     * Detect conflict: code sama tapi name atau category beda
     */
    public function detectConflict(Product $sourceProduct, string $targetTenantId): bool
    {
        $existing = Product::withoutGlobalScope('tenant')
            ->where('tenant_id', $targetTenantId)
            ->where('product_code', $sourceProduct->product_code)
            ->first();
        
        if (!$existing) {
            return false; // No conflict
        }
        
        // Conflict jika code sama tapi name atau category berbeda
        return $existing->name !== $sourceProduct->name 
            || $existing->product_category_id !== $sourceProduct->product_category_id;
    }
    
    /**
     * Update synced fields pada existing product
     * Synced fields: product_code, name, product_category_id
     */
    protected function syncProductFields(Product $targetProduct, Product $sourceProduct): void
    {
        $targetProduct->update([
            'product_code' => $sourceProduct->product_code,
            'name' => $sourceProduct->name,
            'product_category_id' => $sourceProduct->product_category_id,
        ]);
        
        Log::info("Product synced: {$targetProduct->id} updated from source {$sourceProduct->id}");
    }
    
    /**
     * Replicate product ke tenant tujuan (full clone)
     */
    protected function replicateProduct(Product $sourceProduct, string $targetTenantId): Product
    {
        DB::beginTransaction();
        try {
            // 1. Clone/Find MainProduct
            $targetMainProduct = $this->cloneMainProduct(
                $sourceProduct->mainProduct, 
                $targetTenantId
            );
            
            // 2. Clone/Find Category (AUTO-CREATE)
            $targetCategory = $this->cloneCategory(
                $sourceProduct->productCategory, 
                $targetTenantId
            );
            
            // 3. Clone/Find Brand (AUTO-CREATE)
            $targetBrand = null;
            if ($sourceProduct->brand_id) {
                $targetBrand = $this->cloneBrand(
                    $sourceProduct->brand, 
                    $targetTenantId
                );
            }
            
            // 4. Clone Product
            $newProduct = $sourceProduct->replicate([
                'id', 
                'tenant_id', 
                'created_at', 
                'updated_at'
            ]);
            
            $newProduct->tenant_id = $targetTenantId;
            $newProduct->main_product_id = $targetMainProduct->id;
            $newProduct->product_category_id = $targetCategory->id;
            $newProduct->brand_id = $targetBrand ? $targetBrand->id : null;
            
            // SYNCED fields (dari source)
            $newProduct->product_code = $sourceProduct->product_code;
            $newProduct->name = $sourceProduct->name;
            $newProduct->product_cost = $sourceProduct->product_cost;
            $newProduct->product_unit = $sourceProduct->product_unit;
            $newProduct->sale_unit = $sourceProduct->sale_unit;
            $newProduct->purchase_unit = $sourceProduct->purchase_unit;
            $newProduct->barcode_symbol = $sourceProduct->barcode_symbol;
            $newProduct->tax_type = $sourceProduct->tax_type;
            $newProduct->order_tax = $sourceProduct->order_tax;
            $newProduct->notes = $sourceProduct->notes;
            
            // INDEPENDENT fields (default/fresh)
            $newProduct->product_price = $sourceProduct->product_price; // Initial, bisa diubah nanti
            $newProduct->hpp = 0; // Will be calculated on transfer
            $newProduct->stock_alert = null;
            $newProduct->quantity_limit = null;
            $newProduct->expiry_date = null;
            
            $newProduct->save();
            
            // 5. Clone Variants (if any)
            if ($sourceProduct->variationProduct) {
                $this->cloneVariants($sourceProduct, $newProduct, $targetMainProduct);
            }
            
            Log::info("Product replicated: new ID {$newProduct->id} from source {$sourceProduct->id} to tenant {$targetTenantId}");
            
            DB::commit();
            return $newProduct;
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Product replication failed: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Clone/Find MainProduct di tenant tujuan
     */
    protected function cloneMainProduct(MainProduct $sourceMainProduct, string $targetTenantId): MainProduct
    {
        // Try find existing by code
        $existing = MainProduct::withoutGlobalScope('tenant')
            ->where('tenant_id', $targetTenantId)
            ->where('code', $sourceMainProduct->code)
            ->first();
        
        if ($existing) {
            // Update synced fields
            $existing->update([
                'name' => $sourceMainProduct->name,
                'product_unit' => $sourceMainProduct->product_unit,
            ]);
            return $existing;
        }
        
        // Clone new
        $newMainProduct = $sourceMainProduct->replicate([
            'id', 
            'tenant_id', 
            'created_at', 
            'updated_at'
        ]);
        
        $newMainProduct->tenant_id = $targetTenantId;
        $newMainProduct->save();
        
        // Skip images as per requirement
        
        Log::info("MainProduct cloned: new ID {$newMainProduct->id} from source {$sourceMainProduct->id}");
        
        return $newMainProduct;
    }
    
    /**
     * Clone/Find ProductCategory di tenant tujuan (AUTO-CREATE)
     */
    protected function cloneCategory(ProductCategory $sourceCategory, string $targetTenantId): ProductCategory
    {
        // Try find existing by name
        $existing = ProductCategory::withoutGlobalScope('tenant')
            ->where('tenant_id', $targetTenantId)
            ->where('name', $sourceCategory->name)
            ->first();
        
        if ($existing) {
            return $existing;
        }
        
        // Clone new
        $newCategory = $sourceCategory->replicate([
            'id', 
            'tenant_id', 
            'created_at', 'updated_at'
        ]);
        
        $newCategory->tenant_id = $targetTenantId;
        $newCategory->save();
        
        // Skip images
        
        Log::info("ProductCategory cloned: new ID {$newCategory->id} from source {$sourceCategory->id}");
        
        return $newCategory;
    }
    
    /**
     * Clone/Find Brand di tenant tujuan (AUTO-CREATE)
     */
    protected function cloneBrand(Brand $sourceBrand, string $targetTenantId): Brand
    {
        // Try find existing by name
        $existing = Brand::withoutGlobalScope('tenant')
            ->where('tenant_id', $targetTenantId)
            ->where('name', $sourceBrand->name)
            ->first();
        
        if ($existing) {
            return $existing;
        }
        
        // Clone new
        $newBrand = $sourceBrand->replicate([
            'id', 
            'tenant_id', 
            'created_at', 
            'updated_at'
        ]);
        
        $newBrand->tenant_id = $targetTenantId;
        $newBrand->save();
        
        // Skip images
        
        Log::info("Brand cloned: new ID {$newBrand->id} from source {$sourceBrand->id}");
        
        return $newBrand;
    }
    
    /**
     * Clone all variation products
     */
    protected function cloneVariants(Product $sourceProduct, Product $targetProduct, MainProduct $targetMainProduct): void
    {
        $sourceVariants = VariationProduct::where('product_id', $sourceProduct->id)->get();
        
        foreach ($sourceVariants as $sourceVariant) {
            // Clone variation (variation_id dan variation_type_id tetap sama)
            // Asumsi: variation & variation_type adalah master data global atau sudah ada
            VariationProduct::create([
                'main_product_id' => $targetMainProduct->id,
                'product_id' => $targetProduct->id,
                'variation_id' => $sourceVariant->variation_id,
                'variation_type_id' => $sourceVariant->variation_type_id,
            ]);
        }
        
        Log::info("Variants cloned: {$sourceVariants->count()} variants for product {$targetProduct->id}");
    }
}

