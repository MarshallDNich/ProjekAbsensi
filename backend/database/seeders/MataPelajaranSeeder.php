<?php

namespace Database\Seeders;

use App\Models\Guru;
use App\Models\Kelas;
use App\Models\MataPelajaran;
use Illuminate\Database\Seeder;

class MataPelajaranSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dataMapel = [
            [
                'kode' => 'MTK',
                'nama' => 'Matematika',
                'deskripsi' => 'Mata pelajaran wajib mengenai logika, hitungan, serta pemecahan masalah matematis.',
                'status' => 'Aktif',
            ],
            [
                'kode' => 'BIN',
                'nama' => 'Bahasa Indonesia',
                'deskripsi' => 'Mata pelajaran wajib mengenai bahasa, sastra, dan keterampilan berkomunikasi.',
                'status' => 'Aktif',
            ],
            [
                'kode' => 'PWEB',
                'nama' => 'Pemrograman Web',
                'deskripsi' => 'Mata pelajaran kejuruan yang mempelajari pengembangan aplikasi berbasis web.',
                'status' => 'Aktif',
            ],
            [
                'kode' => 'BD',
                'nama' => 'Basis Data',
                'deskripsi' => 'Mata pelajaran kejuruan yang mempelajari perancangan dan pengelolaan basis data.',
                'status' => 'Aktif',
            ],
        ];

        foreach ($dataMapel as $mapel) {
            MataPelajaran::firstOrCreate(
                ['kode' => $mapel['kode']],
                $mapel
            );
        }

        // Demo relasi: hubungkan Guru yang sudah ada ke mapel & kelas agar
        // fitur Mata Pelajaran langsung memperlihatkan Guru Pengampu dan Kelas.
        $subjectNames = array_column($dataMapel, 'nama');
        $kelasIds = Kelas::pluck('id')->toArray();
        $gurus = Guru::all();

        $covered = [];

        foreach ($gurus as $guru) {
            // Hanya isi penugasan jika belum ada agar data yang sudah diisi tidak ditimpa.
            if (empty($guru->mata_pelajaran)) {
                $assignedMapel = collect($subjectNames)
                    ->shuffle()
                    ->take(rand(1, 2))
                    ->values()
                    ->toArray();

                $guru->update(['mata_pelajaran' => $assignedMapel]);
            }

            $covered = array_merge($covered, (array) ($guru->mata_pelajaran ?? []));

            if (!$guru->kelas()->exists()) {
                $assignedKelas = collect($kelasIds)
                    ->shuffle()
                    ->take(rand(1, 3))
                    ->values()
                    ->toArray();

                $guru->kelas()->sync($assignedKelas);
            }
        }

        // Pastikan setiap mapel punya minimal satu guru pengampu.
        $missing = array_values(array_diff($subjectNames, array_unique($covered)));
        if (!empty($missing)) {
            $count = min(count($missing), $gurus->count());
            foreach ($missing as $i => $name) {
                $target = $gurus->get($i % $gurus->count());
                if (!$target) {
                    break;
                }
                $mp = array_values(array_unique(array_merge((array) ($target->mata_pelajaran ?? []), [$name])));
                $target->update(['mata_pelajaran' => $mp]);
            }
            $this->command->info('✓ Menambahkan guru pengampu untuk: ' . implode(', ', $missing));
        }

        $this->command->info('✓ Mata pelajaran berhasil dibuat dan dihubungkan ke Guru & Kelas');
    }
}