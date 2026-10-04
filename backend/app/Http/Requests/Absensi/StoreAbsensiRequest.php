<?php

namespace App\Http\Requests\Absensi;

use App\Rules\Base64Image;
use Illuminate\Foundation\Http\FormRequest;

class StoreAbsensiRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation Rules
     *
     * Siswa_id, tanggal, jam_masuk, dan status diambil langsung dari
     * server (token + waktu server), sehingga tidak diterima dari client.
     */
    public function rules(): array
    {
        return [

            'foto' => [
                'required',
                new Base64Image,
            ],

            'keterangan' => [
                'nullable',
                'string',
                'max:255',
            ],

            'frames' => [
                'required',
                'array',
                'min:4',
            ],

            'frames.*' => [
                new Base64Image,
            ],

            'enroll' => [
                'nullable',
                'boolean',
            ],

        ];
    }

    /**
     * Custom Messages
     */
    public function messages(): array
    {
        return [

            'foto.required' => 'Foto bukti absensi wajib dikirim.',

            'frames.required' => 'Sekuens frame wajah wajib dikirim untuk verifikasi hidup.',

            'frames.min' => 'Minimal 4 frame wajah diperlukan untuk deteksi kedipan.',

            'keterangan.max' => 'Keterangan maksimal 255 karakter.',

        ];
    }
}
