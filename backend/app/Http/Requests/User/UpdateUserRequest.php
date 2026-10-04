<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
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
        $userId = $this->route('user') ? $this->route('user')->id : null;

        $rules = [
            'nama' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:100', Rule::unique('users', 'email')->ignore($userId)],
            'password' => ['nullable', 'string', 'min:8', 'max:255', 'confirmed'],
            'role' => ['required', 'in:Admin,Guru,Siswa'],
            'status' => ['nullable', 'in:Aktif,Nonaktif'],
            'foto' => ['nullable'],
        ];

        // Conditional rules for Siswa
        if ($this->input('role') === 'Siswa') {
            $rules['nisn'] = ['nullable', 'string', 'max:10'];
            if ($this->user && $this->user->siswa) {
                $rules['nisn'][] = Rule::unique('siswas', 'nisn')->ignore($this->user->siswa->id);
            } else {
                $rules['nisn'][] = 'unique:siswas,nisn';
            }
            $rules['kelas_id'] = ['nullable', 'exists:kelas,id'];
            $rules['jenis_kelamin'] = ['nullable', 'in:Laki-laki,Perempuan'];
            $rules['tanggal_lahir'] = ['nullable', 'date'];
            $rules['nomor_telepon'] = ['nullable', 'string', 'max:15'];
            $rules['alamat'] = ['nullable', 'string'];
        }

        // Conditional rules for Guru
        if ($this->input('role') === 'Guru') {
            $rules['nip'] = ['nullable', 'string', 'max:30'];
            if ($this->user && $this->user->guru) {
                $rules['nip'][] = Rule::unique('gurus', 'nip')->ignore($this->user->guru->id);
            } else {
                $rules['nip'][] = 'unique:gurus,nip';
            }
            $rules['jenis_kelamin'] = ['nullable', 'in:Laki-laki,Perempuan'];
            $rules['nomor_telepon'] = ['nullable', 'string', 'max:20'];
            $rules['alamat'] = ['nullable', 'string'];
            $rules['mata_pelajaran'] = ['nullable', 'string', 'max:100'];
            $rules['kelas_ids'] = ['nullable', 'array'];
            $rules['kelas_ids.*'] = ['exists:kelas,id'];
        }

        return $rules;
    }

    /**
     * Custom Messages
     */
    public function messages(): array
    {
        return [
            'nama.required' => 'Nama wajib diisi.',
            'nama.max' => 'Nama maksimal 100 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak sesuai.',
            'role.required' => 'Role wajib dipilih.',
            'role.in' => 'Role tidak valid.',
            'status.in' => 'Status tidak valid.',
            'nisn.unique' => 'NISN sudah digunakan.',
            'nisn.max' => 'NISN maksimal 10 karakter.',
            'kelas_id.exists' => 'Kelas yang dipilih tidak ditemukan.',
            'jenis_kelamin.in' => 'Jenis kelamin tidak valid.',
            'tanggal_lahir.date' => 'Tanggal lahir tidak valid.',
            'nomor_telepon.max' => 'Nomor telepon terlalu panjang.',
            'nip.unique' => 'NIP sudah digunakan.',
            'nip.max' => 'NIP maksimal 30 karakter.',
            'kelas_ids.*.exists' => 'Kelas yang dipilih tidak ditemukan.',
        ];
    }
}