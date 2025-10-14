<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class StoreDigitalProvider extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData, BelongsToTenant, Multitenantable;

    protected $table = 'store_digital_providers';

    const JSON_API_TYPE = 'store_digital_providers';

    protected $fillable = [
        'tenant_id',
        'store_id',
        'digital_provider_id',
        'balance',
        'is_active',
        'settings',
        'last_topup_at',
        'last_topup_amount',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'last_topup_amount' => 'decimal:2',
        'is_active' => 'boolean',
        'settings' => 'array',
        'last_topup_at' => 'datetime',
    ];

    public static function rules(): array
    {
        return [
            'store_id' => 'required|exists:stores,id',
            'digital_provider_id' => 'required|exists:digital_providers,id',
            'balance' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ];
    }

    public function prepareLinks(): array
    {
        return [
            'self' => route('store-digital-providers.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        return [
            'store_id' => $this->store_id,
            'digital_provider_id' => $this->digital_provider_id,
            'balance' => $this->balance,
            'is_active' => $this->is_active,
            'last_topup_at' => $this->last_topup_at,
            'last_topup_amount' => $this->last_topup_amount,
            'store' => $this->store,
            'digital_provider' => $this->digitalProvider,
            'created_at' => $this->created_at,
        ];
    }

    /**
     * Get the store that owns this provider configuration
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * Get the digital provider
     */
    public function digitalProvider(): BelongsTo
    {
        return $this->belongsTo(DigitalProvider::class);
    }

    /**
     * Get digital sales for this store provider
     */
    public function digitalSales(): HasMany
    {
        return $this->hasMany(DigitalSale::class);
    }

    /**
     * Get topup requests for this store provider
     */
    public function topupRequests(): HasMany
    {
        return $this->hasMany(DigitalTopupRequest::class);
    }

    /**
     * Get withdrawals for this store provider
     */
    public function withdrawals(): HasMany
    {
        return $this->hasMany(DigitalWithdrawal::class);
    }

    /**
     * Check if balance is sufficient for transaction
     */
    public function hasSufficientBalance(float $amount): bool
    {
        return $this->balance >= $amount;
    }

    /**
      * Add balance (topup) with locking mechanism and audit trail
      */
    public function addBalance(float $amount): bool
    {
        if ($amount <= 0) {
            return false;
        }

        $oldBalance = $this->balance;

        // Use database-level locking to prevent race conditions
        $updated = $this->newQuery()
            ->where('id', $this->id)
            ->lockForUpdate()
            ->update([
                'balance' => DB::raw("balance + {$amount}"),
                'last_topup_at' => now(),
                'last_topup_amount' => $amount,
                'updated_at' => now(),
            ]) > 0;

        if ($updated) {
            // Refresh the model to get updated balance
            $this->refresh();

            // Create audit trail
            DigitalTransactionAudit::createRecord(
                DigitalTransactionAudit::TYPE_TOPUP,
                'TOPUP_' . now()->format('YmdHis'),
                $this->store_id,
                $this->digital_provider_id,
                auth()->id(),
                $amount,
                (float) $oldBalance,
                (float) $this->balance,
                "Topup saldo sebesar {$amount}",
                [
                    'provider_name' => $this->digitalProvider->name,
                    'topup_method' => 'manual'
                ]
            );
        }

        return $updated;
    }

    /**
      * Deduct balance (for digital sales) with locking mechanism and audit trail
      */
    public function deductBalance(float $amount): bool
    {
        if ($amount <= 0) {
            return false;
        }

        $oldBalance = $this->balance;

        // Use database-level locking to prevent race conditions
        $updated = $this->newQuery()
            ->where('id', $this->id)
            ->where('balance', '>=', $amount)
            ->lockForUpdate()
            ->update([
                'balance' => DB::raw("balance - {$amount}"),
                'updated_at' => now(),
            ]) > 0;

        if ($updated) {
            // Refresh the model to get updated balance
            $this->refresh();

            // Create audit trail
            DigitalTransactionAudit::createRecord(
                DigitalTransactionAudit::TYPE_SALE,
                'SALE_' . now()->format('YmdHis'),
                $this->store_id,
                $this->digital_provider_id,
                auth()->id(),
                $amount,
                (float) $oldBalance,
                (float) $this->balance,
                "Penjualan produk digital sebesar {$amount}",
                [
                    'provider_name' => $this->digitalProvider->name,
                    'sale_type' => 'digital_product'
                ]
            );
        }

        return $updated;
    }

    /**
      * Apply balance adjustment (positive increases balance, negative decreases)
      */
    public function applyAdjustment(float $amount, string $description = null, array $metadata = []): bool
    {
        $amount = round($amount, 2);

        if ($amount === 0.0) {
            return true;
        }

        $oldBalance = $this->balance;
        $query = $this->newQuery()
            ->where('id', $this->id)
            ->lockForUpdate();

        if ($amount < 0) {
            $adjustment = abs($amount);
            $query->where('balance', '>=', $adjustment);
            $updated = $query->update([
                'balance' => DB::raw("balance - {$adjustment}"),
                'updated_at' => now(),
            ]) > 0;
        } else {
            $updated = $query->update([
                'balance' => DB::raw("balance + {$amount}"),
                'updated_at' => now(),
            ]) > 0;
        }

        if ($updated) {
            $this->refresh();

            DigitalTransactionAudit::createRecord(
                DigitalTransactionAudit::TYPE_ADJUSTMENT,
                'ADJ_' . now()->format('YmdHis'),
                $this->store_id,
                $this->digital_provider_id,
                auth()->id() ?? Auth::id() ?? 0,
                abs($amount),
                (float) $oldBalance,
                (float) $this->balance,
                $description ?? 'Penyesuaian saldo provider digital',
                array_merge([
                    'provider_name' => optional($this->digitalProvider)->name,
                    'adjustment_direction' => $amount >= 0 ? 'increase' : 'decrease',
                ], $metadata)
            );
        }

        return $updated;
    }

    /**
     * Scope untuk provider yang aktif di store tertentu
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope untuk store tertentu
     */
    public function scopeForStore($query, $storeId)
    {
        return $query->where('store_id', $storeId);
    }

    /**
     * Scope untuk provider tertentu
     */
    public function scopeForProvider($query, $providerId)
    {
        return $query->where('digital_provider_id', $providerId);
    }
}
