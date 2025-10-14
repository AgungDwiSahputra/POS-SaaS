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

class DigitalTopupRequest extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData, BelongsToTenant, Multitenantable;

    protected $table = 'digital_topup_requests';

    const JSON_API_TYPE = 'digital_topup_requests';

    protected $fillable = [
        'tenant_id',
        'request_code',
        'store_id',
        'digital_provider_id',
        'requested_by',
        'approved_by',
        'amount',
        'current_balance',
        'balance_after_topup',
        'status',
        'reason',
        'admin_notes',
        'payment_reference',
        'approved_at',
        'completed_at',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'balance_after_topup' => 'decimal:2',
        'metadata' => 'array',
        'approved_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public static function rules(): array
    {
        return [
            'store_id' => 'required|exists:stores,id',
            'digital_provider_id' => 'required|exists:digital_providers,id',
            'requested_by' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'nullable|string|max:500',
        ];
    }

    public function prepareLinks(): array
    {
        return [
            'self' => route('digital-topup-requests.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        return [
            'request_code' => $this->request_code,
            'store_id' => $this->store_id,
            'digital_provider_id' => $this->digital_provider_id,
            'requested_by_id' => $this->requested_by,
            'approved_by_id' => $this->approved_by,
            'amount' => $this->amount,
            'current_balance' => $this->current_balance,
            'balance_after_topup' => $this->balance_after_topup,
            'status' => $this->status,
            'reason' => $this->reason,
            'admin_notes' => $this->admin_notes,
            'payment_reference' => $this->payment_reference,
            'approved_at' => $this->approved_at,
            'completed_at' => $this->completed_at,
            'store' => $this->store,
            'digital_provider' => $this->digitalProvider,
            'requested_by' => $this->requestedBy,
            'approved_by' => $this->approvedBy,
            'created_at' => $this->created_at,
        ];
    }

    /**
     * Get the store that owns this request
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * Get the digital provider for this request
     */
    public function digitalProvider(): BelongsTo
    {
        return $this->belongsTo(DigitalProvider::class);
    }

    /**
     * Get the user who requested this topup
     */
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * Get the user who approved this request
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
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
      * Approve the topup request
      */
    public function approve(User $approvedBy, string $adminNotes = null): bool
    {
        if ($this->status !== DigitalProductStatus::PENDING->value) {
            return false;
        }

        $this->update([
            'status' => DigitalProductStatus::APPROVED->value,
            'approved_by' => $approvedBy->id,
            'admin_notes' => $adminNotes,
            'approved_at' => now(),
        ]);

        return true;
    }

    /**
      * Reject the topup request
      */
    public function reject(User $approvedBy, string $adminNotes = null): bool
    {
        if ($this->status !== DigitalProductStatus::PENDING->value) {
            return false;
        }

        $this->update([
            'status' => DigitalProductStatus::REJECTED->value,
            'approved_by' => $approvedBy->id,
            'admin_notes' => $adminNotes,
            'approved_at' => now(),
        ]);

        return true;
    }

    /**
      * Complete the topup (add balance to store provider)
      */
    public function complete(): bool
    {
        if ($this->status !== DigitalProductStatus::APPROVED->value) {
            return false;
        }

        $storeProvider = $this->storeDigitalProvider;
        if (!$storeProvider) {
            return false;
        }

        // Add balance to store provider
        $storeProvider->addBalance($this->amount);

        // Update request status
        $this->update([
            'status' => DigitalProductStatus::COMPLETED->value,
            'completed_at' => now(),
        ]);

        return true;
    }

    /**
      * Cancel the topup request
      */
    public function cancel(): bool
    {
        if (!in_array($this->status, [
            DigitalProductStatus::PENDING->value,
            DigitalProductStatus::APPROVED->value
        ])) {
            return false;
        }

        $this->update([
            'status' => DigitalProductStatus::CANCELLED->value,
        ]);

        return true;
    }

    /**
     * Scope untuk request berdasarkan status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk request berdasarkan store
     */
    public function scopeForStore($query, $storeId)
    {
        return $query->where('store_id', $storeId);
    }

    /**
     * Scope untuk request berdasarkan provider
     */
    public function scopeForProvider($query, $providerId)
    {
        return $query->where('digital_provider_id', $providerId);
    }

    /**
     * Scope untuk request yang pending approval
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
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
     * Boot method untuk generate request code
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($request) {
            // Generate request code if not provided
            if (!$request->request_code) {
                $request->request_code = 'TR' . date('Ymd') . str_pad(static::count() + 1, 4, '0', STR_PAD_LEFT);
            }

            // Set default status if not provided
            if (!$request->status) {
                $request->status = DigitalProductStatus::PENDING->value;
            }

            // Calculate balance after topup
            $storeProvider = StoreDigitalProvider::where('store_id', $request->store_id)
                                                ->where('digital_provider_id', $request->digital_provider_id)
                                                ->first();
            if ($storeProvider) {
                $request->current_balance = $storeProvider->balance;
                $request->balance_after_topup = $storeProvider->balance + $request->amount;
            }
        });
    }
}
