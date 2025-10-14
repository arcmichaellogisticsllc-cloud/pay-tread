<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

// Controllers
use Laravel\Fortify\Http\Controllers\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\TwoFactorSettingsController;

// ---------- Public ----------
Route::get('/', fn () => Inertia::render('welcome'))->name('home');

// Password reset (request reset link) - guest
Route::middleware(['guest:' . config('fortify.guard')])->group(function () {
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    // Fortify compatibility alias: route('password.store')
    Route::post('/reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

// Health check (optional)
Route::get('/ping', fn () => 'pong')->name('ping');

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

    // Two-factor settings page
    Route::get('/two-factor', [TwoFactorSettingsController::class, 'show'])->name('two-factor.show');

    // Resend email verification notification
    Route::post('/email/verification-notification', function (Request $request) {
        if ($request->user()->hasVerifiedEmail()) {
            return back();
        }
        $request->user()->sendEmailVerificationNotification();
        return back()->with('status', 'verification-link-sent');
    })->name('verification.send');
});
