<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            [
                'email' => 'admin@absensi.com'
            ],
            [
                'nama' => 'Administrator',
                'password' => Hash::make('password'),
                'role' => 'Admin',
                'foto' => null,
            ]
        );
    }
}