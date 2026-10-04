<?php

namespace App\Services;

use App\Models\JadwalPelajaran;
use App\Models\MataPelajaran;
use App\Repositories\JadwalPelajaranRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class JadwalPelajaranService
{
    public function __construct(
        protected JadwalPelajaranRepository $repository
    ) {}

    public function getAll(array $filters = [])
    {
        return $this->repository->getFiltered($filters);
    }

    public function getForGuru(int $guruId)
    {
        return $this->repository->getForGuru($guruId);
    }

    public function getForKelas(int $kelasId)
    {
        return $this->repository->getForKelas($kelasId);
    }

    public function getById(int $id): ?JadwalPelajaran
    {
        return $this->repository->findById($id);
    }

    public function getTimetable(): array
    {
        return $this->repository->getTimetable();
    }

    public function create(array $data): JadwalPelajaran
    {
        $this->validateConflict(null, $data);

        return $this->repository->create($data);
    }

    public function update(JadwalPelajaran $jadwal, array $data): JadwalPelajaran
    {
        $merged = [
            'hari'               => $data['hari'] ?? $jadwal->hari,
            'jam_pelajaran_id'   => $data['jam_pelajaran_id'] ?? $jadwal->jam_pelajaran_id,
            'kelas_id'           => $data['kelas_id'] ?? $jadwal->kelas_id,
            'guru_id'            => $data['guru_id'] ?? $jadwal->guru_id,
            'mata_pelajaran_id'  => $data['mata_pelajaran_id'] ?? $jadwal->mata_pelajaran_id,
        ];

        $this->validateConflict($jadwal->id, $merged);

        return $this->repository->update($jadwal, $data);
    }

    public function delete(JadwalPelajaran $jadwal): bool
    {
        return $this->repository->delete($jadwal);
    }

    /**
     * Validasi konflik jadwal:
     * 1. Slot istirahat tidak boleh menerima jadwal
     * 2. Kelas bentrok (sama kelas + sama slot + sama hari)
     * 3. Guru bentrok (sama guru + sama slot + sama hari)
     * 4. Guru tidak mengampu mata pelajaran tersebut
     */
    protected function validateConflict(?int $excludeId, array $data): void
    {
        // 1. Cek tipe slot
        if ($data['jam_pelajaran_id']) {
            $jam = \App\Models\JamPelajaran::find($data['jam_pelajaran_id']);
            if ($jam && $jam->tipe === 'break') {
                throw ValidationException::withMessages([
                    'jam_pelajaran_id' => ['Tidak dapat membuat jadwal pada jam istirahat.'],
                ]);
            }
        }

        // 2 & 3. Cek overlap menggunakan unique constraint (catch QueryException)
        // DB-level unique constraint pada ['hari','jam_pelajaran_id','kelas_id'] dan
        // ['hari','jam_pelajaran_id','guru_id'] akan menangani ini.
        // Kita lakukan validasi di service untuk pesan error yang lebih jelas.

        // Cek kelas bentrok
        $kelasConflict = JadwalPelajaran::where('hari', $data['hari'])
            ->where('jam_pelajaran_id', $data['jam_pelajaran_id'])
            ->where('kelas_id', $data['kelas_id']);
        if ($excludeId) {
            $kelasConflict->where('id', '<>', $excludeId);
        }
        if ($kelasConflict->exists()) {
            throw ValidationException::withMessages([
                'kelas_id' => ['Kelas sudah memiliki jadwal pada hari dan jam tersebut.'],
            ]);
        }

        // Cek guru bentrok
        $guruConflict = JadwalPelajaran::where('hari', $data['hari'])
            ->where('jam_pelajaran_id', $data['jam_pelajaran_id'])
            ->where('guru_id', $data['guru_id']);
        if ($excludeId) {
            $guruConflict->where('id', '<>', $excludeId);
        }
        if ($guruConflict->exists()) {
            throw ValidationException::withMessages([
                'guru_id' => ['Guru sudah mengajar pada hari dan jam tersebut.'],
            ]);
        }

        // 4. Cek guru mengampu mata pelajaran
        if (!empty($data['guru_id']) && !empty($data['mata_pelajaran_id'])) {
            $guru = \App\Models\Guru::find($data['guru_id']);
            $mapel = MataPelajaran::find($data['mata_pelajaran_id']);

            if ($guru && $mapel) {
                $guruMapel = $guru->mata_pelajaran ?? [];
                $matchFound = false;
                foreach ($guruMapel as $nama) {
                    if (mb_strtolower(trim($nama)) === mb_strtolower($mapel->nama)) {
                        $matchFound = true;
                        break;
                    }
                }
                if (!$matchFound) {
                    throw ValidationException::withMessages([
                        'mata_pelajaran_id' => ['Guru tidak mengampu mata pelajaran tersebut.'],
                    ]);
                }
            }
        }
    }
}
