<?php

namespace Database\Seeders;

use App\Models\Guru;
use App\Models\User;
use Illuminate\Database\Seeder;

class GuruSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($i = 1; $i <= 10; $i++) {

            $user = User::factory()->create([
                'role' => 'Guru',
            ]);

            Guru::factory()->create([
                'user_id' => $user->id,
                'nama'    => $user->nama,
            ]);
        }
    }
}