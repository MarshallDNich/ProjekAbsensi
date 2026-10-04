<?php

namespace App\Services;

use App\Models\Kelas;
use App\Repositories\KelasRepository;

class KelasService
{
    public function __construct(
        protected KelasRepository $kelasRepository
    ) {}

    public function getAll(array $filters = [])
    {
        return $this->kelasRepository->getAll($filters);
    }

    public function getById(Kelas $kelas): Kelas
    {
        return $this->kelasRepository->findById($kelas);
    }

    public function create(array $data): Kelas
    {
        return $this->kelasRepository->create($data);
    }

    public function update(Kelas $kelas, array $data): Kelas
    {
        return $this->kelasRepository->update($kelas, $data);
    }

    public function delete(Kelas $kelas): bool
    {
        return $this->kelasRepository->delete($kelas);
    }
}
