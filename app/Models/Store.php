<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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

    /**
     * Get digital providers for this store
     */
    public function digitalProviders()
    {
        return $this->hasMany(StoreDigitalProvider::class);
    }

    /**
     * Get active digital providers for this store
     */
    public function activeDigitalProviders()
    {
        return $this->hasMany(StoreDigitalProvider::class)->where('is_active', true);
    }

    /**
     * Get digital sales for this store
     */
    public function digitalSales()
    {
        return $this->hasMany(DigitalSale::class);
    }

    /**
     * Get topup requests for this store
     */
    public function topupRequests()
    {
        return $this->hasMany(DigitalTopupRequest::class);
    }

    /**
     * Get withdrawals for this store
     */
    public function withdrawals()
    {
        return $this->hasMany(DigitalWithdrawal::class);
    }

    /**
     * Get total balance across all providers for this store
     */
    public function getTotalDigitalBalanceAttribute(): float
    {
        return $this->digitalProviders()
                    ->where('is_active', true)
                    ->sum('balance');
    }

    /**
     * Get balance for specific provider in this store
     */
    public function getProviderBalance($providerId): float
    {
        $storeProvider = $this->digitalProviders()
                             ->where('digital_provider_id', $providerId)
                             ->where('is_active', true)
                             ->first();

        return $storeProvider ? $storeProvider->balance : 0;
    }
}
