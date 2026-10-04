<?php

namespace App\Repositories;

use App\Models\Guru;
use App\Models\MataPelajaran;
use Illuminate\Support\Collection;

class MataPelajaranRepository
{
    public function getAll(array $filters = [])
    {
        $query = MataPelajaran::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('kode', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $sortBy = $filters['sort_by'] ?? 'kode';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        $query->orderBy($sortBy, $sortOrder);

        $result = $query->paginate($filters['per_page'] ?? 10);

        $this->attachAssignments($result->getCollection());

        return $result;
    }

    public function findById(MataPelajaran $mataPelajaran): MataPelajaran
    {
        $this->attachAssignments(collect([$mataPelajaran]));
        return $mataPelajaran;
    }

    public function create(array $data): MataPelajaran
    {
        $data = $this->normalize($data);
        $mataPelajaran = MataPelajaran::create($data);
        $this->attachAssignments(collect([$mataPelajaran]));
        return $mataPelajaran;
    }

    public function update(MataPelajaran $mataPelajaran, array $data): MataPelajaran
    {
        $mataPelajaran->update($this->normalize($data));
        $mataPelajaran = $mataPelajaran->fresh();
        $this->attachAssignments(collect([$mataPelajaran]));
        return $mataPelajaran;
    }

    public function delete(MataPelajaran $mataPelajaran): bool
    {
        return $mataPelajaran->delete();
    }

    /**
     * Normalisasi: kode di-uppercase & trim, nama di-trim.
     */
    private function normalize(array $data): array
    {
        if (isset($data['kode'])) {
            $data['kode'] = strtoupper(trim($data['kode']));
        }
        if (isset($data['nama'])) {
            $data['nama'] = trim($data['nama']);
        }
        if (isset($data['deskripsi']) && trim((string) ($data['deskripsi'] ?? '')) === '') {
            $data['deskripsi'] = null;
        }
        return $data;
    }

    /**
     * Relasi Guru + Kelas diturunkan dari penugasan Guru yang sudah ada.
     *
     * Karena fitur penugasan Guru menyimpan nama mata pelajaran (JSON free-text)
     * dan kelas yang diampu (pivot guru_kelas), maka:
     * - Guru Pengampu  = Guru yang memuat nama mapel ini pada kolom `mata_pelajaran`.
     * - Kelas          = gabungan kelas yang diampu oleh para Guru pengampu tersebut.
     *
     * Hasilnya dilekatkan ke setiap model MataPelajaran berupa:
     * guru_pengampu[], kelas_list[], guru_count, kelas_count
     */
    private function attachAssignments(Collection $subjects): void
    {
        if ($subjects->isEmpty()) {
            return;
        }

        // Muat semua Guru sekali saja untuk menghindari N+1.
        $guruAll = Guru::with(['kelas'])
            ->whereHas('user', fn ($q) => $q->where('role', 'Guru'))
            ->get();

        $subjects->each(function (MataPelajaran $subject) use ($guruAll) {
            $needle = mb_strtolower($subject->nama);

            $guruMap = [];
            $kelasMap = [];

            foreach ($guruAll as $guru) {
                $mpNames = array_map('mb_strtolower', (array) ($guru->mata_pelajaran ?? []));

                if (!in_array($needle, $mpNames, true)) {
                    continue;
                }

                $guruMap[$guru->id] = [
                    'guru_id' => $guru->id,
                    'nama' => $guru->user?->nama ?? $guru->nama,
                    'email' => $guru->user?->email ?? null,
                    'foto' => $guru->user?->foto ? url('storage/' . $guru->user->foto) : null,
                ];

                foreach ($guru->kelas as $kelas) {
                    $kelasMap[$kelas->id] = [
                        'kelas_id' => $kelas->id,
                        'nama_kelas' => $kelas->nama_kelas,
                        'tingkat' => $kelas->tingkat,
                        'jurusan' => $kelas->jurusan,
                    ];
                }
            }

            $subject->guru_pengampu = array_values($guruMap);
            $subject->kelas_list = array_values($kelasMap);
            $subject->guru_count = count($subject->guru_pengampu);
            $subject->kelas_count = count($subject->kelas_list);
        });
    }
}