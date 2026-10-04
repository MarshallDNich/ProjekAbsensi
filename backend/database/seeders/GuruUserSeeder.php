<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GuruUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $guruUsers = [
            [
                'nama' => 'Budi Santoso',
                'email' => 'budi@gmail.com',
                'password' => bcrypt('password'),
                'role' => 'Guru',
                'status' => 'Aktif',
            ],
            [
                'nama' => 'Siti Nurhaliza',
                'email' => 'siti@gmail.com',
                'password' => bcrypt('password'),
                'role' => 'Guru',
                'status' => 'Aktif',
            ],
            [
                'nama' => 'Ahmad Dahlan',
                'email' => 'ahmad@gmail.com',
                'password' => bcrypt('password'),
                'role' => 'Guru',
                'status' => 'Aktif',
            ],
        ];

        foreach ($guruUsers as $user) {
            \App\Models\User::create($user);
        }

        $this->command->info('✓ 3 User dengan role Guru berhasil dibuat');
    }
}
