<?php

namespace App\Http\Requests\Face;

use App\Rules\Base64Image;
use Illuminate\Foundation\Http\FormRequest;

class RegisterFaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'images' => ['required', 'array', 'min:1', 'max:10'],

            'images.*' => ['required', new Base64Image],

        ];
    }

    public function messages(): array
    {
        return [

            'images.required' => 'Minimal satu sampel wajah diperlukan.',
            'images.array'    => 'Format sampel wajah tidak valid.',
            'images.min'       => 'Minimal satu sampel wajah diperlukan.',
            'images.max'       => 'Maksimal 10 sampel wajah.',

        ];
    }
}
