<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePodSignatureRequest;
use App\Models\Load; // adjust namespace if yours differs
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class LoadPodController extends Controller
{
    public function store(StorePodSignatureRequest $request, Load $load): RedirectResponse
    {
        // Optional auth/policy check:
        // $this->authorize('update', $load);

        // Decode data URL to a PNG and store it, or keep the data URL as-is.
        $dataUrl = $request->validated()['signature_png'];
        $path = null;

        if (preg_match('/^data:image\/png;base64,/', $dataUrl)) {
            $pngData = base64_decode(substr($dataUrl, strpos($dataUrl, ',') + 1));
            $filename = 'pod_signatures/'.now()->format('Ymd_His')."_load{$load->id}.png";
            $path = Storage::disk('public')->put($filename, $pngData) ? $filename : null;
        }

        // Persist fields on the Load (adjust column names to your schema)
        $load->update([
            'pod_signer_name'        => $request->string('signer_name'),
            'pod_signer_role'        => $request->string('signer_role'),
            'pod_signature_path'     => $path,                    // stored file path
            'pod_signature_data_url' => $path ? null : $dataUrl,  // fallback if you keep data URL
            'pod_lat'                => $request->float('lat'),
            'pod_lng'                => $request->float('lng'),
            'pod_accuracy_m'         => $request->integer('accuracy_m'),
            'pod_receiver_email'     => $request->string('receiver_email'),
            'pod_receiver_phone'     => $request->string('receiver_phone_e164'),
            'pod_submitted_at'       => now(),
            'status'                 => 'pod_submitted', // if you track status
        ]);

        // Optionally dispatch events / jobs here (Priority Passport checks, emails, etc.)

        return back()->with('success', 'POD submitted.');
    }
}
