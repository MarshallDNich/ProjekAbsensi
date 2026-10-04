<?php

namespace App\Http\Requests\Siswa;

use Illuminate\Foundation\Http\FormRequest;

class StoreSiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id', 'unique:siswas,user_id'],
            'kelas_id' => ['nullable', 'exists:kelas,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'User wajib dipilih.',
            'user_id.exists' => 'User tidak ditemukan.',
            'user_id.unique' => 'Siswa ini sudah memiliki kelas.',
            'kelas_id.exists' => 'Kelas tidak valid.',
        ];
    }
}