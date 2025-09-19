<?php

namespace App\Http\Middleware;

use App\Models\SadminSetting;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLanguage
{
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
            $userId = session()->get('auth');
            $localLanguage = session()->get('locale');
    
            if ($localLanguage) {
                App::setLocale($localLanguage);
            } elseif ($userId) {
                try {
                    $user = User::find($userId);
                    App::setLocale($user->language);
                } catch (\Exception $e) {
                    App::setLocale('en');
                }
            } else {
                App::setLocale('en');
            }
    
            return $next($request);
        } else {
            return redirect()->route('app');
        }
    }
}
