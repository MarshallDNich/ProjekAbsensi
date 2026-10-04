<?php

namespace Database\Seeders;

use App\Models\Guru;
use App\Models\JamPelajaran;
use App\Models\JadwalPelajaran;
use App\Models\Kelas;
use App\Models\MataPelajaran;
use App\Models\Siswa;
use App\Models\User;
use Illuminate\Database\Seeder;

class DummyJadwalSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🚀 Generate dummy data jadwal pelajaran...');

        $this->seedMataPelajaran();
        $this->seedGuru();

        if (JamPelajaran::count() === 0) {
            $this->seedJamPelajaran();
        }

        $this->seedJadwalPelajaran();
        $this->seedSiswa();

        $this->command->info('✅ Selesai!');
        $this->command->info('   Mapel: ' . MataPelajaran::count());
        $this->command->info('   Guru: ' . Guru::count());
        $this->command->info('   Jam: ' . JamPelajaran::count());
        $this->command->info('   Jadwal: ' . JadwalPelajaran::count());
        $this->command->info('   Kelas: ' . Kelas::count());
        $this->command->info('   Siswa: ' . Siswa::count());
    }

    private function seedMataPelajaran(): void
    {
        $mapel = [
            ['kode' => 'MTK', 'nama' => 'Matematika'],
            ['kode' => 'BIN', 'nama' => 'Bahasa Indonesia'],
            ['kode' => 'BIG', 'nama' => 'Bahasa Inggris'],
            ['kode' => 'PAI', 'nama' => 'Pendidikan Agama Islam'],
            ['kode' => 'PPKn', 'nama' => 'PPKn'],
            ['kode' => 'PJOK', 'nama' => 'PJOK'],
            ['kode' => 'SEJ', 'nama' => 'Sejarah Indonesia'],
            ['kode' => 'PWEB', 'nama' => 'Pemrograman Web'],
            ['kode' => 'BD', 'nama' => 'Basis Data'],
            ['kode' => 'PBO', 'nama' => 'Pemrograman Berorientasi Objek'],
            ['kode' => 'ALGO', 'nama' => 'Algoritma dan Pemrograman'],
            ['kode' => 'RPL', 'nama' => 'Rekayasa Perangkat Lunak'],
            ['kode' => 'JARKOM', 'nama' => 'Jaringan Komputer'],
            ['kode' => 'SIMKOM', 'nama' => 'Sistem Komputer'],
            ['kode' => 'PROJ', 'nama' => 'Proyek Kreatif'],
            ['kode' => 'PWEB2', 'nama' => 'Pemrograman Web Lanjutan'],
            ['kode' => 'BD2', 'nama' => 'Basis Data Lanjutan'],
        ];

        foreach ($mapel as $m) {
            MataPelajaran::firstOrCreate(['kode' => $m['kode']], $m + ['deskripsi' => $m['nama'], 'status' => 'Aktif']);
        }

        $this->command->info('✓ Mapel: ' . MataPelajaran::count());
    }

    private function seedGuru(): void
    {
        if (Guru::count() > 1) {
            $this->command->info('✓ Guru sudah ada (' . Guru::count() . ')');
            return;
        }

        $data = [
            ['Dr. Ahmad Fauzi', '198001012005011001', ['Matematika'], 'Laki-laki'],
            ['Siti Nurhaliza, S.Pd', '198202022006042002', ['Bahasa Indonesia'], 'Perempuan'],
            ['John Smith, M.Pd', '198303032007051003', ['Bahasa Inggris'], 'Laki-laki'],
            ['Ustadz Abdullah', '198104042008061004', ['Pendidikan Agama Islam'], 'Laki-laki'],
            ['Drs. Budi Santoso', '197905052009071005', ['PPKn'], 'Laki-laki'],
            ['Rina Marlina, S.Pd', '198406062010082006', ['PJOK'], 'Perempuan'],
            ['Dr. Indra Gunawan', '197807072011091007', ['Sejarah Indonesia'], 'Laki-laki'],
            ['Andi Wijaya, S.Kom', '198508082012101008', ['Pemrograman Web'], 'Laki-laki'],
            ['Dewi Lestari, S.Kom', '198609092013112009', ['Basis Data'], 'Perempuan'],
            ['Rudi Hartono, S.Kom', '198710102014121010', ['Pemrograman Berorientasi Objek'], 'Laki-laki'],
            ['Maya Sari, S.Kom', '198811112015012011', ['Algoritma dan Pemrograman'], 'Perempuan'],
            ['Hendra Kusuma, S.T', '198912122016021012', ['Rekayasa Perangkat Lunak'], 'Laki-laki'],
            ['Fajar Nugroho, S.Kom', '199001012017031013', ['Jaringan Komputer'], 'Laki-laki'],
            ['Linda Permata, S.Kom', '199102022018042014', ['Sistem Komputer'], 'Perempuan'],
            ['Rizky Pratama, S.E', '199203032019051015', ['Proyek Kreatif'], 'Laki-laki'],
            ['Sari Indah, S.Kom', '199304042020062016', ['Pemrograman Web Lanjutan'], 'Perempuan'],
            ['Bayu Ramadhan, S.Kom', '199405052021071017', ['Basis Data Lanjutan'], 'Laki-laki'],
        ];

        foreach ($data as $g) {
            $email = strtolower(preg_replace('/[^a-z]/', '', explode(',', $g[0])[0])) . '@guru.sch.id';
            $user = User::firstOrCreate(
                ['email' => $email],
                ['nama' => $g[0], 'password' => bcrypt('password123'), 'role' => 'Guru', 'status' => 'Aktif']
            );
            Guru::firstOrCreate(
                ['nip' => $g[1]],
                [
                    'user_id' => $user->id, 'nip' => $g[1], 'nama' => $g[0],
                    'jenis_kelamin' => $g[3], 'mata_pelajaran' => $g[2],
                    'nomor_telepon' => '08' . rand(1000000000, 9999999999),
                    'email' => $user->email, 'status' => 'Aktif',
                    'alamat' => 'Jl. Pendidikan No. ' . rand(1, 100),
                ]
            );
        }

        $this->command->info('✓ Guru: ' . Guru::count());
    }

    private function seedJamPelajaran(): void
    {
        $jam = [
            ['Jam ke-1', '07:00:00', '07:40:00', 1, 'lesson'],
            ['Jam ke-2', '07:40:00', '08:20:00', 2, 'lesson'],
            ['Jam ke-3', '08:20:00', '09:00:00', 3, 'lesson'],
            ['Istirahat Pertama', '09:00:00', '09:20:00', 4, 'break'],
            ['Jam ke-4', '09:20:00', '10:00:00', 5, 'lesson'],
            ['Jam ke-5', '10:00:00', '10:40:00', 6, 'lesson'],
            ['Jam ke-6', '10:40:00', '11:20:00', 7, 'lesson'],
            ['Istirahat Kedua', '11:20:00', '12:00:00', 8, 'break'],
            ['Jam ke-7', '12:00:00', '12:40:00', 9, 'lesson'],
            ['Jam ke-8', '12:40:00', '13:20:00', 10, 'lesson'],
            ['Jam ke-9', '13:20:00', '14:00:00', 11, 'lesson'],
        ];

        foreach ($jam as $j) {
            JamPelajaran::firstOrCreate(
                ['nama' => $j[0], 'urutan' => $j[3]],
                ['nama' => $j[0], 'jam_mulai' => $j[1], 'jam_selesai' => $j[2], 'urutan' => $j[3], 'tipe' => $j[4]]
            );
        }

        $this->command->info('✓ Jam: ' . JamPelajaran::count());
    }

    private function seedJadwalPelajaran(): void
    {
        JadwalPelajaran::truncate();

        $hari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
        $kelas = Kelas::orderBy('id')->get();
        $jam = JamPelajaran::where('tipe', 'lesson')->orderBy('urutan')->get();

        // Map guru -> mapel names
        $guruPerMapel = [];
        foreach (Guru::all() as $g) {
            foreach ((array) ($g->mata_pelajaran ?? []) as $m) {
                $guruPerMapel[$m][] = $g->id;
            }
        }

        // Track busy: guru_id -> hari -> jam_id => true
        $busy = [];
        $total = 0;

        // Template: [hari][jam_index] = mapel nama or null
        // jam_index 0-8 for jam ke-1 to ke-9
        $templates = [
            'X' => [
                ['Pendidikan Agama Islam', 'PPKn', 'Matematika', 'Bahasa Indonesia', 'Algoritma dan Pemrograman', 'Pemrograman Web', 'PJOK', 'Proyek Kreatif', null],
                ['Bahasa Inggris', 'Matematika', 'Sejarah Indonesia', 'Pemrograman Berorientasi Objek', 'Basis Data', 'Pemrograman Web', 'PJOK', 'Sistem Komputer', null],
                ['Matematika', 'Bahasa Indonesia', 'Algoritma dan Pemrograman', 'Pemrograman Web', 'Basis Data', 'Pemrograman Berorientasi Objek', 'Jaringan Komputer', 'PPKn', null],
                ['PPKn', 'Bahasa Inggris', 'Matematika', 'Rekayasa Perangkat Lunak', 'Pemrograman Web Lanjutan', 'Basis Data Lanjutan', 'Sistem Komputer', 'PJOK', null],
                ['Pendidikan Agama Islam', 'Bahasa Indonesia', 'Matematika', 'Proyek Kreatif', 'Jaringan Komputer', 'Rekayasa Perangkat Lunak', 'Pemrograman Berorientasi Objek', 'Bahasa Inggris', null],
            ],
            'XI' => [
                ['Pendidikan Agama Islam', 'PPKn', 'Algoritma dan Pemrograman', 'Pemrograman Web', 'Basis Data', 'Pemrograman Berorientasi Objek', 'PJOK', 'Rekayasa Perangkat Lunak', null],
                ['Matematika', 'Bahasa Indonesia', 'Algoritma dan Pemrograman', 'Pemrograman Web Lanjutan', 'Basis Data Lanjutan', 'Jaringan Komputer', 'PJOK', 'Proyek Kreatif', null],
                ['Bahasa Inggris', 'Matematika', 'Pemrograman Berorientasi Objek', 'Basis Data', 'Pemrograman Web', 'Rekayasa Perangkat Lunak', 'Sistem Komputer', 'PPKn', null],
                ['PPKn', 'Sejarah Indonesia', 'Algoritma dan Pemrograman', 'Pemrograman Web', 'Jaringan Komputer', 'Sistem Komputer', 'Basis Data', 'PJOK', null],
                ['Pendidikan Agama Islam', 'Bahasa Indonesia', 'Matematika', 'Rekayasa Perangkat Lunak', 'Pemrograman Berorientasi Objek', 'Basis Data Lanjutan', 'Proyek Kreatif', 'Bahasa Inggris', null],
            ],
            'XII' => [
                ['Pendidikan Agama Islam', 'PPKn', 'Pemrograman Web', 'Basis Data', 'Rekayasa Perangkat Lunak', 'Pemrograman Berorientasi Objek', 'PJOK', 'Proyek Kreatif', null],
                ['Matematika', 'Bahasa Indonesia', 'Pemrograman Web Lanjutan', 'Basis Data Lanjutan', 'Jaringan Komputer', 'Rekayasa Perangkat Lunak', 'PJOK', 'Sistem Komputer', null],
                ['Bahasa Inggris', 'Matematika', 'Algoritma dan Pemrograman', 'Pemrograman Web', 'Basis Data', 'Pemrograman Berorientasi Objek', 'Sistem Komputer', 'PPKn', null],
                ['PPKn', 'Sejarah Indonesia', 'Pemrograman Web', 'Rekayasa Perangkat Lunak', 'Jaringan Komputer', 'Basis Data Lanjutan', 'Pemrograman Berorientasi Objek', 'PJOK', null],
                ['Pendidikan Agama Islam', 'Bahasa Indonesia', 'Matematika', 'Proyek Kreatif', 'Pemrograman Web Lanjutan', 'Algoritma dan Pemrograman', 'Basis Data', 'Bahasa Inggris', null],
            ],
        ];

        foreach ($kelas as $k) {
            $template = $templates[$k->tingkat] ?? $templates['X'];

            for ($h = 0; $h < count($hari); $h++) {
                for ($j = 0; $j < count($jam); $j++) {
                    $mapelNama = $template[$h][$j] ?? null;
                    if (empty($mapelNama)) continue;

                    $jamId = $jam[$j]->id;
                    $mapelObj = MataPelajaran::where('nama', $mapelNama)->first();
                    if (!$mapelObj) continue;

                    $available = $guruPerMapel[$mapelNama] ?? [];
                    $assigned = null;

                    // Find first free guru who teaches this mapel
                    $assigned = null;
                    foreach ($available as $gid) {
                        if (empty($busy[$gid][$hari[$h]][$jamId])) {
                            $assigned = $gid;
                            break;
                        }
                    }

                    // If all gurus for this mapel are busy, SKIP this slot
                    // (don't force-assign - will violate unique constraint)
                    if (!$assigned) continue;

                    $busy[$assigned][$hari[$h]][$jamId] = true;

                    JadwalPelajaran::create([
                        'hari' => $hari[$h],
                        'jam_pelajaran_id' => $jamId,
                        'kelas_id' => $k->id,
                        'guru_id' => $assigned,
                        'mata_pelajaran_id' => $mapelObj->id,
                    ]);

                    $total++;
                }
            }
        }

        $this->command->info('✓ Jadwal: ' . $total . ' item');
    }

    private function seedSiswa(): void
    {
        $kelas = Kelas::orderBy('id')->get();
        $total = 0;

        $depan = ['Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hendra', 'Indah', 'Joko',
            'Kartika', 'Lukman', 'Maya', 'Nanda', 'Oka', 'Putri', 'Rizky', 'Sari', 'Tono', 'Umar',
            'Vina', 'Wahyu', 'Yudi', 'Zahra', 'Adi', 'Bella', 'Candra', 'Dina', 'Erik', 'Fitri'];
        $belakang = ['Pratama', 'Wijaya', 'Santoso', 'Saputra', 'Hidayat', 'Ramadhan', 'Putra', 'Kusuma',
            'Hakim', 'Maulana', 'Fauzi', 'Nugroho', 'Sudrajat', 'Wirawan', 'Kurniawan', 'Setiawan',
            'Permata', 'Lestari', 'Anggraini', 'Puspita'];

        $tingkatCode = ['X' => '1', 'XI' => '2', 'XII' => '3'];

        foreach ($kelas as $k) {
            if ($k->siswa()->count() > 0) continue;

            $jumlah = rand(28, 35);

            for ($i = 1; $i <= $jumlah; $i++) {
                $d = $depan[array_rand($depan)];
                $b = $belakang[array_rand($belakang)];
                $nama = $d . ' ' . $b;

                // NISN max 10 digits
                $nisn = $tingkatCode[$k->tingkat] . sprintf('%06d', $k->id * 100 + $i) . sprintf('%02d', rand(0, 99));
                $nisn = substr($nisn, 0, 10); // Ensure 10 chars max

                $email = strtolower(preg_replace('/[^a-z]/', '', $d . $b)) . $i . '@siswa.sch.id';

                $user = User::firstOrCreate(
                    ['email' => $email],
                    ['nama' => $nama, 'password' => bcrypt('password123'), 'role' => 'Siswa', 'status' => 'Aktif']
                );

                Siswa::firstOrCreate(
                    ['nisn' => $nisn],
                    [
                        'user_id' => $user->id, 'nisn' => $nisn, 'kelas_id' => $k->id,
                        'jenis_kelamin' => rand(0, 1) ? 'Laki-laki' : 'Perempuan',
                        'tanggal_lahir' => rand(2006, 2010) . '-' . rand(1, 12) . '-' . rand(1, 28),
                        'nomor_telepon' => '08' . rand(1000000000, 9999999999),
                        'alamat' => 'Jl. Pendidikan No. ' . rand(1, 200),
                    ]
                );

                $total++;
            }
        }

        $this->command->info('✓ Siswa baru: ' . $total . ' (Total: ' . Siswa::count() . ')');
    }
}
