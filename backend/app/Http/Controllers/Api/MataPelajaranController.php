<?php

namespace App\Http\Controllers\Api;

use App\Models\MataPelajaran;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\MataPelajaranService;
use App\Http\Resources\MataPelajaranResource;
use App\Http\Requests\MataPelajaran\StoreMataPelajaranRequest;
use App\Http\Requests\MataPelajaran\UpdateMataPelajaranRequest;

class MataPelajaranController extends BaseApiController
{
    public function __construct(
        protected MataPelajaranService $mataPelajaranService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $mataPelajaran = $this->mataPelajaranService->getAll($request->all());

        $data = $mataPelajaran->getCollection()
            ->map(fn (MataPelajaran $item) => new MataPelajaranResource($item))
            ->values();

        return $this->successResponse(
            $data,
            'Data mata pelajaran berhasil diambil.',
            200,
            [
                'current_page' => $mataPelajaran->currentPage(),
                'last_page' => $mataPelajaran->lastPage(),
                'per_page' => $mataPelajaran->perPage(),
                'total' => $mataPelajaran->total(),
            ]
        );
    }

    public function store(StoreMataPelajaranRequest $request): JsonResponse
    {
        $mataPelajaran = $this->mataPelajaranService->create($request->validated());

        return $this->successResponse(
            new MataPelajaranResource($mataPelajaran),
            'Data mata pelajaran berhasil ditambahkan.',
            201
        );
    }

    public function show(MataPelajaran $mataPelajaran): JsonResponse
    {
        return $this->successResponse(
            new MataPelajaranResource($this->mataPelajaranService->getById($mataPelajaran)),
            'Detail mata pelajaran berhasil diambil.'
        );
    }

    public function update(UpdateMataPelajaranRequest $request, MataPelajaran $mataPelajaran): JsonResponse
    {
        $updatedMataPelajaran = $this->mataPelajaranService->update($mataPelajaran, $request->validated());

        return $this->successResponse(
            new MataPelajaranResource($updatedMataPelajaran),
            'Data mata pelajaran berhasil diperbarui.'
        );
    }

    public function destroy(MataPelajaran $mataPelajaran): JsonResponse
    {
        $this->mataPelajaranService->delete($mataPelajaran);

        return $this->successResponse(
            null,
            'Data mata pelajaran berhasil dihapus.'
        );
    }
}