<?php

namespace App\Services;

use App\Models\JamPelajaran;
use App\Repositories\JamPelajaranRepository;
use Illuminate\Validation\ValidationException;

class JamPelajaranService
{
    public function __construct(
        protected JamPelajaranRepository $repository
    ) {}

    public function getAll()
    {
        return $this->repository->getAll();
    }

    public function getById(int $id): ?JamPelajaran
    {
        return $this->repository->findById($id);
    }

    public function create(array $data): JamPelajaran
    {
        if ($this->repository->hasOverlap(null, $data['jam_mulai'], $data['jam_selesai'])) {
            throw ValidationException::withMessages([
                'jam' => ['Slot jam tumpang tindih dengan slot yang sudah ada.'],
            ]);
        }

        return $this->repository->create($data);
    }

    public function update(JamPelajaran $jam, array $data): JamPelajaran
    {
        $mulai    = $data['jam_mulai'] ?? $jam->jam_mulai;
        $selesai  = $data['jam_selesai'] ?? $jam->jam_selesai;

        if ($this->repository->hasOverlap($jam->id, $mulai, $selesai)) {
            throw ValidationException::withMessages([
                'jam' => ['Slot jam tumpang tindih dengan slot yang sudah ada.'],
            ]);
        }

        return $this->repository->update($jam, $data);
    }

    public function delete(JamPelajaran $jam): bool
    {
        if ($jam->jadwalPelajaran()->count() > 0) {
            throw ValidationException::withMessages([
                'jadwal' => ['Slot jam tidak dapat dihapus karena masih digunakan di jadwal pelajaran.'],
            ]);
        }

        return $this->repository->delete($jam);
    }

    public function reorder(array $orderedIds): void
    {
        foreach ($orderedIds as $index => $id) {
            JamPelajaran::where('id', $id)->update(['urutan' => $index + 1]);
        }
    }
}
