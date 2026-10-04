<?php

namespace App\Repositories;

use App\Models\Kelas;

class KelasRepository
{
    public function getAll(array $filters = [])
    {
        $query = Kelas::with(['waliKelas.user'])
            ->withCount('siswa');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nama_kelas', 'like', "%{$search}%")
                  ->orWhere('jurusan', 'like', "%{$search}%")
                  ->orWhere('tingkat', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['tingkat'])) {
            $query->where('tingkat', $filters['tingkat']);
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters['per_page'] ?? 10);
    }

    public function findById(Kelas $kelas): Kelas
    {
        return $kelas->load(['waliKelas.user', 'siswa.user'])
            ->loadCount('siswa');
    }

    public function create(array $data): Kelas
    {
        $data = $this->resolveWaliKelas($data);
        return Kelas::create($data)->load(['waliKelas.user'])->loadCount('siswa');
    }

    public function update(Kelas $kelas, array $data): Kelas
    {
        $data = $this->resolveWaliKelas($data);
        $kelas->update($data);
        return $kelas->fresh(['waliKelas.user'])->loadCount('siswa');
    }

    public function delete(Kelas $kelas): bool
    {
        return $kelas->delete();
    }

    /**
     * Field "wali_kelas" (id guru) dari frontend dipetakan
     * ke kolom "guru_id" di tabel kelas.
     */
    private function resolveWaliKelas(array $data): array
    {
        if (array_key_exists('wali_kelas', $data)) {
            $data['guru_id'] = $data['wali_kelas'] ?: null;
            unset($data['wali_kelas']);
        }
        return $data;
    }
}