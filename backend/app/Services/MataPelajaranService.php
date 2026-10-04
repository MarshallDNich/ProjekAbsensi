<?php

namespace App\Services;

use App\Models\MataPelajaran;
use App\Repositories\MataPelajaranRepository;

class MataPelajaranService
{
    public function __construct(
        protected MataPelajaranRepository $mataPelajaranRepository
    ) {}

    public function getAll(array $filters = [])
    {
        return $this->mataPelajaranRepository->getAll($filters);
    }

    public function getById(MataPelajaran $mataPelajaran): MataPelajaran
    {
        return $this->mataPelajaranRepository->findById($mataPelajaran);
    }

    public function create(array $data): MataPelajaran
    {
        return $this->mataPelajaranRepository->create($data);
    }

    public function update(MataPelajaran $mataPelajaran, array $data): MataPelajaran
    {
        return $this->mataPelajaranRepository->update($mataPelajaran, $data);
    }

    public function delete(MataPelajaran $mataPelajaran): bool
    {
        return $this->mataPelajaranRepository->delete($mataPelajaran);
    }
}