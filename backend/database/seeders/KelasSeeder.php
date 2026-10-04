<?php

namespace Database\Seeders;

use App\Models\Guru;
use App\Models\Kelas;
use Illuminate\Database\Seeder;

class KelasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $guruIds = Guru::pluck('id')->toArray();

        $dataKelas = [
            [
                'nama_kelas' => 'X RPL 1',
                'tingkat' => 'X',
                'jurusan' => 'Rekayasa Perangkat Lunak',
            ],
            [
                'nama_kelas' => 'X RPL 2',
                'tingkat' => 'X',
                'jurusan' => 'Rekayasa Perangkat Lunak',
            ],
            [
                'nama_kelas' => 'XI RPL 1',
                'tingkat' => 'XI',
                'jurusan' => 'Rekayasa Perangkat Lunak',
            ],
            [
                'nama_kelas' => 'XI RPL 2',
                'tingkat' => 'XI',
                'jurusan' => 'Rekayasa Perangkat Lunak',
            ],
            [
                'nama_kelas' => 'XII RPL 1',
                'tingkat' => 'XII',
                'jurusan' => 'Rekayasa Perangkat Lunak',
            ],
            [
                'nama_kelas' => 'XII RPL 2',
                'tingkat' => 'XII',
                'jurusan' => 'Rekayasa Perangkat Lunak',
            ],
        ];

        foreach ($dataKelas as $index => $kelas) {

            Kelas::create([
                'nama_kelas' => $kelas['nama_kelas'],
                'tingkat'    => $kelas['tingkat'],
                'jurusan'    => $kelas['jurusan'],
                'guru_id'    => $guruIds[$index] ?? null,
            ]);

        }
    }
}