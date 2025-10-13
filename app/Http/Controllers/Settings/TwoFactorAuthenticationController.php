<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class TwoFactorSettingsController extends Controller
{
    public function show()
    {
        // Render a page that shows the 2FA settings UI (your component name can differ)
        return Inertia::render('Settings/TwoFactor');
    }
}
