<?php

namespace App\Http\Requests\JamPelajaran;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJamPelajaranRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nama'        => ['nullable', 'string', 'max:50'],
            'jam_mulai'   => ['nullable', 'date_format:H:i'],
            'jam_selesai' => ['nullable', 'date_format:H:i', 'after:jam_mulai'],
            'urutan'      => ['nullable', 'integer', 'min:1'],
            'tipe'        => ['nullable', 'in:lesson,break'],
        ];
    }
}
