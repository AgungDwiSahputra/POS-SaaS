<?php

namespace App\Http\Middleware;

use App\Models\SadminSetting;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SetLanguage
{
    /**
     * Available locales in the application
     */
    private const AVAILABLE_LOCALES = ['id', 'en', 'ar', 'cn', 'fr', 'gr', 'tr', 'vi'];

    /**
     * Default locale
     */
    private const DEFAULT_LOCALE = 'id';

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $sadminSetting = SadminSetting::where('key', 'show_landing_page')->first()->value ?? '1';
        } catch (\Exception $e) {
            // Fallback when database is not available
            $sadminSetting = '1';
        }

        if ($sadminSetting) {
            $locale = $this->detectLocale($request);

            // Set application locale
            App::setLocale($locale);

            // Set locale in session for web requests
            if ($request->expectsJson()) {
                // For API requests, set locale in request for controllers to use
                $request->merge(['locale' => $locale]);
            } else {
                // For web requests, store in session
                session(['locale' => $locale]);
            }

            return $next($request);
        } else {
            return redirect()->route('app');
        }
    }

    /**
     * Detect the appropriate locale for the request
     */
    private function detectLocale(Request $request): string
    {
        // 1. Check for explicit locale in request parameters
        if ($request->has('locale') && in_array($request->get('locale'), self::AVAILABLE_LOCALES)) {
            return $request->get('locale');
        }

        // 2. Check for authenticated user's preferred locale
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->preferred_locale && in_array($user->preferred_locale, self::AVAILABLE_LOCALES)) {
                return $user->preferred_locale;
            }
        }

        // 3. Check Accept-Language header
        $acceptLanguage = $request->header('Accept-Language');
        if ($acceptLanguage) {
            $preferredLanguage = $this->parseAcceptLanguage($acceptLanguage);
            if ($preferredLanguage && in_array($preferredLanguage, self::AVAILABLE_LOCALES)) {
                return $preferredLanguage;
            }
        }

        // 4. Check session for web requests
        if (!$request->expectsJson() && session()->has('locale')) {
            $sessionLocale = session('locale');
            if (in_array($sessionLocale, self::AVAILABLE_LOCALES)) {
                return $sessionLocale;
            }
        }

        // 5. Check user's language field if authenticated
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->language && in_array($user->language, self::AVAILABLE_LOCALES)) {
                return $user->language;
            }
        }

        // 6. Fall back to default locale
        return self::DEFAULT_LOCALE;
    }

    /**
     * Parse Accept-Language header to extract preferred language
     */
    private function parseAcceptLanguage(string $acceptLanguage): ?string
    {
        // Parse something like: "en-US,en;q=0.9,id;q=0.8"
        $languages = explode(',', $acceptLanguage);
        $primaryLanguage = trim(explode(';', $languages[0])[0]);

        // Extract language code (e.g., "en" from "en-US")
        return strtolower(explode('-', $primaryLanguage)[0]);
    }
}
