<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class DigitalTransactionAudit extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData, BelongsToTenant, Multitenantable;

    protected $table = 'digital_transaction_audits';

    const JSON_API_TYPE = 'digital_transaction_audits';

    protected $fillable = [
        'tenant_id',
        'store_id',
        'digital_provider_id',
        'user_id',
        'transaction_type',
        'transaction_id',
        'amount',
        'balance_before',
        'balance_after',
        'description',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'metadata' => 'array',
    ];

    /**
     * Transaction types
     */
    const TYPE_SALE = 'sale';
    const TYPE_TOPUP = 'topup';
    const TYPE_WITHDRAWAL = 'withdrawal';
    const TYPE_ADJUSTMENT = 'adjustment';

    /**
     * Get the store that owns this audit record
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * Get the digital provider for this audit record
     */
    public function digitalProvider(): BelongsTo
    {
        return $this->belongsTo(DigitalProvider::class);
    }

    /**
     * Get the user who performed this transaction
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create audit record for balance change
     */
    public static function createRecord(
        string $transactionType,
        string $transactionId,
        int $storeId,
        int $digitalProviderId,
        int $userId,
        float $amount,
        float $balanceBefore,
        float $balanceAfter,
        string $description = null,
        array $metadata = null
    ): self {
        return static::create([
            'tenant_id' => auth()->user()->tenant_id,
            'store_id' => $storeId,
            'digital_provider_id' => $digitalProviderId,
            'user_id' => $userId,
            'transaction_type' => $transactionType,
            'transaction_id' => $transactionId,
            'amount' => $amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceAfter,
            'description' => $description,
            'metadata' => $metadata,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Scope untuk audit berdasarkan store
     */
    public function scopeForStore($query, $storeId)
    {
        return $query->where('store_id', $storeId);
    }

    /**
     * Scope untuk audit berdasarkan provider
     */
    public function scopeForProvider($query, $providerId)
    {
        return $query->where('digital_provider_id', $providerId);
    }

    /**
     * Scope untuk audit berdasarkan tipe transaksi
     */
    public function scopeByType($query, $type)
    {
        return $query->where('transaction_type', $type);
    }

    /**
     * Scope untuk audit dalam rentang tanggal
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function prepareLinks(): array
    {
        return [
            'self' => route('digital-transaction-audits.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        return [
            'store_id' => $this->store_id,
            'digital_provider_id' => $this->digital_provider_id,
            'user_id' => $this->user_id,
            'transaction_type' => $this->transaction_type,
            'transaction_id' => $this->transaction_id,
            'amount' => $this->amount,
            'balance_before' => $this->balance_before,
            'balance_after' => $this->balance_after,
            'description' => $this->description,
            'metadata' => $this->metadata,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'store' => $this->store,
            'digital_provider' => $this->digitalProvider,
            'user' => $this->user,
            'created_at' => $this->created_at,
        ];
    }
}