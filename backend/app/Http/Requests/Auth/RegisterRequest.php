<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'nama' => [
                'required',
                'string',
                'max:100',
            ],

            'email' => [
                'required',
                'email',
                'max:100',
                Rule::unique('users', 'email'),
            ],

            'nisn' => [
                'required',
                'digits:10',
                'unique:siswas,nisn',
            ],

            'jenis_kelamin' => [
                'required',
                'in:Laki-laki,Perempuan',
            ],

            'tanggal_lahir' => [
                'required',
                'date',
            ],

            'alamat' => [
                'required',
                'string',
            ],

            'nomor_telepon' => [
                'required',
                'digits_between:10,15',
                'regex:/^08[0-9]+$/',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],

        ];
    }

    public function messages(): array
    {
        return [

            'nama.required' => 'Nama wajib diisi.',

            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan.',

            'nisn.required' => 'NISN wajib diisi.',
            'nisn.unique' => 'NISN sudah digunakan.',

            'jenis_kelamin.required' => 'Jenis kelamin wajib dipilih.',

            'tanggal_lahir.required' => 'Tanggal lahir wajib diisi.',

            'alamat.required' => 'Alamat wajib diisi.',

            'nomor_telepon.required' => 'Nomor telepon wajib diisi.',
            'nomor_telepon.regex' => 'Nomor telepon harus diawali 08.',
            'nomor_telepon.digits_between' => 'Nomor telepon harus 10-15 digit.',

            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak sesuai.',

        ];
    }
}