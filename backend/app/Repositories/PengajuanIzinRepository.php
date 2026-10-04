<?php

namespace App\Repositories;

use App\Models\PengajuanIzin;
use Illuminate\Support\Collection;

class PengajuanIzinRepository
{
    public function create(array $data): PengajuanIzin
    {
        return PengajuanIzin::create($data);
    }

    public function findById(int $id): ?PengajuanIzin
    {
        return PengajuanIzin::with(['siswa.user', 'siswa.kelas', 'verifier'])
            ->find($id);
    }

    /**
     * Daftar pengajuan milik satu siswa (terbaru di atas).
     */
    public function getBySiswa(int $siswaId): Collection
    {
        return PengajuanIzin::with(['siswa.user', 'siswa.kelas'])
            ->where('siswa_id', $siswaId)
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Daftar pengajuan yang perlu diverifikasi (status = pending).
     *
     * Jika $guruKelasIds diberikan (verifikator adalah Guru), hanya
     * tampilkan pengajuan siswa yang berada di kelas tersebut.
     */
    public function getForVerification(?array $guruKelasIds = null): Collection
    {
        $query = PengajuanIzin::with(['siswa.user', 'siswa.kelas'])
            ->where('status', PengajuanIzin::STATUS_PENDING)
            ->orderByDesc('created_at');

        if (!is_null($guruKelasIds)) {
            $query->whereHas('siswa', function ($q) use ($guruKelasIds) {
                $q->whereIn('kelas_id', $guruKelasIds);
            });
        }

        return $query->get();
    }

    /**
     * Cek apakah siswa sudah punya pengajuan aktif yang periode tanggalnya
     * overlap dengan periode yang diajukan.
     */
    public function hasOverlapping(
        int $siswaId,
        string $mulai,
        string $selesai,
        array $statuses,
        ?int $excludeId = null
    ): bool {
        $query = PengajuanIzin::where('siswa_id', $siswaId)
            ->whereIn('status', $statuses)
            ->where('tanggal_mulai', '<=', $selesai)
            ->where('tanggal_selesai', '>=', $mulai);

        if (!is_null($excludeId)) {
            $query->where('id', '<>', $excludeId);
        }

        return $query->exists();
    }

    public function update(PengajuanIzin $pengajuan, array $data): PengajuanIzin
    {
        $pengajuan->update($data);

        return $pengajuan->fresh(['siswa.user', 'siswa.kelas', 'verifier']);
    }
}
