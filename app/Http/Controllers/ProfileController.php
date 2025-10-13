<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit()
    {
        // Return your settings/profile page component
        return Inertia::render('Settings/Profile');
    }

    public function update(Request $request)
    {
        // Do your validation + update here as needed
        // $request->user()->fill([...])->save();

        return back()->with('status', 'profile-updated');
    }

    public function destroy(Request $request)
    {
        // Example delete flow (adjust to your needs)
        // $request->user()->delete();
        // Auth::logout();

        return redirect()->route('home');
    }
}
