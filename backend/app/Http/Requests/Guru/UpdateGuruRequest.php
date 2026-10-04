<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGuruRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mata_pelajaran' => ['nullable', 'array'],
            'mata_pelajaran.*' => ['string', 'max:100'],
            'kelas_ids' => ['nullable', 'array'],
            'kelas_ids.*' => ['exists:kelas,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'kelas_ids.*.exists' => 'Kelas yang dipilih tidak valid.',
        ];
    }
}