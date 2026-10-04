<?php

namespace App\Services;

use App\Models\FaceProfile;
use App\Models\User;
use App\Repositories\AbsensiRepository;
use App\Services\FaceRecognitionService;
use App\Services\FaceProfileService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AbsensiService
{
    public function __construct(
        protected AbsensiRepository $absensiRepository,
        protected FaceRecognitionService $faceRecognition,
        protected FaceProfileService $faceProfileService
    ) {}

    /**
     * Presensi masuk via Face Recognition + Liveness (kedipan mata).
     *
     * Flow:
     *  - validasi siswa & akun aktif
     *  - cek belum absen hari ini
     *  - verifikasi liveness (wajib berkedip) via Python
     *  - jika belum punya face profile (atau flag enroll): daftarkan wajah dulu
     *  - jika sudah: cocokkan foto dengan embedding kandidat (pastikan == user login)
     *  - tentukan status hadir/terlambat dari jam server
     */
    public function storeAbsensi(User $user, array $data)
    {
        $siswa = $user->siswa;

        if (!$siswa) {
            throw ValidationException::withMessages([
                'siswa' => ['Akun Anda belum terhubung dengan data siswa.'],
            ]);
        }

        if (($user->status ?? 'Aktif') !== 'Aktif') {
            throw ValidationException::withMessages([
                'user' => ['Akun Anda nonaktif. Tidak dapat melakukan presensi.'],
            ]);
        }

        $tanggal = now()->toDateString();

        if ($this->absensiRepository->findBySiswaAndDate($siswa->id, $tanggal)) {
            throw ValidationException::withMessages([
                'absen' => ['Anda sudah melakukan presensi hari ini.'],
            ]);
        }

        // ---------------------------------------------------------------------
        // 1. Liveness (kedipan mata) — wajib, anti-spoofing
        // ---------------------------------------------------------------------
        try {
            $liveness = $this->faceRecognition->liveness($data['frames'] ?? []);
        } catch (\RuntimeException $e) {
            throw ValidationException::withMessages([
                'wajah' => ['Layanan pengenalan wajah tidak merespons. Pastikan server wajah (Python) menyala dan coba lagi.'],
            ]);
        }

        if (empty($liveness['liveness']) || !$liveness['liveness']) {
            throw ValidationException::withMessages([
                'wajah' => ['Verifikasi hidup (kedipan mata) gagal. Pastikan wajah asli dan berkedip saat presensi.'],
            ]);
        }

        // ---------------------------------------------------------------------
        // 2. Enroll (daftar wajah) jika belum punya profile aktif
        // ---------------------------------------------------------------------
        $sudahTerdaftar = FaceProfile::where('siswa_id', $siswa->id)
            ->where('status', 'active')
            ->exists();

        $enroll = !empty($data['enroll']) || !$sudahTerdaftar;

        if ($enroll) {
            $frames = !empty($data['frames']) ? $data['frames'] : [$data['foto']];
            $this->faceProfileService->register($siswa->id, $frames, true);

            // Simpan foto referensi ke akun user (untuk banner "wajah terdaftar")
            $wajahPath = $this->simpanFotoWajah($user->id, $data['foto']);
            $user->update(['foto' => $wajahPath]);

            $matchedId  = $siswa->id;
            $confidence = null;
        } else {
            // -----------------------------------------------------------------
            // 3. Verifikasi wajah vs kandidat embedding
            // -----------------------------------------------------------------
            $candidates = FaceProfile::where('status', 'active')
                ->get(['siswa_id', 'embedding'])
                ->map(function ($fp) {
                    return [
                        'siswa_id'  => $fp->siswa_id,
                        'embedding' => $fp->embedding,
                    ];
                })
                ->values()
                ->all();

            try {
                $result = $this->faceRecognition->verify($data['foto'], $candidates);
            } catch (\RuntimeException $e) {
                throw ValidationException::withMessages([
                    'wajah' => ['Layanan pengenalan wajah tidak merespons. Pastikan server wajah (Python) menyala dan coba lagi.'],
                ]);
            }

            $matchedId  = $result['siswa_id'] ?? null;
            $confidence = $result['confidence'] ?? null;

            if (empty($result['matched']) || $matchedId != $siswa->id) {
                throw ValidationException::withMessages([
                    'wajah' => ['Wajah tidak cocok atau tidak dikenali.'],
                ]);
            }
        }

        $fotoPath = $this->simpanFoto($siswa->id, $data['foto']);

        $sekarang = now();
        $batas    = config('absensi.batas_masuk', '07:00');
        $status   = $sekarang->format('H:i:s') <= $batas ? 'hadir' : 'terlambat';

        $absensi = $this->absensiRepository->create([
            'siswa_id'         => $siswa->id,
            'tanggal'          => $tanggal,
            'jam_masuk'        => $sekarang->format('H:i:s'),
            'jam_keluar'       => null,
            'status'           => $status,
            'metode'           => 'face_recognition',
            'confidence_score' => $confidence,
            'liveness_verified' => true,
            'keterangan'       => $data['keterangan'] ?? null,
            'foto'             => $fotoPath,
        ]);

        return $absensi->load(['siswa.user', 'siswa.kelas']);
    }

    /**
     * Presensi manual (Admin/Guru) — tanpa face recognition.
     */
    public function storeManual(array $data)
    {
        $siswaId = $data['siswa_id'];
        $tanggal = $data['tanggal'] ?? now()->toDateString();

        if ($this->absensiRepository->findBySiswaAndDate($siswaId, $tanggal)) {
            throw ValidationException::withMessages([
                'absen' => ['Siswa sudah memiliki presensi pada tanggal tersebut.'],
            ]);
        }

        $sekarang = now();

        $fotoPath = null;
        if (!empty($data['foto'])) {
            $fotoPath = $this->simpanFoto($siswaId, $data['foto']);
        }

        $absensi = $this->absensiRepository->create([
            'siswa_id'         => $siswaId,
            'tanggal'          => $tanggal,
            'jam_masuk'        => $data['jam_masuk'] ?? $sekarang->format('H:i:s'),
            'jam_keluar'       => $data['jam_keluar'] ?? null,
            'status'           => $data['status'],
            'metode'           => 'manual',
            'confidence_score' => null,
            'liveness_verified' => false,
            'keterangan'       => $data['keterangan'] ?? null,
            'foto'             => $fotoPath,
        ]);

        return $absensi->load(['siswa.user', 'siswa.kelas']);
    }

    public function riwayatSiswa(User $user, array $filters = [])
    {
        $siswa = $user->siswa;

        if (!$siswa) {
            return null;
        }

        $perPage = $filters['per_page'] ?? 15;

        return $this->absensiRepository->getRiwayatSiswa($siswa->id, $perPage);
    }

    public function listForAdmin(array $filters = [])
    {
        return $this->absensiRepository->getForAdmin($filters);
    }

    public function findById(int $id)
    {
        return $this->absensiRepository->findById($id);
    }

    public function update(Absensi $absensi, array $data)
    {
        return $this->absensiRepository->update($absensi, $data);
    }

    public function delete(Absensi $absensi): bool
    {
        return $this->absensiRepository->delete($absensi);
    }

    /**
     * Decode base64 image dan simpan ke disk public (bukti absensi).
     */
    protected function simpanFoto(int $siswaId, string $base64): string
    {
        $base64 = substr($base64, strpos($base64, ',') + 1);
        $decoded = base64_decode($base64, true);

        $info = @getimagesizefromstring($decoded);
        $ext  = (!empty($info) && $info[2] === IMAGETYPE_PNG) ? 'png' : 'jpg';

        $filename = 'absensi_' . $siswaId . '_' . now()->timestamp . '.' . $ext;
        $path     = config('absensi.foto.path', 'absensi') . '/' . $filename;

        Storage::disk(config('absensi.foto.disk', 'public'))->put($path, $decoded);

        return $path;
    }

    /**
     * Decode base64 image dan simpan sebagai foto referensi wajah user.
     */
    protected function simpanFotoWajah(int $userId, string $base64): string
    {
        $base64 = substr($base64, strpos($base64, ',') + 1);
        $decoded = base64_decode($base64, true);

        $info = @getimagesizefromstring($decoded);
        $ext  = (!empty($info) && $info[2] === IMAGETYPE_PNG) ? 'png' : 'jpg';

        $filename = 'wajah/' . $userId . '_' . now()->timestamp . '.' . $ext;
        $path     = $filename;

        Storage::disk(config('absensi.foto.disk', 'public'))->put($path, $decoded);

        return $path;
    }
}
