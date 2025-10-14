<?php

namespace App\Http\Controllers\Settings;

use App\Http\Requests\StorePodSignatureRequest;
use App\Models\Load;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LoadPodController extends Controller
{
    public function store(StorePodSignatureRequest $request, Load $load): RedirectResponse
    {
        // If you have policies:
        // $this->authorize('update', $load);

        $validated = $request->validated();

        $dataUrl = $validated['signature_png'];
        $storedPath = null;

        // Save as file if it's a data URL PNG
        if (preg_match('/^data:image\/png;base64,/', $dataUrl)) {
            $pngData = base64_decode(substr($dataUrl, strpos($dataUrl, ',') + 1), true);

            if ($pngData !== false) {
                $relativePath = 'pod_signatures/' . now()->format('Ymd_His') . '_' . Str::uuid() . "_load{$load->id}.png";
                // store on the 'public' disk so Storage::disk('public')->url($relativePath) works
                $ok = Storage::disk('public')->put($relativePath, $pngData);

                if ($ok) {
                    $storedPath = $relativePath; // path relative to the 'public' disk
                }
            }
        }

        // Persist fields (adjust column names to your schema)
        $load->update([
            'pod_signer_name'        => (string) $request->string('signer_name'),
            'pod_signer_role'        => (string) $request->string('signer_role'),
            'pod_signature_path'     => $storedPath,           // file path on 'public' disk
            'pod_signature_data_url' => $storedPath ? null : $dataUrl, // keep data URL only if no file stored
            'pod_lat'                => $request->float('lat'),
            'pod_lng'                => $request->float('lng'),
            'pod_accuracy_m'         => $request->integer('accuracy_m'),
            'pod_receiver_email'     => (string) $request->string('receiver_email'),
            'pod_receiver_phone'     => (string) $request->string('receiver_phone_e164'),
            'pod_submitted_at'       => now(),
            'status'                 => 'pod_submitted',
        ]);

        // Optionally: events / notifications here

        return redirect()
            ->route('loads.show', $load)
            ->with('success', 'POD submitted.');
    }
}

