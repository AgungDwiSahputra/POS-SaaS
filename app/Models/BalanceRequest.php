<?php

namespace App\Models;

use App\Models\User;
use App\Traits\HasJsonResourcefulData;
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
 * @property float $requested_amount
 * @property string $status
 * @property int|null $requested_by
 * @property int|null $processed_by
 * @property \Illuminate\Support\Carbon|null $processed_at
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @property-read \App\Models\Provider $provider
 * @property-read \App\Models\User|null $requestedBy
 * @property-read \App\Models\User|null $processedBy
 *
 * @mixin \Eloquent
 */
class BalanceRequest extends BaseModel
{
    use HasFactory, HasJsonResourcefulData, BelongsToTenant;

    protected $table = 'balance_requests';

    const JSON_API_TYPE = 'balance-requests';

    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'tenant_id',
        'provider_id',
        'requested_amount',
        'status',
        'requested_by',
        'processed_by',
        'processed_at',
        'notes',
    ];

    protected $casts = [
        'requested_amount' => 'decimal:2',
        'status' => 'string',
        'processed_at' => 'datetime',
    ];

    public static function rules(): array
    {
        return [
            'provider_id' => 'required|exists:providers,id',
            'requested_amount' => 'required|numeric|min:1',
            'notes' => 'nullable|string|max:500',
        ];
    }

    public static function rulesForApprove(): array
    {
        return [
            'status' => 'required|in:approved,rejected',
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
            'id' => $this->id,
            'provider_id' => $this->provider_id,
            'provider' => null,
            'requested_amount' => $this->requested_amount,
            'status' => $this->status,
            'requested_by' => null,
            'processed_by' => null,
            'processed_at' => $this->processed_at?->format('Y-m-d H:i:s'),
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        if ($this->relationLoaded('provider') && $this->provider) {
            $fields['provider'] = [
                'id' => $this->provider->id,
                'nama_provider' => $this->provider->nama_provider,
            ];
        }

        if ($this->relationLoaded('requestedBy') && $this->requestedBy) {
            $fields['requested_by'] = [
                'id' => $this->requestedBy->id,
                'name' => $this->requestedBy->name,
                'first_name' => $this->requestedBy->first_name,
            ];
        }

        if ($this->relationLoaded('processedBy') && $this->processedBy) {
            $fields['processed_by'] = [
                'id' => $this->processedBy->id,
                'name' => $this->processedBy->name,
                'first_name' => $this->processedBy->first_name,
            ];
        }

        return $fields;
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class, 'provider_id');
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
