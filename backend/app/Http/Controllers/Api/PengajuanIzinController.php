<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\PengajuanIzin\StorePengajuanIzinRequest;
use App\Http\Requests\PengajuanIzin\VerifikasiPengajuanIzinRequest;
use App\Http\Resources\PengajuanIzinResource;
use App\Services\PengajuanIzinService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PengajuanIzinController extends BaseApiController
{
    public function __construct(
        protected PengajuanIzinService $service
    ) {}

    /**
     * GET /pengajuan-izin
     * Siswa     -> pengajuan milik sendiri.
     * Admin/Guru -> pengajuan yang perlu diverifikasi.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isSiswa()) {
            $data = $this->service->getStudentRequests($user);

            return $this->successResponse(
                PengajuanIzinResource::collection($data),
                'Daftar pengajuan izin Anda berhasil diambil.'
            );
        }

        $data = $this->service->getRequestsForVerification($user);

        return $this->successResponse(
            PengajuanIzinResource::collection($data),
            'Daftar pengajuan izin yang perlu diverifikasi berhasil diambil.'
        );
    }

    /**
     * POST /pengajuan-izin (hanya Siswa)
     */
    public function store(StorePengajuanIzinRequest $request): JsonResponse
    {
        try {
            $pengajuan = $this->service->create($request->user(), $request->validated());
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        }

        return $this->successResponse(
            new PengajuanIzinResource($pengajuan),
            'Pengajuan izin berhasil diajukan. Menunggu verifikasi.',
            201
        );
    }

    /**
     * GET /pengajuan-izin/{id}
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $pengajuan = $this->service->findById((int) $id);

        if (!$pengajuan) {
            return $this->errorResponse('Data pengajuan izin tidak ditemukan.', 404);
        }

        $user = $request->user();

        // Siswa hanya boleh melihat pengajuan miliknya.
        if ($user->isSiswa() && $pengajuan->siswa_id !== $user->siswa?->id) {
            return $this->errorResponse('Anda tidak memiliki akses ke pengajuan ini.', 403);
        }

        return $this->successResponse(
            new PengajuanIzinResource($pengajuan),
            'Detail pengajuan izin berhasil diambil.'
        );
    }

    /**
     * PATCH /pengajuan-izin/{id}/approve (Admin/Guru)
     */
    public function approve(VerifikasiPengajuanIzinRequest $request, string $id): JsonResponse
    {
        $user = $request->user()->load('guru.kelas');
        $pengajuan = $this->service->findById((int) $id);

        if (!$pengajuan) {
            return $this->errorResponse('Data pengajuan izin tidak ditemukan.', 404);
        }

        if (!$this->service->canVerify($user, $pengajuan)) {
            return $this->errorResponse(
                'Anda tidak memiliki izin untuk memverifikasi pengajuan ini.',
                403
            );
        }

        try {
            $pengajuan = $this->service->approve($pengajuan->id, $user, $request->input('catatan'));
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        }

        return $this->successResponse(
            new PengajuanIzinResource($pengajuan),
            'Pengajuan izin disetujui. Absensi siswa telah diperbarui.'
        );
    }

    /**
     * PATCH /pengajuan-izin/{id}/reject (Admin/Guru)
     */
    public function reject(VerifikasiPengajuanIzinRequest $request, string $id): JsonResponse
    {
        $user = $request->user()->load('guru.kelas');
        $pengajuan = $this->service->findById((int) $id);

        if (!$pengajuan) {
            return $this->errorResponse('Data pengajuan izin tidak ditemukan.', 404);
        }

        if (!$this->service->canVerify($user, $pengajuan)) {
            return $this->errorResponse(
                'Anda tidak memiliki izin untuk memverifikasi pengajuan ini.',
                403
            );
        }

        try {
            $pengajuan = $this->service->reject($pengajuan->id, $user, $request->input('catatan'));
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        }

        return $this->successResponse(
            new PengajuanIzinResource($pengajuan),
            'Pengajuan izin ditolak. Absensi tidak diubah.'
        );
    }
}
