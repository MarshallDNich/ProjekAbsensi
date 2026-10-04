<?php

namespace App\Http\Requests\JadwalPelajaran;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJadwalPelajaranRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'hari'              => ['nullable', 'in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu'],
            'jam_pelajaran_id'  => ['nullable', 'exists:jam_pelajaran,id'],
            'kelas_id'          => ['nullable', 'exists:kelas,id'],
            'guru_id'           => ['nullable', 'exists:gurus,id'],
            'mata_pelajaran_id' => ['nullable', 'exists:mata_pelajarans,id'],
        ];
    }
}
