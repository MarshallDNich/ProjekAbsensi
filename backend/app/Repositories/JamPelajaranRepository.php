<?php

namespace App\Repositories;

use App\Models\JamPelajaran;

class JamPelajaranRepository
{
    public function create(array $data): JamPelajaran
    {
        return JamPelajaran::create($data);
    }

    public function findById(int $id): ?JamPelajaran
    {
        return JamPelajaran::find($id);
    }

    public function getAll()
    {
        return JamPelajaran::orderBy('urutan')->get();
    }

    public function update(JamPelajaran $jam, array $data): JamPelajaran
    {
        $jam->update($data);
        return $jam->fresh();
    }

    public function delete(JamPelajaran $jam): bool
    {
        return $jam->delete();
    }

    public function hasOverlap(?int $excludeId, string $jamMulai, string $jamSelesai): bool
    {
        $query = JamPelajaran::where('jam_mulai', '<', $jamSelesai)
            ->where('jam_selesai', '>', $jamMulai);

        if (!is_null($excludeId)) {
            $query->where('id', '<>', $excludeId);
        }

        return $query->exists();
    }
}
