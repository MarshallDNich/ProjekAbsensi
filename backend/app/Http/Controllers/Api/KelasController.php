<?php

namespace App\Http\Controllers\Api;

use App\Models\Kelas;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\KelasService;
use App\Http\Resources\KelasResource;
use App\Http\Requests\Kelas\StoreKelasRequest;
use App\Http\Requests\Kelas\UpdateKelasRequest;

class KelasController extends BaseApiController
{
    public function __construct(
        protected KelasService $kelasService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $kelas = $this->kelasService->getAll($request->all());

        // Kembalikan array item langsung agar konsisten
        // dengan bentuk response yang dikonsumsi frontend.
        $data = $kelas->getCollection()
            ->map(fn (Kelas $item) => new KelasResource($item))
            ->values();

        return $this->successResponse(
            $data,
            'Data kelas berhasil diambil.',
            200,
            [
                'current_page' => $kelas->currentPage(),
                'last_page' => $kelas->lastPage(),
                'per_page' => $kelas->perPage(),
                'total' => $kelas->total(),
            ]
        );
    }

    public function store(StoreKelasRequest $request): JsonResponse
    {
        $kelas = $this->kelasService->create($request->validated());

        return $this->successResponse(
            new KelasResource($kelas),
            'Data kelas berhasil ditambahkan.',
            201
        );
    }

    public function show(Kelas $kela): JsonResponse
    {
        return $this->successResponse(
            new KelasResource($this->kelasService->getById($kela)),
            'Detail kelas berhasil diambil.'
        );
    }

    public function update(UpdateKelasRequest $request, Kelas $kela): JsonResponse
    {
        $updatedKelas = $this->kelasService->update($kela, $request->validated());

        return $this->successResponse(
            new KelasResource($updatedKelas),
            'Data kelas berhasil diperbarui.'
        );
    }

    public function destroy(Kelas $kela): JsonResponse
    {
        $this->kelasService->delete($kela);

        return $this->successResponse(
            null,
            'Data kelas berhasil dihapus.'
        );
    }
}
