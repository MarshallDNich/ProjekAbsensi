<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\Siswa;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthRepository
{
    /**
     * Register siswa
     */
    public function register(array $data): User
    {
        return DB::transaction(function () use ($data) {

            // Simpan ke tabel users
            $user = User::create([
                'nama'     => $data['nama'],
                'email'    => $data['email'],
                'password' => Hash::make($data['password']),
                'role'     => 'Siswa',
            ]);

            // Simpan ke tabel siswas
            Siswa::create([
                'user_id'         => $user->id,
                'nisn'            => $data['nisn'],
                'jenis_kelamin'   => $data['jenis_kelamin'],
                'tanggal_lahir'   => $data['tanggal_lahir'],
                'alamat'          => $data['alamat'],
                'nomor_telepon'   => $data['nomor_telepon'],
                'kelas_id'        => null,
            ]);

            return $user;
        });
    }

    /**
     * Cari user berdasarkan email
     */
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }
}