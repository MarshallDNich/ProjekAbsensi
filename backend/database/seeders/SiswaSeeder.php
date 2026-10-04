<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Kelas;
use App\Models\Siswa;
use Illuminate\Database\Seeder;

class SiswaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kelasIds = Kelas::pluck('id')->toArray();

        $jumlahSiswa = 30;

        for ($i = 0; $i < $jumlahSiswa; $i++) {

            // Membuat akun user siswa
            $user = User::factory()->create([
                'role' => 'Siswa',
            ]);

            // Membuat data siswa
            Siswa::factory()->create([
                'user_id'  => $user->id,
                'kelas_id' => $kelasIds[$i % count($kelasIds)],
            ]);
        }
    }
}