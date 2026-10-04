<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Absensi\StoreAbsensiRequest;
use App\Http\Requests\Absensi\ManualAbsensiRequest;
use App\Http\Resources\AbsensiResource;
use App\Services\AbsensiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AbsensiController extends BaseApiController
{
    public function __construct(
        protected AbsensiService $absensiService
    ) {}

    /**
     * Siswa: simpan absensi (hanya role Siswa).
     */
    public function store(StoreAbsensiRequest $request): JsonResponse
    {
        try {
            $absensi = $this->absensiService->storeAbsensi(
                $request->user(),
                $request->validated()
            );
        } catch (ValidationException $e) {
            return $this->errorResponse(
                $e->getMessage(),
                422,
                $e->errors()
            );
        }

        return $this->successResponse(
            new AbsensiResource($absensi),
            'Absensi berhasil dicatat.',
            201
        );
    }

    /**
     * Admin/Guru: presensi manual (tanpa face recognition).
     */
    public function storeManual(ManualAbsensiRequest $request): JsonResponse
    {
        try {
            $absensi = $this->absensiService->storeManual($request->validated());
        } catch (ValidationException $e) {
            return $this->errorResponse(
                $e->getMessage(),
                422,
                $e->errors()
            );
        }

        return $this->successResponse(
            new AbsensiResource($absensi),
            'Presensi manual berhasil dicatat.',
            201
        );
    }

    /**
     * Admin/Guru: daftar siswa yang sudah absensi (filter tanggal/kelas/status).
     */
    public function index(Request $request): JsonResponse
    {
        $data = $this->absensiService->listForAdmin($request->all());

        $collection = AbsensiResource::collection($data);
        $responseData = $collection->response()->getData(true);

        return $this->successResponse(
            $responseData['data'],
            'Data absensi berhasil diambil.',
            200,
            $responseData['meta'] ?? []
        );
    }

    /**
     * Detail absensi.
     */
    public function show(string $id): JsonResponse
    {
        $absensi = $this->absensiService->findById((int) $id);

        if (!$absensi) {
            return $this->errorResponse('Data absensi tidak ditemukan.', 404);
        }

        return $this->successResponse(
            new AbsensiResource($absensi),
            'Detail absensi berhasil diambil.'
        );
    }

    /**
     * Siswa: riwayat absensi milik sendiri.
     */
    public function riwayatSaya(Request $request): JsonResponse
    {
        $data = $this->absensiService->riwayatSiswa($request->user(), $request->all());

        if (!$data) {
            return $this->errorResponse(
                'Akun Anda belum terhubung dengan data siswa.',
                404
            );
        }

        $collection = AbsensiResource::collection($data);
        $responseData = $collection->response()->getData(true);

        return $this->successResponse(
            $responseData['data'],
            'Riwayat absensi berhasil diambil.',
            200,
            $responseData['meta'] ?? []
        );
    }

    /**
     * Admin: perbarui data absensi (mis. jam keluar / status).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $absensi = $this->absensiService->findById((int) $id);

        if (!$absensi) {
            return $this->errorResponse('Data absensi tidak ditemukan.', 404);
        }

        $data = $request->validate([
            'jam_keluar' => ['nullable', 'date_format:H:i:s'],
            'status'     => ['nullable', 'in:hadir,terlambat,izin,sakit,alpa'],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ]);

        $updated = $this->absensiService->update($absensi, $data);

        return $this->successResponse(
            new AbsensiResource($updated),
            'Data absensi berhasil diperbarui.'
        );
    }

    /**
     * Admin: hapus data absensi.
     */
    public function destroy(string $id): JsonResponse
    {
        $absensi = $this->absensiService->findById((int) $id);

        if (!$absensi) {
            return $this->errorResponse('Data absensi tidak ditemukan.', 404);
        }

        $this->absensiService->delete($absensi);

        return $this->successResponse(null, 'Data absensi berhasil dihapus.');
    }
}
