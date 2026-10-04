<?php

namespace App\Http\Requests\PengajuanIzin;

use Illuminate\Foundation\Http\FormRequest;

class VerifikasiPengajuanIzinRequest extends FormRequest
{
    /**
     * Akses sudah dibatasi middleware role:Admin,Guru + pengecekan
     * canVerify() di controller/service.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'catatan' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'catatan.max' => 'Catatan verifikator maksimal 500 karakter.',
        ];
    }
}
