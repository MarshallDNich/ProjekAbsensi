<?php

namespace App\Services;

use App\Models\PengajuanIzin;
use App\Models\User;
use App\Repositories\AbsensiRepository;
use App\Repositories\PengajuanIzinRepository;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PengajuanIzinService
{
    public function __construct(
        protected PengajuanIzinRepository $repository,
        protected AbsensiRepository $absensiRepository,
    ) {}

    /**
     * Siswa mengajukan izin.
     *
     * Identitas siswa diambil dari user terautentikasi (Sanctum), bukan
     * dari input frontend. Status otomatis = pending. Siswa tidak dapat
     * menentukan status, verified_by, verified_at, atau catatan verifikator.
     */
    public function create(User $user, array $data): PengajuanIzin
    {
        $siswa = $user->siswa;

        if (!$siswa) {
            throw ValidationException::withMessages([
                'siswa' => ['Akun Anda belum terhubung dengan data siswa.'],
            ]);
        }

        // Cegah periode yang bentrok dengan pengajuan aktif (pending/approved).
        $overlap = $this->repository->hasOverlapping(
            $siswa->id,
            $data['tanggal_mulai'],
            $data['tanggal_selesai'],
            [PengajuanIzin::STATUS_PENDING, PengajuanIzin::STATUS_APPROVED]
        );

        if ($overlap) {
            throw ValidationException::withMessages([
                'tanggal' => ['Periode tanggal yang diajukan bentrok dengan pengajuan izin yang masih aktif.'],
            ]);
        }

        // Simpan file bukti ke storage disk public.
        $buktiPath = null;
        if (!empty($data['bukti'])) {
            $folder = 'pengajuan-izin/' . Carbon::now()->format('Y/m');
            $buktiPath = $data['bukti']->store($folder, 'public');
        }

        return $this->repository->create([
            'siswa_id'        => $siswa->id,
            'tanggal_mulai'   => $data['tanggal_mulai'],
            'tanggal_selesai' => $data['tanggal_selesai'],
            'jenis'           => $data['jenis'],
            'alasan'          => $data['alasan'],
            'bukti'           => $buktiPath,
            'status'          => PengajuanIzin::STATUS_PENDING,
        ]);
    }

    public function findById(int $id): ?PengajuanIzin
    {
        return $this->repository->findById($id);
    }

    /**
     * Siswa: hanya melihat pengajuan miliknya sendiri.
     */
    public function getStudentRequests(User $user)
    {
        if (!$user->siswa) {
            return collect();
        }

        return $this->repository->getBySiswa($user->siswa->id);
    }

    /**
     * Admin/Guru: melihat pengajuan yang perlu diverifikasi.
     * Guru hanya melihat pengajuan siswa di kelas yang dia ampu.
     */
    public function getRequestsForVerification(User $user)
    {
        if ($user->isAdmin()) {
            return $this->repository->getForVerification();
        }

        if ($user->isGuru()) {
            $kelasIds = optional($user->guru)->kelas->pluck('id')->all() ?? [];
            return $this->repository->getForVerification($kelasIds);
        }

        return collect();
    }

    /**
     * Cek apakah user berhak memverifikasi pengajuan tertentu.
     *
     * - Admin : selalu boleh.
     * - Guru   : hanya jika siswa pengaju berada di salah satu kelas yang
     *            dia ampu (relasi guru_kelas yang sudah ada).
     * - Lainnya (termasuk Siswa) : tidak boleh.
     */
    public function canVerify(User $user, PengajuanIzin $pengajuan): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isGuru()) {
            $siswa = $pengajuan->siswa;

            if (!$siswa) {
                return false;
            }

            $guruKelasIds = optional($user->guru)->kelas->pluck('id')->all() ?? [];

            return in_array($siswa->kelas_id, $guruKelasIds, true);
        }

        return false;
    }

    /**
     * Setujui pengajuan -> perbarui/absen siswa sesuai periode & jenis.
     * Berjalan dalam transaksi + row lock agar aman dari approve ganda/
     * konkuren.
     */
    public function approve(int $id, User $verifier, ?string $catatan = null): PengajuanIzin
    {
        return DB::transaction(function () use ($id, $verifier, $catatan) {
            $pengajuan = PengajuanIzin::lockForUpdate()
                ->with(['siswa', 'siswa.kelas'])
                ->find($id);

            if (!$pengajuan) {
                throw ValidationException::withMessages([
                    'id' => ['Data pengajuan izin tidak ditemukan.'],
                ]);
            }

            if ($pengajuan->status !== PengajuanIzin::STATUS_PENDING) {
                throw ValidationException::withMessages([
                    'status' => ['Pengajuan ini sudah diproses dan tidak dapat disetujui lagi.'],
                ]);
            }

            if (!$this->canVerify($verifier, $pengajuan)) {
                throw new \Illuminate\Auth\Access\AuthorizationException(
                    'Anda tidak memiliki izin untuk memverifikasi pengajuan ini.'
                );
            }

            $statusAbsensi = $this->mapJenisToStatus($pengajuan->jenis);

            // Buat/perbarui absensi untuk tiap tanggal dalam periode.
            $start = Carbon::parse($pengajuan->tanggal_mulai);
            $end   = Carbon::parse($pengajuan->tanggal_selesai);

            for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
                $tanggal = $date->toDateString();

                $payload = [
                    'status'      => $statusAbsensi,
                    'metode'     => 'manual',
                    'keterangan' => $pengajuan->alasan,
                ];

                $existing = $this->absensiRepository->findBySiswaAndDate(
                    $pengajuan->siswa_id,
                    $tanggal
                );

                if ($existing) {
                    $this->absensiRepository->update($existing, $payload);
                } else {
                    $this->absensiRepository->create(array_merge($payload, [
                        'siswa_id'          => $pengajuan->siswa_id,
                        'tanggal'           => $tanggal,
                        'jam_masuk'         => null,
                        'jam_keluar'        => null,
                        'confidence_score'  => null,
                        'liveness_verified' => false,
                        'foto'              => null,
                    ]));
                }
            }

            return $this->repository->update($pengajuan, [
                'status'              => PengajuanIzin::STATUS_APPROVED,
                'verified_by'         => $verifier->id,
                'verified_at'         => Carbon::now(),
                'catatan_verifikator' => $catatan,
            ]);
        });
    }

    /**
     * Tolak pengajuan -> tidak mengubah data absensi sama sekali.
     */
    public function reject(int $id, User $verifier, ?string $catatan = null): PengajuanIzin
    {
        return DB::transaction(function () use ($id, $verifier, $catatan) {
            $pengajuan = PengajuanIzin::lockForUpdate()
                ->with(['siswa', 'siswa.kelas'])
                ->find($id);

            if (!$pengajuan) {
                throw ValidationException::withMessages([
                    'id' => ['Data pengajuan izin tidak ditemukan.'],
                ]);
            }

            if ($pengajuan->status !== PengajuanIzin::STATUS_PENDING) {
                throw ValidationException::withMessages([
                    'status' => ['Pengajuan ini sudah diproses dan tidak dapat ditolak lagi.'],
                ]);
            }

            if (!$this->canVerify($verifier, $pengajuan)) {
                throw new \Illuminate\Auth\Access\AuthorizationException(
                    'Anda tidak memiliki izin untuk memverifikasi pengajuan ini.'
                );
            }

            return $this->repository->update($pengajuan, [
                'status'              => PengajuanIzin::STATUS_REJECTED,
                'verified_by'         => $verifier->id,
                'verified_at'         => Carbon::now(),
                'catatan_verifikator' => $catatan,
            ]);
        });
    }

    /**
     * Petakan jenis pengajuan ke status absensi yang sudah ada.
     * Tabel absensis tidak memiliki status 'dispensasi', sehingga
     * dispensasi dipetakan ke 'izin' (izin sekolah).
     */
    protected function mapJenisToStatus(string $jenis): string
    {
        return match ($jenis) {
            'sakit'      => 'sakit',
            'izin'       => 'izin',
            'dispensasi' => 'izin',
            default      => 'izin',
        };
    }
}
