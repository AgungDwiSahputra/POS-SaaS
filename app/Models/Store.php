<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class Store extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData;

    protected $fillable = [
        'name',
        'tenant_id',
        'user_id',
        'status',
    ];

    public static function rules(): array
    {
        return [
            'name' => 'required',
        ];
    }

    public function prepareLinks(): array
    {
        return [
            //
        ];
    }

    public function prepareAttributes(): array
    {
        return [
            'name' => $this->name,
            'tenant_id' => $this->tenant_id,
            'status' => $this->status,
            'users' => UserStore::where('store_id', $this->id)->count(),
            'active' => Auth::user()->tenant_id === $this->tenant_id,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function outgoingTransfers(): HasMany
    {
        return $this->hasMany(Transfer::class, 'from_store_id', 'id');
    }

    public function incomingTransfers(): HasMany
    {
        return $this->hasMany(Transfer::class, 'to_store_id', 'id');
    }

    public function outgoingPurchases(): HasMany
    {
        return $this->hasMany(Purchase::class, 'from_store_id', 'id');
    }

    public function warehouses(): HasMany
    {
        return $this->hasMany(Warehouse::class, 'tenant_id', 'tenant_id');
    }
}
