<?php

namespace App\Repositories;

use App\Models\Absensi;

class AbsensiRepository
{
    public function create(array $data): Absensi
    {
        return Absensi::create($data);
    }

    /**
     * Cek apakah siswa sudah absen pada tanggal tertentu.
     */
    public function findBySiswaAndDate(int $siswaId, string $date): ?Absensi
    {
        return Absensi::where('siswa_id', $siswaId)
            ->whereDate('tanggal', $date)
            ->first();
    }

    public function findById(int $id): ?Absensi
    {
        return Absensi::with(['siswa.user', 'siswa.kelas'])
            ->find($id);
    }

    public function update(Absensi $absensi, array $data): Absensi
    {
        $absensi->update($data);

        return $absensi->fresh(['siswa.user', 'siswa.kelas']);
    }

    public function delete(Absensi $absensi): bool
    {
        return $absensi->delete();
    }

    /**
     * Riwayat absensi milik satu siswa (terbaru di atas).
     */
    public function getRiwayatSiswa(int $siswaId, int $perPage = 15)
    {
        return Absensi::with(['siswa.user', 'siswa.kelas'])
            ->where('siswa_id', $siswaId)
            ->orderByDesc('tanggal')
            ->orderByDesc('jam_masuk')
            ->paginate($perPage);
    }

    /**
     * Daftar absensi untuk admin/guru dengan filter.
     */
    public function getForAdmin(array $filters = [])
    {
        $query = Absensi::with(['siswa.user', 'siswa.kelas']);

        if (!empty($filters['tanggal'])) {
            $query->whereDate('tanggal', $filters['tanggal']);
        } else {
            $query->whereDate('tanggal', now()->toDateString());
        }

        if (!empty($filters['kelas_id'])) {
            $query->whereHas('siswa', function ($q) use ($filters) {
                $q->where('kelas_id', $filters['kelas_id']);
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('siswa.user', function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $sortBy = $filters['sort_by'] ?? 'jam_masuk';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters['per_page'] ?? 15);
    }
}
