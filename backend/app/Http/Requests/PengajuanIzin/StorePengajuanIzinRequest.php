<?php

namespace App\Http\Requests\PengajuanIzin;

use Illuminate\Foundation\Http\FormRequest;

class StorePengajuanIzinRequest extends FormRequest
{
    /**
     * Hanya role Siswa yang boleh mengakses (dibatasi middleware role:Siswa).
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tanggal_mulai'  => ['required', 'date', 'before_or_equal:tanggal_selesai'],
            'tanggal_selesai' => ['required', 'date', 'after_or_equal:tanggal_mulai'],
            'jenis'          => ['required', 'in:izin,sakit,dispensasi'],
            'alasan'         => ['required', 'string', 'max:500'],
            'bukti'          => ['required', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'tanggal_mulai.required'      => 'Tanggal mulai wajib diisi.',
            'tanggal_mulai.date'          => 'Format tanggal mulai tidak valid.',
            'tanggal_mulai.before_or_equal' => 'Tanggal mulai tidak boleh setelah tanggal selesai.',
            'tanggal_selesai.required'    => 'Tanggal selesai wajib diisi.',
            'tanggal_selesai.date'        => 'Format tanggal selesai tidak valid.',
            'tanggal_selesai.after_or_equal' => 'Tanggal selesai tidak boleh sebelum tanggal mulai.',
            'jenis.required'              => 'Jenis pengajuan wajib dipilih.',
            'jenis.in'                    => 'Jenis pengajuan harus izin, sakit, atau dispensasi.',
            'alasan.required'             => 'Alasan wajib diisi.',
            'alasan.max'                  => 'Alasan maksimal 500 karakter.',
            'bukti.required'              => 'Bukti/surat wajib diunggah.',
            'bukti.file'                  => 'Bukti harus berupa file.',
            'bukti.mimes'                 => 'Bukti hanya boleh berformat jpeg, jpg, png, atau pdf.',
            'bukti.max'                   => 'Ukuran bukti maksimal 2MB.',
        ];
    }
}
