<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Client untuk memanggil Python Face Recognition Service (FastAPI).
 *
 * Python hanya menerima gambar + data, lalu mengembalikan hasil
 * face recognition. Laravel yang memegang otoritas database.
 */
class FaceRecognitionService
{
    protected function baseUrl(): string
    {
        return rtrim(config('face.service_url'), '/');
    }

    protected function timeout(): int
    {
        return (int) config('face.timeout', 30);
    }

    /**
     * Minta Python menghasilkan embedding dari satu gambar wajah.
     *
     * @return array<float>|null
     */
    public function getEmbedding(string $base64Image): ?array
    {
        $response = Http::timeout($this->timeout())
            ->post($this->baseUrl() . config('face.endpoints.embedding'), [
                'image' => $base64Image,
            ]);

        if (!$response->successful()) {
            Log::error('Face service (embedding) gagal', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            throw new \RuntimeException(
                'Face service (embedding) error: ' . $response->body()
            );
        }

        $data = $response->json();

        if (empty($data['success']) || empty($data['embedding'])) {
            throw new \RuntimeException(
                $data['message'] ?? 'Gagal membuat embedding wajah.'
            );
        }

        return $data['embedding'];
    }

    /**
     * Minta Python memverifikasi wajah terhadap daftar embedding kandidat.
     *
     * @param  array<int, array{siswa_id:int, embedding:array}>  $candidates
     */
    public function verify(string $base64Image, array $candidates): array
    {
        $response = Http::timeout($this->timeout())
            ->post($this->baseUrl() . config('face.endpoints.verify'), [
                'image'      => $base64Image,
                'faces'      => $candidates,
                'threshold'  => (float) config('face.threshold', 0.5),
            ]);

        if (!$response->successful()) {
            Log::error('Face service (verify) gagal', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            throw new \RuntimeException(
                'Face service (verify) error: ' . $response->body()
            );
        }

        return $response->json();
    }

    /**
     * Minta Python memverifikasi liveness (kedipan mata) dari sekuens frame.
     *
     * @param  array<int, string>  $frames  daftar base64 image
     */
    public function liveness(array $frames, int $minBlinks = 1): array
    {
        $response = Http::timeout($this->timeout())
            ->post($this->baseUrl() . config('face.endpoints.liveness'), [
                'frames'     => $frames,
                'min_blinks' => $minBlinks,
            ]);

        if (!$response->successful()) {
            Log::error('Face service (liveness) gagal', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            throw new \RuntimeException(
                'Face service (liveness) error: ' . $response->body()
            );
        }

        return $response->json();
    }
}
