<?php

namespace App\Repositories;

use App\Models\Siswa;
use App\Models\User;

class SiswaRepository
{
    public function getAll(array $filters = [])
    {
        // Ambil semua User dengan role Siswa, lalu load relasi siswa (penempatan kelas)
        $query = User::with(['siswa.kelas'])
            ->where('role', 'Siswa');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters['per_page'] ?? 10);
    }

    public function findById(Siswa $siswa): Siswa
    {
        return $siswa->load(['user', 'kelas']);
    }

    public function create(array $data): Siswa
    {
        $siswa = Siswa::create($data);
        return $siswa->load(['user', 'kelas']);
    }

    public function update(Siswa $siswa, array $data): Siswa
    {
        $siswa->update($data);
        return $siswa->fresh(['user', 'kelas']);
    }

    public function delete(Siswa $siswa): bool
    {
        return $siswa->delete();
    }

    public function findByUserId(int $userId): ?Siswa
    {
        return Siswa::with(['user', 'kelas'])->where('user_id', $userId)->first();
    }
}