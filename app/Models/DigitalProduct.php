<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class DigitalProduct extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData, BelongsToTenant, Multitenantable;

    protected $table = 'digital_products';

    const JSON_API_TYPE = 'digital_products';

    protected $fillable = [
        'tenant_id',
        'name',
        'code',
        'product_code',
        'description',
        'category',
        'cost_price',
        'sell_price',
        'margin',
        'provider_code',
        'product_data',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'sell_price' => 'decimal:2',
        'margin' => 'decimal:2',
        'is_active' => 'boolean',
        'product_data' => 'array',
        'sort_order' => 'integer',
    ];

    public static function rules($id = null): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'cost_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'provider_code' => 'nullable|string',
            'is_active' => 'boolean',
            'product_data' => 'nullable|array',
            'sort_order' => 'nullable|integer|min:0',
        ];

        // Add unique validation for code and product_code
        if ($id) {
            // For update, exclude current product from uniqueness check
            $rules['code'] = 'required|string|max:50|unique:digital_products,code,' . $id . ',id,tenant_id,' . auth()->user()->tenant_id;
            $rules['product_code'] = 'required|string|max:100|unique:digital_products,product_code,' . $id . ',id,tenant_id,' . auth()->user()->tenant_id;
        } else {
            // For create, just check uniqueness within tenant
            $rules['code'] = 'required|string|max:50|unique:digital_products,code,NULL,id,tenant_id,' . auth()->user()->tenant_id;
            $rules['product_code'] = 'required|string|max:100|unique:digital_products,product_code,NULL,id,tenant_id,' . auth()->user()->tenant_id;
        }

        return $rules;
    }

    public function prepareLinks(): array
    {
        return [
            'self' => route('digital-products.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        return [
            'name' => $this->name,
            'code' => $this->code,
            'product_code' => $this->product_code,
            'description' => $this->description,
            'category' => $this->category,
            'cost_price' => $this->cost_price,
            'sell_price' => $this->sell_price,
            'margin' => $this->margin,
            'provider_code' => $this->provider_code,
            'product_data' => $this->product_data,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at,
        ];
    }

    /**
     * Get digital sales for this product
     */
    public function digitalSales(): HasMany
    {
        return $this->hasMany(DigitalSale::class);
    }

    /**
     * Calculate margin automatically
     */
    public function calculateMargin(): void
    {
        if ($this->sell_price && $this->cost_price) {
            $this->margin = (string) ($this->sell_price - $this->cost_price);
        } else {
            $this->margin = null;
        }
        $this->save();
    }

    /**
     * Scope untuk produk yang aktif
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope untuk kategori tertentu
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope untuk produk berdasarkan kode provider
     */
    public function scopeByProviderCode($query, $providerCode)
    {
        return $query->where('provider_code', $providerCode);
    }

    /**
     * Get formatted category name
     */
    public function getFormattedCategoryAttribute(): string
    {
        return ucwords(str_replace('_', ' ', $this->category));
    }

    /**
     * Boot method untuk auto-calculate margin
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($product) {
            if ($product->sell_price && $product->cost_price) {
                $product->margin = (string) ($product->sell_price - $product->cost_price);
            } else {
                $product->margin = null;
            }
        });
    }
}
