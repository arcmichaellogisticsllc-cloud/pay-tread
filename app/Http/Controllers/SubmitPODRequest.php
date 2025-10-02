<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitPODRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // add your auth/ability checks here
    }

    public function rules(): array
    {
        return [
            'signer_name' => ['required','string','max:120'],
            'signer_role' => ['required','string','max:60'],
            'signature_png' => ['required','string','starts_with:data:image/png;base64,'],
            'lat' => ['nullable','numeric','between:-90,90'],
            'lng' => ['nullable','numeric','between:-180,180'],
            'accuracy_m' => ['nullable','numeric','min:0'],
            'receiver_email' => ['nullable','email'],
            'receiver_phone_e164' => ['nullable','string','max:20'],
        ];
    }
}
