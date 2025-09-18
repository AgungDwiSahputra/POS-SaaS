<?php

use App\Models\Currency;
use App\Models\Language;
use App\Models\ManageStock;
use App\Models\SadminSetting;
use App\Models\Setting;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

if (! function_exists('getPageSize')) {
    /**
     * @return mixed
     */
    function getPageSize($request)
    {
        return $request->input('page.size', 10);
    }
}

if (! function_exists('getAppName')) {
    function getAppName(): string
    {
        static $appName;

        if (empty($appName)) {
            $appName = getSadminSettingValue('app_name');
        }

        return $appName ?? 'POS';
    }
}

if (! function_exists('getAppLogoUrl')) {
    function getAppLogoUrl(): string
    {
        static $appLogo;

        if (empty($appLogo)) {
            $appLogo = SadminSetting::where('key', 'app_logo')->first();
        }

        return $appLogo->value ?? asset('images/logo.png');
    }
}

if (! function_exists('getAppFaviconUrl')) {
    function getAppFaviconUrl(): string
    {
        static $appFavicon;

        if (empty($appFavicon)) {
            try {
                $appFavicon = SadminSetting::where('key', 'app_favicon')->first();
            } catch (\Exception $e) {
                $appFavicon = null;
            }
        }

        return $appFavicon->value ?? asset('images/infyom.png');
    }
}

if (! function_exists('getStoreLogo')) {
    function getStoreLogo(): string
    {
        static $appStoreLogo;

        if (empty($appStoreLogo)) {
            $appStoreLogo = getSettingValue('store_logo') ?? getAppLogoUrl();
        }

        return $appStoreLogo ?? getAppLogoUrl();
    }
}

if (! function_exists('getSettingValue')) {
    /**
     * @return mixed
     */
    function getSettingValue($keyName)
    {
        $key = 'setting' . '-' . $keyName;

        static $settingValues;

        if (isset($settingValues[$key])) {
            return $settingValues[$key];
        }

        /** @var Setting $setting */
        $setting = Setting::where('key', $keyName)->first();
        $settingValues[$key] = $setting->value ?? null;

        return $settingValues[$key];
    }
}

if (! function_exists('canDelete')) {
    function canDelete(array $models, string $columnName, int $id): bool
    {
        foreach ($models as $model) {
            $result = $model::where($columnName, $id)->exists();

            if ($result) {
                return true;
            }
        }

        return false;
    }
}

if (! function_exists('getCurrencyCode')) {
    function getCurrencyCode()
    {
        $currencyId = Setting::where('key', '=', 'currency')->first()->value;

        return Currency::whereId($currencyId)->first()->symbol;
    }
}

if (! function_exists('getLoginUserLanguage')) {
    function getLoginUserLanguage(): string
    {
        return \Illuminate\Support\Facades\Auth::user()->language ?? 'en';
    }
}

if (! function_exists('manageStock')) {
    /**
     * @param $request
     * @return mixed
     */
    function manageStock($warehouseID, $productID, $qty = 0)
    {
        $product = ManageStock::whereWarehouseId($warehouseID)
            ->whereProductId($productID)
            ->first();

        if ($product) {
            $totalQuantity = $product->quantity + $qty;

            if (($product->quantity + $qty) < 0) {
                $totalQuantity = 0;
            }
            $product->update([
                'quantity' => $totalQuantity,
            ]);
        } else {
            if ($qty < 0) {
                $qty = 0;
            }

            ManageStock::create([
                'warehouse_id' => $warehouseID,
                'product_id' => $productID,
                'quantity' => $qty,
            ]);
        }
    }
}

if (! function_exists('keyExist')) {
    function keyExist($key)
    {
        $exists = Setting::where('key', $key)->exists();

        return $exists;
    }
}

if (! function_exists('getSupplierGrandTotalFilterIds')) {
    function getSupplierGrandTotalFilterIds($search)
    {
        $supplierData = Supplier::with('purchases')->get();
        $ids = [];
        foreach ($supplierData as $key => $supplier) {
            $value = $supplier->purchases->sum('grand_total');
            if ($search != '') {
                if ($value == $search) {
                    $ids[] = $supplier->id;
                }
            }
        }

        return $ids;
    }
}

if (! function_exists('replaceArrayValue')) {
    function replaceArrayValue(&$array, $key, $replaceValue)
    {
        foreach ($array as $index => $value) {
            if (is_array($value)) {
                $array[$index] = replaceArrayValue($value, $key, $replaceValue);
            }
            if ($index == $key) {
                $array[$index] = $replaceValue;
            }
        }

        return $array;
    }
}

if (! function_exists('getLogo')) {
    function getLogo()
    {
        /** @var Setting $setting */
        $logoImage = Setting::where('key', '=', 'logo')->first()->value;

        $logo = '';
        if (File::exists(asset($logoImage))) {
            $logo = base64_encode(file_get_contents(asset($logoImage)));
        }

        return 'data:image/png;base64,' . $logo;
    }
}

if (! function_exists('currencyAlignment')) {
    function currencyAlignment($amount)
    {
        // Use smart formatting for better display
        $formattedAmount = is_numeric($amount) ? smartNumberFormat($amount, 2) : $amount;
        
        if (getSettingValue('is_currency_right') != 1) {
            return getCurrencyCode() . ' ' . $formattedAmount;
        }

        return $formattedAmount . ' ' . getCurrencyCode();
    }
}

