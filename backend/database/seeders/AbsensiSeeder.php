<?php

namespace Database\Seeders;

use App\Models\Absensi;
use App\Models\Siswa;
use Illuminate\Database\Seeder;

class AbsensiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $siswas = Siswa::all();

        foreach ($siswas as $siswa) {

            // Buat data absensi selama 20 hari terakhir
            for ($i = 20; $i >= 1; $i--) {

                $tanggal = now()->subDays($i)->toDateString();

                $status = fake()->randomElement([
                    'hadir',
                    'hadir',
                    'hadir',
                    'hadir',
                    'izin',
                    'sakit',
                    'alpa',
                ]);

                Absensi::create([

                    'siswa_id' => $siswa->id,

                    'tanggal' => $tanggal,

                    'jam_masuk' => $status === 'hadir'
                        ? fake()->time('H:i:s', '07:30:00')
                        : null,

                    'jam_keluar' => $status === 'hadir'
                        ? fake()->time('H:i:s', '15:30:00')
                        : null,

                    'status' => $status,

                    'metode' => 'face_recognition',

                    'confidence_score' => $status === 'hadir'
                        ? fake()->randomFloat(4, 0.82, 0.99)
                        : null,

                    'keterangan' => match ($status) {
                        'izin' => 'Izin mengikuti kegiatan',
                        'sakit' => 'Sakit',
                        'alpa' => 'Tidak hadir tanpa keterangan',
                        default => null,
                    },

                ]);
            }
        }
    }
}