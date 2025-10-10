<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

Route::get('/user/password', fn () => Inertia::render('settings/Password'));

Route::put('/user/password', function (Request $request) {
    $request->validate([
        'current_password' => ['required'],
        'password' => ['required', 'confirmed', 'min:8'],
    ]);
    return back()->with('success', 'Password updated');
});
