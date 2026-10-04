<?php

namespace App\Http\Requests\MataPelajaran;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMataPelajaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:100'],
            'kode' => ['required', 'string', 'max:20', Rule::unique('mata_pelajarans', 'kode')->ignore($this->route('mata_pelajaran'))],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', Rule::in(['Aktif', 'Tidak Aktif'])],
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required' => 'Nama mata pelajaran wajib diisi.',
            'kode.required' => 'Kode mata pelajaran wajib diisi.',
            'kode.unique' => 'Kode mata pelajaran sudah digunakan.',
            'status.required' => 'Status wajib dipilih.',
        ];
    }
}