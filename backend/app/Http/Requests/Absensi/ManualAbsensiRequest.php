<?php

namespace App\Http\Requests\Absensi;

use App\Rules\Base64Image;
use Illuminate\Foundation\Http\FormRequest;

class ManualAbsensiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'siswa_id' => ['required', 'exists:siswas,id'],

            'tanggal' => ['nullable', 'date'],

            'jam_masuk' => ['nullable', 'date_format:H:i:s'],

            'jam_keluar' => ['nullable', 'date_format:H:i:s'],

            'status' => ['required', 'in:hadir,terlambat,izin,sakit,alpa'],

            'keterangan' => ['nullable', 'string', 'max:255'],

            'foto' => ['nullable', new Base64Image],

        ];
    }

    public function messages(): array
    {
        return [

            'siswa_id.required' => 'Siswa wajib dipilih.',
            'siswa_id.exists'   => 'Siswa tidak ditemukan.',

            'status.required'    => 'Status kehadiran wajib dipilih.',
            'status.in'          => 'Status kehadiran tidak valid.',

            'keterangan.max'     => 'Keterangan maksimal 255 karakter.',

        ];
    }
}
