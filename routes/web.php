<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Settings\AppearanceController;
use App\Http\Controllers\Settings\PasswordController;

Route::get('/', fn () => inertia('dashboard'))->name('dashboard.index');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/settings/appearance', [AppearanceController::class, 'edit'])
        ->name('settings.appearance.edit');

    Route::get('/user/password', [PasswordController::class, 'edit'])
        ->name('password.edit');

    Route::put('/user/password', [PasswordController::class, 'update'])
        ->name('password.update');

    Route::post('/email/verification-notification', function (Request $request) {
        if ($request->user()->hasVerifiedEmail()) return back();
        $request->user()->sendEmailVerificationNotification();
        return back()->with('status', 'verification-link-sent');
    })->name('verification.send');
});

Route::get('/ping', fn () => 'pong');
