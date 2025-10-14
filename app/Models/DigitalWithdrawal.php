<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class DigitalWithdrawal extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData, BelongsToTenant, Multitenantable;

    protected $table = 'digital_withdrawals';

    const JSON_API_TYPE = 'digital_withdrawals';

    protected $fillable = [
        'tenant_id',
        'reference_code',
        'date',
        'store_id',
        'digital_provider_id',
        'user_id',
        'customer_name',
        'customer_phone',
        'withdrawal_amount',
        'admin_fee',
        'total_amount',
        'provider_balance_before',
        'provider_balance_after',
        'status',
        'notes',
        'transaction_data',
        'completed_at',
    ];

    protected $casts = [
        'date' => 'date',
        'withdrawal_amount' => 'decimal:2',
        'admin_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
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
            'user_id' => 'required|exists:users,id',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'withdrawal_amount' => 'required|numeric|min:0.01',
            'admin_fee' => 'required|numeric|min:0',
        ];
    }

    public function prepareLinks(): array
    {
        return [
            'self' => route('digital-withdrawals.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        return [
            'reference_code' => $this->reference_code,
            'date' => $this->date,
            'store_id' => $this->store_id,
            'digital_provider_id' => $this->digital_provider_id,
            'user_id' => $this->user_id,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'withdrawal_amount' => $this->withdrawal_amount,
            'admin_fee' => $this->admin_fee,
            'total_amount' => $this->total_amount,
            'provider_balance_before' => $this->provider_balance_before,
            'provider_balance_after' => $this->provider_balance_after,
            'status' => $this->status,
            'notes' => $this->notes,
            'completed_at' => $this->completed_at,
            'store' => $this->store,
            'digital_provider' => $this->digitalProvider,
            'user' => $this->user,
            'created_at' => $this->created_at,
        ];
    }

    /**
     * Get the store that owns this withdrawal
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * Get the digital provider used for this withdrawal
     */
    public function digitalProvider(): BelongsTo
    {
        return $this->belongsTo(DigitalProvider::class);
    }

    /**
     * Get the user who processed this withdrawal
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
     * Calculate total amount automatically
     */
    public function calculateTotal(): void
    {
        if ($this->withdrawal_amount && $this->admin_fee) {
            $this->total_amount = (string) ($this->withdrawal_amount + $this->admin_fee);
        } else {
            $this->total_amount = null;
        }
        $this->save();
    }

    /**
     * Mark withdrawal as completed
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    /**
     * Cancel the withdrawal
     */
    public function cancel(): bool
    {
        if ($this->status !== 'pending') {
            return false;
        }

        $this->update([
            'status' => 'cancelled',
        ]);

        return true;
    }

    /**
     * Scope untuk withdrawal berdasarkan status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk withdrawal berdasarkan store
     */
    public function scopeForStore($query, $storeId)
    {
        return $query->where('store_id', $storeId);
    }

    /**
     * Scope untuk withdrawal berdasarkan provider
     */
    public function scopeForProvider($query, $providerId)
    {
        return $query->where('digital_provider_id', $providerId);
    }

    /**
     * Scope untuk withdrawal dalam rentang tanggal
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
        return match($this->status) {
            'pending' => 'badge bg-warning',
            'completed' => 'badge bg-success',
            'cancelled' => 'badge bg-secondary',
            default => 'badge bg-secondary'
        };
    }

    /**
     * Get formatted total amount with currency
     */
    public function getFormattedTotalAttribute(): string
    {
        $amount = $this->total_amount ?? 0;
        return 'Rp ' . number_format((float) $amount, 0, ',', '.');
    }

    /**
     * Get formatted withdrawal amount with currency
     */
    public function getFormattedWithdrawalAmountAttribute(): string
    {
        $amount = $this->withdrawal_amount ?? 0;
        return 'Rp ' . number_format((float) $amount, 0, ',', '.');
    }

    /**
     * Get formatted admin fee with currency
     */
    public function getFormattedAdminFeeAttribute(): string
    {
        $amount = $this->admin_fee ?? 0;
        return 'Rp ' . number_format((float) $amount, 0, ',', '.');
    }

    /**
     * Boot method untuk auto-calculate total dan generate reference code
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($withdrawal) {
            // Auto-calculate total amount
            if ($withdrawal->withdrawal_amount && $withdrawal->admin_fee) {
                $withdrawal->total_amount = (string) ($withdrawal->withdrawal_amount + $withdrawal->admin_fee);
            } else {
                $withdrawal->total_amount = null;
            }

            // Generate reference code if not provided
            if (!$withdrawal->reference_code) {
                $withdrawal->reference_code = 'DW' . date('Ymd') . str_pad(static::count() + 1, 4, '0', STR_PAD_LEFT);
            }
        });

        static::saving(function ($withdrawal) {
            // Auto-calculate total amount on update
            if ($withdrawal->withdrawal_amount && $withdrawal->admin_fee) {
                $withdrawal->total_amount = (string) ($withdrawal->withdrawal_amount + $withdrawal->admin_fee);
            } else {
                $withdrawal->total_amount = null;
            }
        });
    }
}
