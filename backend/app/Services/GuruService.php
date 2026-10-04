<?php

namespace App\Services;

use App\Models\Guru;
use App\Repositories\GuruRepository;

class GuruService
{
    public function __construct(
        protected GuruRepository $guruRepository
    ) {}

    public function getAll(array $filters = [])
    {
        return $this->guruRepository->getAll($filters);
    }

    public function getById(Guru $guru): Guru
    {
        return $this->guruRepository->findById($guru);
    }

    public function create(array $data): Guru
    {
        return $this->guruRepository->create($data);
    }

    public function update(Guru $guru, array $data): Guru
    {
        return $this->guruRepository->update($guru, $data);
    }

    public function getByUserIdOrGuruId($id)
    {
        // Coba cari berdasarkan guru_id dulu
        $guru = Guru::with(['user', 'kelas'])->find($id);
        
        if ($guru) {
            return $guru;
        }
        
        // Kalau tidak ada, cari berdasarkan user_id
        return $this->guruRepository->findByUserId($id);
    }

    public function delete(Guru $guru): bool
    {
        return $this->guruRepository->delete($guru);
    }
}
