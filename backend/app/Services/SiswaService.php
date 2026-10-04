<?php

namespace App\Services;

use App\Models\Siswa;
use App\Repositories\SiswaRepository;

class SiswaService
{
    public function __construct(
        protected SiswaRepository $siswaRepository
    ) {}

    public function getAll(array $filters = [])
    {
        return $this->siswaRepository->getAll($filters);
    }

    public function getById(Siswa $siswa): Siswa
    {
        return $this->siswaRepository->findById($siswa);
    }

    public function create(array $data): Siswa
    {
        return $this->siswaRepository->create($data);
    }

    public function update(Siswa $siswa, array $data): Siswa
    {
        return $this->siswaRepository->update($siswa, $data);
    }

    public function getByIdOrUserId($id)
    {
        $siswa = Siswa::with(['user', 'kelas'])->find($id);
        
        if ($siswa) {
            return $siswa;
        }
        
        return $this->siswaRepository->findByUserId($id);
    }

    public function delete(Siswa $siswa): bool
    {
        return $this->siswaRepository->delete($siswa);
    }
}
