<?php

namespace App\Models;

use App\Traits\HasJsonResourcefulData;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

/**
 * App\Models\Provider
 *
 * @method static \Illuminate\Database\Eloquent\Builder|Provider newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Provider newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Provider query()
 *
 * @property int $id
 * @property string $nama_provider
 * @property float $saldo
 * @property string|null $deskripsi
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @method static \Illuminate\Database\Eloquent\Builder|Provider whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Provider whereDeskripsi($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Provider whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Provider whereNamaProvider($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Provider whereSaldo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Provider whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Provider whereUpdatedAt($value)
 *
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Service> $services
 * @property-read int|null $services_count
 *
 * @mixin \Eloquent
 */
class Provider extends BaseModel
{
    use HasFactory, HasJsonResourcefulData, BelongsToTenant, Multitenantable;

    protected $table = 'providers';

    const JSON_API_TYPE = 'providers';

    protected $fillable = [
        'tenant_id',
        'nama_provider',
        'saldo',
        'deskripsi',
        'status',
    ];

    protected $casts = [
        'saldo' => 'decimal:2',
        'status' => 'string',
    ];

    public static function rules(): array
    {
        return [
            'nama_provider' => 'required|string',
            'saldo' => 'required|numeric|min:0',
            'deskripsi' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ];
    }

    public function prepareLinks(): array
    {
        return [
            'self' => route('providers.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        $fields = [
            'nama_provider' => $this->nama_provider,
            'saldo' => $this->saldo,
            'deskripsi' => $this->deskripsi,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];

        return $fields;
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'provider_id', 'id');
    }
}
