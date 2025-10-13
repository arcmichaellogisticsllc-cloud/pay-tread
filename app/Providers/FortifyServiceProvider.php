<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // ───── Fortify Inertia views ──────────────────────────────────────
        Fortify::loginView(function () {
            return Inertia::render('auth/Login', [
                'status' => session('status'),
                'canResetPassword' => Route::has('password.request'),
            ]);
        });

        Fortify::registerView(fn () => Inertia::render('auth/Register'));
        Fortify::verifyEmailView(fn () => Inertia::render('auth/VerifyEmail'));
        Fortify::requestPasswordResetLinkView(fn () => Inertia::render('auth/ForgotPassword'));

        Fortify::resetPasswordView(fn ($request) => Inertia::render('auth/ResetPassword', [
            'email' => (string) $request->email,
            'token' => (string) $request->route('token'),
        ]));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/TwoFactorChallenge'));
        Fortify::confirmPasswordView(fn () => Inertia::render('auth/ConfirmPassword'));

        // ───── Rate limiters expected by config/fortify.php ───────────────
        // login limiter key: strtolower(username)|ip (matches tests)
        RateLimiter::for('login', function (Request $request) {
            $usernameField = Fortify::username(); // typically 'email'
            $identifier = strtolower((string) $request->input($usernameField)) . '|' . $request->ip();

            return Limit::perMinute(5)->by($identifier);
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });
    }
}
