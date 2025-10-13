<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Fortify\Features;

uses(RefreshDatabase::class);

test('login screen can be rendered', function () {
    $response = $this->get(route('login'));
    $response->assertOk();
});

test('users can authenticate with valid credentials', function () {
    $user = User::factory()->create([
        'email_verified_at' => now(),
        'password' => Hash::make('password'),
        'two_factor_secret' => null,
        'two_factor_recovery_codes' => null,
    ]);

    // clear throttle for this email|ip to avoid false negatives
    $key = strtolower($user->email) . '|127.0.0.1';
    RateLimiter::clear($key);
    RateLimiter::clear('login|' . $key);

    $token = csrf_token();

    $response = $this
        ->withSession(['_token' => $token])
        ->post('/login', [
            '_token'   => $token,
            'email'    => $user->email,
            'password' => 'password',
        ]);

    $response->assertStatus(302);
    $response->assertSessionHasNoErrors();

    $this->assertTrue(Auth::check(), 'Expected Auth::check() to be true after login');
    $this->assertAuthenticatedAs($user);

    $response->assertRedirect(config('fortify.home', '/dashboard'));
});

test('users with two factor enabled are redirected to two factor challenge', function () {
    if (! Features::canManageTwoFactorAuthentication()) {
        $this->markTestSkipped('Two-factor authentication is not enabled.');
    }

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->create([
        'email_verified_at' => now(),
        'password' => Hash::make('password'),
    ]);

    $user->forceFill([
        'two_factor_secret' => encrypt('test-secret'),
        'two_factor_recovery_codes' => encrypt(json_encode(['code1', 'code2'])),
        'two_factor_confirmed_at' => now(),
    ])->save();

    $token = csrf_token();

    $response = $this
        ->withSession(['_token' => $token])
        ->post('/login', [
            '_token'   => $token,
            'email'    => $user->email,
            'password' => 'password',
        ]);

    $response->assertRedirect(route('two-factor.login'));
    $response->assertSessionHas('login.id', $user->id);
    $this->assertGuest();
});

test('users cannot authenticate with invalid password', function () {
    $user = User::factory()->create([
        'email_verified_at' => now(),
        'password' => Hash::make('password'),
    ]);

    $token = csrf_token();

    $this
        ->withSession(['_token' => $token]) // <- fixed stray quote
        ->post('/login', [
            '_token'   => $token,
            'email'    => $user->email,
            'password' => 'wrong-password',
        ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $this->assertGuest();
    $response->assertRedirect('/');
});

test('users are rate limited', function () {
    $user = User::factory()->create([
        'email_verified_at' => now(),
        'password' => Hash::make('password'),
    ]);

    $identifier = strtolower($user->email) . '|127.0.0.1';
    // ensure a clean slate
    RateLimiter::clear($identifier);
    RateLimiter::clear('login|' . $identifier);

    $token = csrf_token();

    // Exceed Limit::perMinute(5) by making several bad attempts
    for ($i = 0; $i < 7; $i++) {
        $this
            ->withSession(['_token' => $token])
            ->post('/login', [
                '_token'   => $token,
                'email'    => $user->email,
                'password' => 'wrong-password',
            ]);
    }

    // One more request should be blocked (either HTTP 429 or validation error)
    $response = $this
        ->withSession(['_token' => $token])
        ->post('/login', [
            '_token'   => $token,
            'email'    => $user->email,
            'password' => 'wrong-password',
        ]);

    if ($response->getStatusCode() === 429) {
        // ThrottleRequests middleware path: 429 + Retry-After header
        $response->assertStatus(429);
        $response->assertHeader('Retry-After');
    } else {
        // Some stacks surface throttle as a validation error on 'email'
        $response->assertSessionHasErrors('email');
        $errors = session('errors');
        $this->assertStringContainsString('Too many login attempts', $errors->first('email'));
    }
});
