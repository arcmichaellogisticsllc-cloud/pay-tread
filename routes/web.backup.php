<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Http\Controllers\NewPasswordController;

// ---------- Public ----------
Route::get('/', fn () => Inertia::render('welcome'))->name('home');

// Dashboard (protected)
Route::get('/dashboard', fn () => Inertia::render('Dashboard'))
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// ---------- Settings (authenticated) ----------
Route::middleware(['auth'])->group(function () {
    // Two-factor settings page
    Route::get('/two-factor', fn () => Inertia::render('Settings/TwoFactor'))
        ->name('two-factor.show');

    // Appearance (controller-free so Wayfinder is happy)
    Route::get('/appearance', fn () => Inertia::render('Settings/Appearance'))
        ->name('appearance.edit');   // matches import { edit as editAppearance } ...
    Route::put('/appearance', fn () => response()->noContent())
        ->name('appearance.update');

    // Resend email verification notification
    Route::post('/email/verification-notification', function (Request $request) {
        if ($request->user()->hasVerifiedEmail()) {
            return back();
        }
        $request->user()->sendEmailVerificationNotification();
        return back()->with('status', 'verification-link-sent');
    })->name('verification.send');
});

// ---------- Auth endpoints (guest) ----------
Route::middleware(['guest:' . config('fortify.guard')])->group(function () {
    // Forgot password email (Fortify handles this path)
    Route::post('/forgot-password', fn () => null)->name('password.email');

    // Reset password (Fortify vendor controller)
    Route::post('/reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

// ---------- 2FA challenge (guest) ----------
Route::post('/two-factor-challenge', fn () => null)
    ->middleware(['guest:' . config('fortify.guard')])
    ->name('two-factor.challenge.post'); // unique name to avoid "login" export clash

// Health check
Route::get('/ping', fn () => 'pong')->name('ping');
