<?php

namespace App\Services;

use App\Models\FaceProfile;
use Illuminate\Validation\ValidationException;

/**
 * Mengelola pendaftaran (enrollment) Face Profile siswa.
 *
 * Hanya Admin yang boleh memanggil layanan ini.
 */
class FaceProfileService
{
    public function __construct(
        protected FaceRecognitionService $faceRecognition
    ) {}

    /**
     * Daftarkan / perbarui face profile siswa dari beberapa sampel wajah.
     *
     * @param  array<int, string>  $images  daftar base64 image
     * @param  bool  $livenessAlreadyVerified  true bila liveness sudah diverifikasi
     *                                         pemanggil (mis. AbsensiService) sehingga
     *                                         tidak perlu diproses ulang di sini.
     */
    public function register(int $siswaId, array $images, bool $livenessAlreadyVerified = false): FaceProfile
    {
        if (empty($images)) {
            throw ValidationException::withMessages([
                'images' => ['Minimal satu sampel wajah diperlukan.'],
            ]);
        }

        // Verifikasi liveness (kedipan mata) agar foto print/replay tidak lolos.
        if (!$livenessAlreadyVerified) {
            try {
                $liveness = $this->faceRecognition->liveness($images);
            } catch (\RuntimeException $e) {
                throw ValidationException::withMessages([
                    'images' => ['Layanan pengenalan wajah tidak merespons. Pastikan server wajah (Python) menyala dan coba lagi.'],
                ]);
            }

            if (empty($liveness['liveness']) || !$liveness['liveness']) {
                throw ValidationException::withMessages([
                    'images' => ['Verifikasi hidup (kedipan mata) gagal. Pastikan wajah asli dan berkedip.'],
                ]);
            }
        }

        // Ambil sampel hingga 3 frame (pertama, tengah, terakhir) untuk embedding
        // agar cepat di CPU (tidak memproses ke-20 frame sekaligus) namun tetap
        // punya sedikit variasi untuk dirata-rata.
        $samples = $this->sampleFrames($images, 3);

        $embeddings = [];

        foreach ($samples as $image) {
            try {
                $embedding = $this->faceRecognition->getEmbedding($image);
            } catch (\RuntimeException $e) {
                continue; // lewati frame yang gagal (blur / tidak ada wajah)
            }
            if (!empty($embedding)) {
                $embeddings[] = $embedding;
            }
        }

        if (empty($embeddings)) {
            throw ValidationException::withMessages([
                'images' => ['Tidak ada wajah terdeteksi pada sampel yang diberikan.'],
            ]);
        }

        $average = $this->averageEmbeddings($embeddings);

        return FaceProfile::updateOrCreate(
            ['siswa_id' => $siswaId],
            [
                'embedding'       => $average,
                'status'          => 'active',
                'registered_at'   => now(),
            ]
        );
    }

    /**
     * Ambil hingga $max frame terpisah (pertama, tengah, terakhir) dari daftar frame.
     *
     * @param  array<int, string>  $images
     * @return array<int, string>
     */
    protected function sampleFrames(array $images, int $max): array
    {
        $count = count($images);
        if ($count <= $max) {
            return $images;
        }

        $step = intdiv($count - 1, $max - 1);
        $indices = [];
        for ($i = 0; $i < $max; $i++) {
            $indices[] = min($count - 1, $i * $step);
        }
        $indices = array_values(array_unique($indices));

        return array_map(fn ($i) => $images[$i], $indices);
    }

    /**
     * Hapus face profile siswa (mis. untuk reset/daftar ulang).
     */
    public function remove(int $siswaId): void
    {
        FaceProfile::where('siswa_id', $siswaId)->delete();
    }

    /**
     * Rata-rata element-wise dari beberapa embedding.
     *
     * @param  array<int, array<float>>  $embeddings
     * @return array<float>
     */
    protected function averageEmbeddings(array $embeddings): array
    {
        $count = count($embeddings);
        $length = count($embeddings[0]);
        $output = array_fill(0, $length, 0.0);

        foreach ($embeddings as $embedding) {
            for ($i = 0; $i < $length; $i++) {
                $output[$i] += $embedding[$i];
            }
        }

        for ($i = 0; $i < $length; $i++) {
            $output[$i] /= $count;
        }

        return $output;
    }
}
