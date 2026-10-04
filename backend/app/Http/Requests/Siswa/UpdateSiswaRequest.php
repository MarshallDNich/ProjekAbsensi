<?php

namespace App\Http\Requests\Siswa;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kelas_id' => ['nullable', 'exists:kelas,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'kelas_id.exists' => 'Kelas tidak valid.',
        ];
    }
}