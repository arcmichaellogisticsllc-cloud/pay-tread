<?php

use Laravel\Fortify\Features;

return [

    // Guard / broker Fortify uses
    'guard' => 'web',
    'passwords' => 'users',

    // Username field
    'username' => 'email',
    'email' => 'email',
    'lowercase_usernames' => true,

    // Where to send authenticated users
    'home' => '/dashboard',

    // Route prefix / domain
    'prefix' => '',
    'domain' => null,

    // Middleware applied to Fortify routes
    'middleware' => ['web'],

    // Rate limiters
    'limiters' => [
        'login' => 'login',
        'two-factor' => 'two-factor',
    ],

    // Register Fortify's view routes (we’re returning Inertia pages)
    'views' => true,

    // Enable features used by your tests
    'features' => [
        Features::registration(),
        Features::resetPasswords(),
        Features::emailVerification(),
        Features::updateProfileInformation(),
        Features::updatePasswords(),
        Features::twoFactorAuthentication([
            'confirm' => true,
            'confirmPassword' => true,
            'window' => 0,
        ]),
    ],

];
