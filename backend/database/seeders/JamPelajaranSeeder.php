<?php

namespace Database\Seeders;

use App\Models\Guru;
use App\Models\JamPelajaran;
use Illuminate\Database\Seeder;

class JamPelajaranSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dataJam = [
            [
                'nama'       => 'Jam ke-1',
                'jam_mulai'  => '07:00:00',
                'jam_selesai'=> '07:40:00',
                'urutan'     => 1,
                'tipe'       => 'lesson',
            ],
            [
                'nama'       => 'Jam ke-2',
                'jam_mulai'  => '07:40:00',
                'jam_selesai'=> '08:20:00',
                'urutan'     => 2,
                'tipe'       => 'lesson',
            ],
            [
                'nama'       => 'Jam ke-3',
                'jam_mulai'  => '08:20:00',
                'jam_selesai'=> '09:00:00',
                'urutan'     => 3,
                'tipe'       => 'lesson',
            ],
            [
                'nama'       => 'Istirahat Pertama',
                'jam_mulai'  => '09:00:00',
                'jam_selesai'=> '09:20:00',
                'urutan'     => 4,
                'tipe'       => 'break',
            ],
            [
                'nama'       => 'Jam ke-4',
                'jam_mulai'  => '09:20:00',
                'jam_selesai'=> '10:00:00',
                'urutan'     => 5,
                'tipe'       => 'lesson',
            ],
            [
                'nama'       => 'Jam ke-5',
                'jam_mulai'  => '10:00:00',
                'jam_selesai'=> '10:40:00',
                'urutan'     => 6,
                'tipe'       => 'lesson',
            ],
            [
                'nama'       => 'Jam ke-6',
                'jam_mulai'  => '10:40:00',
                'jam_selesai'=> '11:20:00',
                'urutan'     => 7,
                'tipe'       => 'lesson',
            ],
            [
                'nama'       => 'Istirahat Kedua',
                'jam_mulai'  => '11:20:00',
                'jam_selesai'=> '12:00:00',
                'urutan'     => 8,
                'tipe'       => 'break',
            ],
            [
                'nama'       => 'Jam ke-7',
                'jam_mulai'  => '12:00:00',
                'jam_selesai'=> '12:40:00',
                'urutan'     => 9,
                'tipe'       => 'lesson',
            ],
            [
                'nama'       => 'Jam ke-8',
                'jam_mulai'  => '12:40:00',
                'jam_selesai'=> '13:20:00',
                'urutan'     => 10,
                'tipe'       => 'lesson',
            ],
            [
                'nama'       => 'Jam ke-9',
                'jam_mulai'  => '13:20:00',
                'jam_selesai'=> '14:00:00',
                'urutan'     => 11,
                'tipe'       => 'lesson',
            ],
        ];

        foreach ($dataJam as $jam) {
            JamPelajaran::firstOrCreate(
                ['nama' => $jam['nama'], 'urutan' => $jam['urutan']],
                $jam
            );
        }

        $this->command->info('✓ ' . count($dataJam) . ' jam pelajaran berhasil dibuat');
    }
}
