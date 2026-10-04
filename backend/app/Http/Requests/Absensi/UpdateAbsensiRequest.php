<?php

namespace App\Http\Requests\Absensi;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAbsensiRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [

            'siswa_id' => [
                'required',
                'exists:siswas,id',
            ],

            'tanggal' => [
                'required',
                'date',
            ],

            'jam_masuk' => [
                'nullable',
                'date_format:H:i:s',
            ],

            'jam_keluar' => [
                'nullable',
                'date_format:H:i:s',
            ],

            'status' => [
                'required',
                'in:Hadir,Izin,Sakit,Alpha',
            ],

            'keterangan' => [
                'nullable',
                'string',
                'max:255',
            ],

        ];
    }

    /**
     * Custom Messages
     */
    public function messages(): array
    {
        return [

            'siswa_id.required' => 'Siswa wajib dipilih.',
            'siswa_id.exists' => 'Siswa tidak ditemukan.',

            'tanggal.required' => 'Tanggal absensi wajib diisi.',

            'jam_masuk.date_format' => 'Format jam masuk harus HH:MM:SS.',

            'jam_keluar.date_format' => 'Format jam keluar harus HH:MM:SS.',

            'status.required' => 'Status kehadiran wajib dipilih.',
            'status.in' => 'Status kehadiran tidak valid.',

            'keterangan.max' => 'Keterangan maksimal 255 karakter.',

        ];
    }
}