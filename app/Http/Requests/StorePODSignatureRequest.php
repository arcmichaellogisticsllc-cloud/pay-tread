<?php

namespace App\Http\Requests;

use App\Http\Requests\StorePodSignatureRequest;

class StorePodSignatureRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Add real auth/policy if needed
        return true;
    }

    public function rules(): array
    {
        return [
            'signer_name'        => ['required', 'string', 'max:255'],
            'signer_role'        => ['required', 'string', 'max:64'],
            'signature_png'      => ['required', 'string'], // data URL "data:image/png;base64,..."
            'lat'                => ['nullable', 'numeric', 'between:-90,90'],
            'lng'                => ['nullable', 'numeric', 'between:-180,180'],
            'accuracy_m'         => ['nullable', 'integer', 'min:0', 'max:5000'],
            'receiver_email'     => ['nullable', 'email', 'max:255'],
            'receiver_phone_e164'=> ['nullable', 'string', 'max:32'],
        ];
    }
}
