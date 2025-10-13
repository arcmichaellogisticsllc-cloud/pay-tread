<?php

namespace App\Http\Controllers;

use App\Models\Load;
use App\Services\Priority\PassportClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LoadController extends Controller
{
    public function index(): Response
    {
        // Eager load what your Index page needs to avoid N+1s
        $loads = Load::query()
            ->latest()
            ->select(['id', 'ref', 'amount_cents', 'status', 'carrier_id'])
            // ->with('carrier:id,name') // uncomment if you show the carrier name
            ->paginate(15);

        return Inertia::render('Loads/Index', [
            'loads' => $loads,
        ]);
    }

    public function show(Load $load): \Inertia\Response
{
    $this->authorize('view', $load);

    $load->load(['pod', 'paymentIntent']);

    $disk = config('filesystems.cloud', 's3');

    if ($load->pod) {
        $load->pod->setAttribute(
            'bol_url',
            $load->pod->bol_path
                ? \Illuminate\Support\Facades\Storage::temporaryUrl(
                    $load->pod->bol_path,
                    now()->addMinutes(15),
                    [],
                    $disk
                )
                : null
        );

        $load->pod->setAttribute(
            'signed_bol_url',
            $load->pod->signed_bol_path
                ? \Illuminate\Support\Facades\Storage::temporaryUrl(
                    $load->pod->signed_bol_path,
                    now()->addMinutes(15),
                    [],
                    $disk
                )
                : null
        );
    }

    return \Inertia\Inertia::render('Loads/Show', [
        'load' => $load,
        'env'  => ['podLinkExpiryDays' => (int) env('POD_LINK_EXPIRY_DAYS', 7)],
    ]);
}


    public function createCheckoutLink(Request $request, Load $load, PassportClient $passport): RedirectResponse
    {
        $this->authorize('update', $load);

        // Ensure relation is available
        $load->loadMissing('paymentIntent');

        abort_unless($load->paymentIntent, 400, 'No payment intent');

        try {
            $callbackUrl = route('loads.show', $load);
            $checkout    = $passport->createHostedCheckoutLink(
                $load->paymentIntent->provider_ref,
                $callbackUrl
            );

            $load->paymentIntent->checkout_url = $checkout['url'] ?? null;
            $load->paymentIntent->save();

            return back()->with('flash', [
                'type'    => 'success',
                'message' => 'Checkout link generated',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to create checkout link', [
                'load_id' => $load->id,
                'error'   => $e->getMessage(),
            ]);

            return back()->with('flash', [
                'type'    => 'error',
                'message' => 'Could not generate checkout link. Please try again.',
            ]);
        }
    }
}
