<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

// App controllers
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\TwoFactorSettingsController;

// Fortify (vendor) controller
use Laravel\Fortify\Http\Controllers\NewPasswordController;

// ---------- Public ----------
Route::get('/', fn () => Inertia::render('Welcome'))->name('home');

// ---------- Dashboard (protected) ----------
Route::get('/dashboard', fn () => Inertia::render('Dashboard'))
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// ---------- Settings (authenticated) ----------
Route::middleware(['auth'])->group(function () {
    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Password settings
    Route::get('/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('/password', [PasswordController::class, 'update'])->name('password.update');

    // Appearance (Wayfinder-friendly: edit + update)
    Route::get('/appearance/edit', fn () => Inertia::render('Settings/Appearance'))
        ->name('appearance.edit');
    Route::put('/appearance', fn () => response()->noContent())
        ->name('appearance.update');

    // Two-factor settings page
    Route::get('/two-factor', [TwoFactorSettingsController::class, 'show'])
        ->name('two-factor.show');

    // Resend email verification notification
    Route::post('/email/verification-notification', function (Request $request) {
        if ($request->user()->hasVerifiedEmail()) {
            return back();
        }
        $request->user()->sendEmailVerificationNotification();
        return back()->with('status', 'verification-link-sent');
    })->name('verification.send');

    // POD route (enable only if you use it)
    // Route::post('/loads/{load}/pod', [LoadPodController::class, 'store'])->name('loads.pod.store');
});

// ---------- Auth endpoints (guest) ----------
Route::middleware(['guest:' . config('fortify.guard')])->group(function () {
    // Forgot password email (Fortify handles this path; no PHP controller import required)
    Route::post('/forgot-password', fn () => null)->name('password.email');

    // Reset password (Fortify vendor controller)
    Route::post('/reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

// ---------- 2FA challenge (guest) ----------
Route::post('/two-factor-challenge', fn () => null)
    ->middleware(['guest:' . config('fortify.guard')])
    ->name('two-factor.challenge.post');

// ---------- Health check ----------
Route::get('/ping', fn () => 'pong')->name('ping');
