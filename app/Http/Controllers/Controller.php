<?php

namespace App\Http\Controllers;

use App\Models\Load;
use App\Services\Priority\PassportClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Inertia\Inertia;
use Inertia\Response;
class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;
}
class LoadController extends Controller
{
    public function index(): Response
    {
        $loads = Load::query()
            ->latest()
            ->select(['id', 'ref', 'amount_cents', 'status', 'carrier_id'])
            ->paginate(15);

        return Inertia::render('Loads/Index', ['loads' => $loads]);
    }

    public function show(Load $load): Response
    {
        $this->authorize('view', $load);

        $load->load(['pod', 'paymentIntent']);

        $disk = config('filesystems.cloud', 's3');

        if ($load->pod) {
            $load->pod->setAttribute(
                'bol_url',
                $load->pod->bol_path
                    ? Storage::temporaryUrl($load->pod->bol_path, now()->addMinutes(15), [], $disk)
                    : null
            );

            $load->pod->setAttribute(
                'signed_bol_url',
                $load->pod->signed_bol_path
                    ? Storage::temporaryUrl($load->pod->signed_bol_path, now()->addMinutes(15), [], $disk)
                    : null
            );
        }

        return Inertia::render('Loads/Show', [
            'load' => $load,
            'env'  => ['podLinkExpiryDays' => (int) env('POD_LINK_EXPIRY_DAYS', 7)],
        ]);
    }

    public function createCheckoutLink(Request $request, Load $load, PassportClient $passport): RedirectResponse
    {
        $this->authorize('update', $load);

        abort_unless($load->paymentIntent, 400, 'No payment intent');

        $checkout = $passport->createHostedCheckoutLink(
            $load->paymentIntent->provider_ref,
            route('loads.show', $load->id)
        );

        $load->paymentIntent->checkout_url = $checkout['url'] ?? null;
        $load->paymentIntent->save();

        return back()->with('flash', ['type' => 'success', 'message' => 'Checkout link generated']);
    }
}
