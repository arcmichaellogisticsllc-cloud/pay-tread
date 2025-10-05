<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// probe (for debugging in cloud)
Route::get('/ping', fn () => 'pong '.now());

// landing page (Inertia)
Route::get('/', fn () => Inertia::render('Home'))->name('home');

// style guide (optional)
Route::get('/style-guide', fn () => Inertia::render('StyleGuide'))->name('style-guide');

// keep auth routes at the bottom
require __DIR__ . '/auth.php';
