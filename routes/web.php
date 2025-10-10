<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

// Dev convenience: home redirects to the page
Route::get('/', fn () => redirect('/user/password'));

// Settings: Password page (GET) + submit (PUT)
Route::get('/user/password', fn () => Inertia::render('settings/Password'));

Route::put('/user/password', function (Request $request) {
    $request->validate([
        'current_password' => ['required'],
        'password'         => ['required', 'confirmed', 'min:8'],
    ]);
    // TODO: actually update the password
    return back()->with('success', 'Password updated');
});

// Simple health check
Route::get('/ping', fn () => 'pong');
