<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePodSignatureRequest;
use App\Models\Load;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LoadPodController extends Controller
{
    public function store(StorePodSignatureRequest $request, Load $load): RedirectResponse
    {
        $validated = $request->validated();

        $dataUrl = $validated['signature_png'] ?? null;
        $storedPath = null;

        if (is_string($dataUrl) && preg_match('/^data:image\/png;base64,/', $dataUrl)) {
            $png = base64_decode(substr($dataUrl, strpos($dataUrl, ',') + 1), true);

            if ($png !== false) {
                $relativePath = 'pod_signatures/' . now()->format('Ymd_His') . '_' . Str::uuid() . "_load{$load->id}.png";
                if (Storage::disk('public')->put($relativePath, $png)) {
                    $storedPath = $relativePath;
                }
            }
        }

        $load->update([
            'pod_signer_name'        => (string) $request->string('signer_name'),
            'pod_signer_role'        => (string) $request->string('signer_role'),
            'pod_signature_path'     => $storedPath,
            'pod_signature_data_url' => $storedPath ? null : $dataUrl,
            'pod_lat'                => $request->float('lat'),
            'pod_lng'                => $request->float('lng'),
            'pod_accuracy_m'         => $request->integer('accuracy_m'),
            'pod_receiver_email'     => (string) $request->string('receiver_email'),
            'pod_receiver_phone'     => (string) $request->string('receiver_phone_e164'),
            'pod_submitted_at'       => now(),
            'status'                 => 'pod_submitted',
        ]);

        return redirect()
            ->route('loads.show', $load)
            ->with('success', 'POD submitted.');
    }
}
