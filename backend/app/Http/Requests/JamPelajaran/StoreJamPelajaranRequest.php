<?php

namespace App\Http\Requests\JamPelajaran;

use Illuminate\Foundation\Http\FormRequest;

class StoreJamPelajaranRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nama'        => ['required', 'string', 'max:50'],
            'jam_mulai'   => ['required', 'date_format:H:i'],
            'jam_selesai' => ['required', 'date_format:H:i', 'after:jam_mulai'],
            'urutan'      => ['required', 'integer', 'min:1'],
            'tipe'        => ['required', 'in:lesson,break'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required'        => 'Nama slot wajib diisi.',
            'jam_mulai.required'   => 'Jam mulai wajib diisi.',
            'jam_mulai.date_format'=> 'Format jam mulai tidak valid.',
            'jam_selesai.required' => 'Jam selesai wajib diisi.',
            'jam_selesai.after'    => 'Jam selesai harus setelah jam mulai.',
            'urutan.required'      => 'Urutan wajib diisi.',
            'urutan.integer'       => 'Urutan harus berupa angka.',
            'urutan.min'           => 'Urutan minimal 1.',
            'tipe.required'        => 'Tipe slot wajib dipilih.',
            'tipe.in'              => 'Tipe harus lesson atau break.',
        ];
    }
}
