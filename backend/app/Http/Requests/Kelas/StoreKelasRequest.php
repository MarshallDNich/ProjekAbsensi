<?php

namespace App\Http\Requests\Kelas;

use Illuminate\Foundation\Http\FormRequest;

class StoreKelasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_kelas' => ['required', 'string', 'max:50'],
            'tingkat' => ['required', 'in:X,XI,XII'],
            'jurusan' => ['required', 'string', 'max:100'],
            'wali_kelas' => ['nullable', 'exists:gurus,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama_kelas.required' => 'Nama kelas wajib diisi.',
            'tingkat.required' => 'Tingkat wajib dipilih.',
            'tingkat.in' => 'Tingkat harus X, XI, atau XII.',
            'jurusan.required' => 'Jurusan wajib diisi.',
            'wali_kelas.exists' => 'Data wali kelas tidak valid.',
        ];
    }
}