if (! function_exists('currentTenantId')) {
    function currentTenantId()
    {
        static $currentTenantId;
        if (empty($currentTenantId) && Auth::check()) {
            $currentTenantId = Auth::user()->tenant_id;
        }

        return $currentTenantId;
    }
}

if (! function_exists('getSadminSettingValue')) {
    /**
     * @return mixed
     */
    function getSadminSettingValue($keyName)
    {
        $key = 'sadmin-setting' . '-' . $keyName;

        static $sadminSettingValues;

        if (isset($sadminSettingValues[$key])) {
            return $sadminSettingValues[$key];
        }

        try {
            /** @var SadminSetting $sadminSetting */
            $sadminSetting = SadminSetting::where('key', '=', $keyName)->first();
            $sadminSettingValues[$key] = $sadminSetting->value ?? null;
        } catch (\Exception $e) {
            // Fallback values when database is not available
            $fallbackValues = [
                'hero_title' => 'Welcome to Ez POS',
                'hero_description' => 'Complete Point of Sale solution for your business. Manage inventory, sales, and customers with ease.',
                'hero_button_title' => 'Get Started',
                'hero_image' => asset('assets/images/hero-image.svg'),
                'app_name' => 'Ez POS',
                'app_favicon' => asset('assets/images/favicon.png'),
            ];
            $sadminSettingValues[$key] = $fallbackValues[$keyName] ?? 'Ez POS';
        }

        return $sadminSettingValues[$key];
    }
}

if (! function_exists('getPayPalSupportedCurrencies')) {
    function getPayPalSupportedCurrencies()
    {
        return [
            'AUD',
            'BRL',
            'CAD',
            'CNY',
            'CZK',
            'DKK',
            'EUR',
            'HKD',
            'HUF',
            'ILS',
            'JPY',
            'MYR',
            'MXN',
            'TWD',
            'NZD',
            'NOK',
            'PHP',
            'PLN',
            'GBP',
            'RUB',
            'SGD',
            'SEK',
            'CHF',
            'THB',
            'USD',
        ];
    }
}

if (!function_exists('getPlanFeature')) {
    function getPlanFeature($plan): array
    {
        $features = $plan->planFeature->getFillable();
        $planFeatures = [];
        foreach ($features as $feature) {
            $planFeatures[$feature] = $plan->planFeature->$feature;
        }
        arsort($planFeatures);

        return Arr::except($planFeatures, 'plan_id');
    }
}


if (!function_exists('getLoginUser')) {
    function getLoginUser()
    {
        $userId = session('auth');
        if ($userId) {
            return User::find($userId);
        }
        return null;
    }
}

if (!function_exists('getLoginUser')) {
    function getLoginUser()
    {
        $userId = session('auth');
        if ($userId) {
            return User::find($userId);
        }
        return null;
    }
}


/**
 * @return mixed
 */
if (!function_exists('getCurrentSubscription')) {
    function getCurrentSubscription()
    {
        if (getLoginUser()) {
            $subscription = Subscription::with(['plan'])->where('user_id', getLoginUser()->id)->where('status', Subscription::ACTIVE)->latest()->first();
            return $subscription;
        }
        return null;
    }
}

if (!function_exists('getAllLanguages')) {
    function getAllLanguages()
    {
        if (Schema::hasColumn('languages', 'status')) {
            return Language::where('status', true)->get();
        }

        return Language::all();
    }
}

if (!function_exists('getLocalLanguage')) {

    function getLocalLanguage()
    {
        $language = session()->get('locale');
        if (!$language) {
            $user = User::find(session()->get('auth'));
            if ($user) {
                $language = $user->language;
            }
        }

        return $language ?? 'en';
    }
}

if (!function_exists('getActiveStore')) {
    function getActiveStore()
    {
        if (Auth::check() && Auth::user()->tenant_id) {
            return Store::where('tenant_id', Auth::user()->tenant_id)->first();
        }
        return null;
    }
}

if (!function_exists('getActiveStoreName')) {
    function getActiveStoreName()
    {
        if (Auth::check() && Auth::user()->tenant_id) {
            $store = Store::where('tenant_id', Auth::user()->tenant_id)->first();
            return $store->name ?? (getSettingValue('store_name') ?? null);
        }
        return getSettingValue('store_name') ?? null;
    }
}

if (!function_exists('smartNumberFormat')) {
    /**
     * Format number without unnecessary .00 for whole numbers
     * 
     * @param float $number
     * @param int $decimals
     * @param string $decimal_separator
     * @param string $thousands_separator
     * @return string
     */
    function smartNumberFormat($number, $decimals = 2, $decimal_separator = '.', $thousands_separator = ',')
    {
        // Format the number with specified decimals
        $formatted = number_format($number, $decimals, $decimal_separator, $thousands_separator);
        
        // If decimals is 2 and the number ends with .00, remove it
        if ($decimals == 2 && substr($formatted, -3) === $decimal_separator . '00') {
            $formatted = substr($formatted, 0, -3);
        }
        
        return $formatted;
    }
}

if (!function_exists('smartCurrencyAlignment')) {
    /**
     * Currency alignment with smart number formatting (no .00 for whole numbers)
     * 
     * @param float $amount
     * @return string
     */
    function smartCurrencyAlignment($amount)
    {
        $formattedAmount = smartNumberFormat($amount, 2);
        
        if (getSettingValue('is_currency_right') != 1) {
            return getCurrencyCode() . ' ' . $formattedAmount;
        }

        return $formattedAmount . ' ' . getCurrencyCode();
    }
}
