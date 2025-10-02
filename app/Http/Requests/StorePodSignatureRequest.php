<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePodSignatureRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Gate this as needed (auth, policies, etc.)
        return true;
    }

    public function rules(): array
    {
        return [
            'signer_name'          => ['required', 'string', 'max:100'],
            'signer_role'          => ['required', 'in:receiver,shipper_rep'],
            'signature_png'        => ['required', 'string'], // data URL (base64)
            'lat'                  => ['nullable', 'numeric', 'between:-90,90'],
            'lng'                  => ['nullable', 'numeric', 'between:-180,180'],
            'accuracy_m'           => ['nullable', 'integer', 'min:0'],
            'receiver_email'       => ['nullable', 'email'],
            'receiver_phone_e164'  => ['nullable', 'string', 'max:20'],
        ];
    }
}
