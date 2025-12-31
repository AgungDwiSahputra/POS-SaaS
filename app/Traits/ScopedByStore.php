<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait ScopedByStore
{
    /**
     * Scope to filter by store_id from request or from user's active store (by tenant_id)
     */
    public function scopeByStore(Builder $query, ?int $storeId = null): Builder
    {
        if ($storeId) {
            // Filter by specific store_id from request
            return $query->where('store_id', $storeId);
        }

        // If no store_id provided, get active store by user's tenant_id
        if (Auth::check()) {
            // First try: find store by tenant_id (active store from changeStore feature)
            $store = \DB::table('stores')
                ->where('tenant_id', Auth::user()->tenant_id)
                ->first();

            if ($store) {
                return $query->where('store_id', $store->id);
            }

            // Fallback: get all stores owned by the user
            $storeIds = \DB::table('stores')
                ->where('user_id', Auth::id())
                ->pluck('id');

            if ($storeIds->isNotEmpty()) {
                return $query->whereIn('store_id', $storeIds);
            }
        }

        return $query;
    }

    protected static function booted()
    {
        static::saving(function ($model) {
            if (Auth::check() && empty($model->store_id)) {
                // Get the active store by user's tenant_id
                $store = \DB::table('stores')
                    ->where('tenant_id', Auth::user()->tenant_id)
                    ->first();

                if (!$store) {
                    // Fallback to first store owned by user
                    $store = \DB::table('stores')
                        ->where('user_id', Auth::id())
                        ->first();
                }

                if ($store) {
                    $model->store_id = $store->id;
                }
            }
        });
    }
}
