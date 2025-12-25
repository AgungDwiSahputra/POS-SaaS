<?php

namespace App\Models;

use App\Traits\HasJsonResourcefulData;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

/**
 * App\Models\BalanceRequest
 *
 * @method static \Illuminate\Database\Eloquent\Builder|BalanceRequest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|BalanceRequest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|BalanceRequest query()
 *
 * @property int $id
 * @property string|null $tenant_id
 * @property int $provider_id
 * @property int $user_id
 * @property float $amount
 * @property string $status
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @property-read \App\Models\Provider $provider
 * @property-read \App\Models\User $user
 *
 * @mixin \Eloquent
 */
class BalanceRequest extends BaseModel
{
    use HasFactory, HasJsonResourcefulData, BelongsToTenant, Multitenantable;

    protected $table = 'balance_requests';

    const JSON_API_TYPE = 'balance_requests';

    protected $fillable = [
        'tenant_id',
        'provider_id',
        'user_id',
        'amount',
        'status',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'status' => 'string',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    public static function rules(): array
    {
        return [
            'provider_id' => 'required|exists:providers,id',
            'amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    public function prepareLinks(): array
    {
        return [
            'self' => route('balance-requests.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        $fields = [
            'provider_id' => $this->provider_id,
            'user_id' => $this->user_id,
            'amount' => $this->amount,
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        // Include provider data if loaded
        if ($this->relationLoaded('provider') && $this->provider) {
            $fields['provider'] = [
                'id' => $this->provider->id,
                'nama_provider' => $this->provider->nama_provider,
                'saldo' => $this->provider->saldo,
                'status' => $this->provider->status,
            ];
        }

        // Include user data if loaded
        if ($this->relationLoaded('user') && $this->user) {
            $fields['user'] = [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ];
        }

        return $fields;
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class, 'provider_id', 'id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }
}
