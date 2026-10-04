<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SiswaUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $siswaUsers = [
            [
                'nama' => 'Andi Pratama',
                'email' => 'andi@gmail.com',
                'password' => bcrypt('password'),
                'role' => 'Siswa',
                'status' => 'Aktif',
            ],
            [
                'nama' => 'Rina Wijaya',
                'email' => 'rina@gmail.com',
                'password' => bcrypt('password'),
                'role' => 'Siswa',
                'status' => 'Aktif',
            ],
            [
                'nama' => 'Doni Kurniawan',
                'email' => 'doni@gmail.com',
                'password' => bcrypt('password'),
                'role' => 'Siswa',
                'status' => 'Aktif',
            ],
            [
                'nama' => 'Sari Lestari',
                'email' => 'sari@gmail.com',
                'password' => bcrypt('password'),
                'role' => 'Siswa',
                'status' => 'Aktif',
            ],
            [
                'nama' => 'Budi Santoso',
                'email' => 'budis@gmail.com',
                'password' => bcrypt('password'),
                'role' => 'Siswa',
                'status' => 'Aktif',
            ],
        ];

        foreach ($siswaUsers as $user) {
            \App\Models\User::create($user);
        }

        $this->command->info('✓ 5 User dengan role Siswa berhasil dibuat');
    }
}
