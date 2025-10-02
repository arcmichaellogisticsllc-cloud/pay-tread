<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
use App\Http\Controllers\PODController;

Route::post('/loads/{load}/pod/submit', [PODController::class, 'submit'])
    ->name('loads.pod.submit');
use App\Http\Controllers\LoadPodController;

Route::post('/loads/{load}/pod/submit', [LoadPodController::class, 'store'])
    ->name('loads.pod.submit');
