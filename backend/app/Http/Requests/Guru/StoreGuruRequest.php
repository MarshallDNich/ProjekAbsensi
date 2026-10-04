<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class StoreGuruRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id', 'unique:gurus,user_id'],
            'mata_pelajaran' => ['nullable', 'array'],
            'mata_pelajaran.*' => ['string', 'max:100'],
            'kelas_ids' => ['nullable', 'array'],
            'kelas_ids.*' => ['exists:kelas,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'User wajib dipilih.',
            'user_id.exists' => 'User tidak ditemukan.',
            'user_id.unique' => 'Guru ini sudah memiliki penugasan.',
            'kelas_ids.*.exists' => 'Kelas yang dipilih tidak valid.',
        ];
    }
}