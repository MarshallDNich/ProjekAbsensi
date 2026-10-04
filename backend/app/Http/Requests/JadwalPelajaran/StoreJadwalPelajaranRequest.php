<?php

namespace App\Http\Requests\JadwalPelajaran;

use Illuminate\Foundation\Http\FormRequest;

class StoreJadwalPelajaranRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'hari'              => ['required', 'in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu'],
            'jam_pelajaran_id'  => ['required', 'exists:jam_pelajaran,id'],
            'kelas_id'          => ['required', 'exists:kelas,id'],
            'guru_id'           => ['required', 'exists:gurus,id'],
            'mata_pelajaran_id' => ['required', 'exists:mata_pelajarans,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'hari.required'              => 'Hari wajib dipilih.',
            'hari.in'                    => 'Hari tidak valid.',
            'jam_pelajaran_id.required'  => 'Jam pelajaran wajib dipilih.',
            'jam_pelajaran_id.exists'    => 'Jam pelajaran tidak ditemukan.',
            'kelas_id.required'          => 'Kelas wajib dipilih.',
            'kelas_id.exists'            => 'Kelas tidak ditemukan.',
            'guru_id.required'           => 'Guru wajib dipilih.',
            'guru_id.exists'             => 'Guru tidak ditemukan.',
            'mata_pelajaran_id.required' => 'Mata pelajaran wajib dipilih.',
            'mata_pelajaran_id.exists'   => 'Mata pelajaran tidak ditemukan.',
        ];
    }
}
