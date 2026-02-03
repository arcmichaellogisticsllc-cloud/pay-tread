<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class TwoFactorSettingsController extends Controller
{
    /**
     * Show the Two-Factor Authentication settings page.
     */
    public function show()
    {
        // Must match resources/js/pages/Settings/TwoFactor.vue (case-sensitive)
        return Inertia::render('Settings/TwoFactor');
    }
}
