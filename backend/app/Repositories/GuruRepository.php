<?php

namespace App\Repositories;

use App\Models\Guru;
use App\Models\User;

class GuruRepository
{
    public function getAll(array $filters = [])
    {
        // Ambil semua User dengan role Guru, lalu load relasi guru (profile)
        $query = User::with(['guru.kelas'])
            ->where('role', 'Guru');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('guru', function($q2) use ($search) {
                      $q2->where('nip', 'like', "%{$search}%");
                  });
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

    public function findById(Guru $guru): Guru
    {
        return $guru->load(['user', 'kelas']);
    }

    public function create(array $data): Guru
    {
        // user_id harus ada
        if (!isset($data['user_id'])) {
            throw new \Exception('user_id is required');
        }

        $guru = Guru::create($data);
        
        // Sync kelas if provided
        if (isset($data['kelas_ids'])) {
            $guru->kelas()->sync($data['kelas_ids']);
        }
        
        return $guru->load(['user', 'kelas']);
    }

    public function update(Guru $guru, array $data): Guru
    {
        $guru->update($data);
        
        // Sync kelas if provided
        if (isset($data['kelas_ids'])) {
            $guru->kelas()->sync($data['kelas_ids']);
        }
        
        return $guru->fresh(['user', 'kelas']);
    }

    public function findByUserId(int $userId): ?Guru
    {
        return Guru::with(['user', 'kelas'])->where('user_id', $userId)->first();
    }

    public function delete(Guru $guru): bool
    {
        return $guru->delete();
    }
}
