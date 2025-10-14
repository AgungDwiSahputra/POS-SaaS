<?php

namespace App\Models;

use App\Enums\DigitalProductStatus;
use App\Models\Contracts\JsonResourceful;
use App\Models\User;
use App\Traits\HasJsonResourcefulData;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class DigitalSale extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData, BelongsToTenant, Multitenantable;

    protected $table = 'digital_sales';

    const JSON_API_TYPE = 'digital_sales';

    protected $fillable = [
        'tenant_id',
        'reference_code',
        'date',
        'store_id',
        'digital_provider_id',
        'digital_product_id',
        'user_id',
        'customer_name',
        'customer_phone',
        'cost_price',
        'sell_price',
        'margin',
        'provider_balance_before',
        'provider_balance_after',
        'provider_transaction_id',
        'customer_transaction_id',
        'status',
        'notes',
        'transaction_data',
        'completed_at',
    ];

    protected $casts = [
        'date' => 'date',
        'cost_price' => 'decimal:2',
        'sell_price' => 'decimal:2',
        'margin' => 'decimal:2',
        'provider_balance_before' => 'decimal:2',
        'provider_balance_after' => 'decimal:2',
        'transaction_data' => 'array',
        'completed_at' => 'datetime',
    ];

    public static function rules(): array
    {
        return [
            'store_id' => 'required|exists:stores,id',
            'digital_provider_id' => 'required|exists:digital_providers,id',
            'digital_product_id' => 'required|exists:digital_products,id',
            'user_id' => 'required|exists:users,id',
            'cost_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
        ];
    }

    public function prepareLinks(): array
    {
        return [
            'self' => route('digital-sales.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        return [
            'id' => $this->id,
            'reference_code' => $this->reference_code,
            'date' => $this->date,
            'store_id' => $this->store_id,
            'digital_provider_id' => $this->digital_provider_id,
            'digital_product_id' => $this->digital_product_id,
            'user_id' => $this->user_id,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'cost_price' => $this->cost_price,
            'sell_price' => $this->sell_price,
            'margin' => $this->margin,
            'provider_balance_before' => $this->provider_balance_before,
            'provider_balance_after' => $this->provider_balance_after,
            'provider_transaction_id' => $this->provider_transaction_id,
            'customer_transaction_id' => $this->customer_transaction_id,
            'status' => $this->status,
            'notes' => $this->notes,
            'completed_at' => $this->completed_at,
            'store' => $this->store,
            'digital_provider' => $this->digitalProvider,
            'digital_product' => $this->digitalProduct,
            'user' => $this->user,
            'created_at' => $this->created_at,
        ];
    }

    /**
     * Get the store that owns this sale
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * Get the digital provider used for this sale
     */
    public function digitalProvider(): BelongsTo
    {
        return $this->belongsTo(DigitalProvider::class);
    }

    /**
     * Get the digital product being sold
     */
    public function digitalProduct(): BelongsTo
    {
        return $this->belongsTo(DigitalProduct::class);
    }

    /**
     * Get the user who made this sale
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the store digital provider configuration
     */
    public function storeDigitalProvider(): BelongsTo
    {
        return $this->belongsTo(StoreDigitalProvider::class, 'store_id', 'store_id')
                    ->where('digital_provider_id', $this->digital_provider_id);
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
      * Mark sale as completed
      */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => DigitalProductStatus::COMPLETED->value,
            'completed_at' => now(),
        ]);
    }

    /**
      * Mark sale as failed
      */
    public function markAsFailed(): void
    {
        $this->update([
            'status' => DigitalProductStatus::FAILED->value,
        ]);
    }

    /**
     * Scope untuk transaksi berdasarkan status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk transaksi berdasarkan store
     */
    public function scopeForStore($query, $storeId)
    {
        return $query->where('store_id', $storeId);
    }

    /**
     * Scope untuk transaksi berdasarkan provider
     */
    public function scopeForProvider($query, $providerId)
    {
        return $query->where('digital_provider_id', $providerId);
    }

    /**
     * Scope untuk transaksi berdasarkan produk
     */
    public function scopeForProduct($query, $productId)
    {
        return $query->where('digital_product_id', $productId);
    }

    /**
     * Scope untuk transaksi dalam rentang tanggal
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
      * Get formatted status badge
      */
    public function getStatusBadgeAttribute(): string
    {
        $status = DigitalProductStatus::tryFrom($this->status);
        return $status ? $status->badgeClass() : 'badge bg-secondary';
    }

    /**
     * Boot method untuk auto-calculate margin dan generate reference code
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($sale) {
            // Auto-calculate margin
            if ($sale->sell_price && $sale->cost_price) {
                $sale->margin = (string) ($sale->sell_price - $sale->cost_price);
            } else {
                $sale->margin = null;
            }

            // Generate reference code if not provided
            if (!$sale->reference_code) {
                $sale->reference_code = 'DS' . date('Ymd') . str_pad(static::count() + 1, 4, '0', STR_PAD_LEFT);
            }

            // Set default status if not provided
            if (!$sale->status) {
                $sale->status = DigitalProductStatus::PENDING->value;
            }
        });

        static::saving(function ($sale) {
            // Auto-calculate margin on update
            if ($sale->sell_price && $sale->cost_price) {
                $sale->margin = (string) ($sale->sell_price - $sale->cost_price);
            } else {
                $sale->margin = null;
            }
        });
    }
}
