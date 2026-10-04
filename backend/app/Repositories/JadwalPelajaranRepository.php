<?php

namespace App\Repositories;

use App\Models\JadwalPelajaran;
use Illuminate\Support\Collection;

class JadwalPelajaranRepository
{
    public function create(array $data): JadwalPelajaran
    {
        return JadwalPelajaran::create($data);
    }

    public function findById(int $id): ?JadwalPelajaran
    {
        return JadwalPelajaran::with(['kelas', 'guru.user', 'mataPelajaran', 'jamPelajaran'])
            ->find($id);
    }

    public function update(JadwalPelajaran $jadwal, array $data): JadwalPelajaran
    {
        $jadwal->update($data);
        return $jadwal->fresh(['kelas', 'guru.user', 'mataPelajaran', 'jamPelajaran']);
    }

    public function delete(JadwalPelajaran $jadwal): bool
    {
        return $jadwal->delete();
    }

    public function getForGuru(int $guruId): Collection
    {
        return JadwalPelajaran::with(['kelas', 'guru.user', 'mataPelajaran', 'jamPelajaran'])
            ->join('jam_pelajaran', 'jadwal_pelajaran.jam_pelajaran_id', '=', 'jam_pelajaran.id')
            ->where('jadwal_pelajaran.guru_id', $guruId)
            ->orderBy('jadwal_pelajaran.hari')
            ->orderBy('jam_pelajaran.urutan')
            ->get();
    }

    public function getForKelas(int $kelasId): Collection
    {
        return JadwalPelajaran::with(['kelas', 'guru.user', 'mataPelajaran', 'jamPelajaran'])
            ->join('jam_pelajaran', 'jadwal_pelajaran.jam_pelajaran_id', '=', 'jam_pelajaran.id')
            ->where('jadwal_pelajaran.kelas_id', $kelasId)
            ->orderBy('jadwal_pelajaran.hari')
            ->orderBy('jam_pelajaran.urutan')
            ->get();
    }

    public function getFiltered(array $filters = [])
    {
        $query = JadwalPelajaran::with(['kelas', 'guru.user', 'mataPelajaran', 'jamPelajaran'])
            ->join('jam_pelajaran', 'jadwal_pelajaran.jam_pelajaran_id', '=', 'jam_pelajaran.id');

        if (!empty($filters['hari'])) {
            $query->where('jadwal_pelajaran.hari', $filters['hari']);
        }

        if (!empty($filters['kelas_id'])) {
            $query->where('jadwal_pelajaran.kelas_id', $filters['kelas_id']);
        }

        if (!empty($filters['guru_id'])) {
            $query->where('jadwal_pelajaran.guru_id', $filters['guru_id']);
        }

        return $query->orderBy('jadwal_pelajaran.hari')
            ->orderBy('jam_pelajaran.urutan')
            ->get();
    }

    public function getAll(): Collection
    {
        return JadwalPelajaran::with(['kelas', 'guru.user', 'mataPelajaran', 'jamPelajaran'])
            ->join('jam_pelajaran', 'jadwal_pelajaran.jam_pelajaran_id', '=', 'jam_pelajaran.id')
            ->orderBy('jadwal_pelajaran.hari')
            ->orderBy('jam_pelajaran.urutan')
            ->get();
    }

    public function getTimetable(): array
    {
        $jadwals = $this->getAll()->keyBy(fn ($j) => "{$j->hari}|{$j->kelas_id}|{$j->jam_pelajaran_id}");

        $result = [];
        foreach (['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as $hari) {
            $result[$hari] = [];
        }

        foreach ($jadwals as $key => $j) {
            $result[$j->hari][$j->kelas_id][$j->jam_pelajaran_id] = [
                'guru' => [
                    'id'   => $j->guru->id,
                    'nama' => $j->guru->nama,
                    'nip'  => $j->guru->nip,
                ],
                'mata_pelajaran' => [
                    'id'   => $j->mataPelajaran->id,
                    'kode' => $j->mataPelajaran->kode,
                    'nama' => $j->mataPelajaran->nama,
                ],
            ];
        }

        return $result;
    }
}
