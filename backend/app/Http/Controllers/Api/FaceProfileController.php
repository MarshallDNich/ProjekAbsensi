<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Face\RegisterFaceRequest;
use App\Http\Resources\FaceProfileResource;
use App\Models\Siswa;
use App\Services\FaceProfileService;
use Illuminate\Http\JsonResponse;

class FaceProfileController extends BaseApiController
{
    public function __construct(
        protected FaceProfileService $faceProfileService
    ) {}

    /**
     * Daftarkan wajah siswa (hanya Admin/Guru).
     * Menerima beberapa sampel foto, lalu menyimpan embedding rata-rata.
     */
    public function register(RegisterFaceRequest $request, Siswa $siswa): JsonResponse
    {
        $profile = $this->faceProfileService->register(
            $siswa->id,
            $request->validated()['images']
        );

        return $this->successResponse(
            new FaceProfileResource($profile),
            'Face profile siswa berhasil didaftarkan.',
            201
        );
    }

    /**
     * Hapus face profile siswa.
     */
    public function destroy(Siswa $siswa): JsonResponse
    {
        $this->faceProfileService->remove($siswa->id);

        return $this->successResponse(
            null,
            'Face profile siswa berhasil dihapus.'
        );
    }
}
