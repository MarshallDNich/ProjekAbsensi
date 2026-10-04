<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\JamPelajaran\StoreJamPelajaranRequest;
use App\Http\Requests\JamPelajaran\UpdateJamPelajaranRequest;
use App\Http\Resources\JamPelajaranResource;
use App\Services\JamPelajaranService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class JamPelajaranController extends BaseApiController
{
    public function __construct(
        protected JamPelajaranService $service
    ) {}

    public function index(): JsonResponse
    {
        $data = $this->service->getAll();
        return $this->successResponse(JamPelajaranResource::collection($data), 'Data jam pelajaran berhasil diambil.');
    }

    public function store(StoreJamPelajaranRequest $request): JsonResponse
    {
        try {
            $jam = $this->service->create($request->validated());
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        }

        return $this->successResponse(new JamPelajaranResource($jam), 'Jam pelajaran berhasil dibuat.', 201);
    }

    public function show(string $id): JsonResponse
    {
        $jam = $this->service->getById((int) $id);
        if (!$jam) {
            return $this->errorResponse('Jam pelajaran tidak ditemukan.', 404);
        }
        return $this->successResponse(new JamPelajaranResource($jam), 'Detail jam pelajaran berhasil diambil.');
    }

    public function update(UpdateJamPelajaranRequest $request, string $id): JsonResponse
    {
        $jam = $this->service->getById((int) $id);
        if (!$jam) {
            return $this->errorResponse('Jam pelajaran tidak ditemukan.', 404);
        }

        try {
            $updated = $this->service->update($jam, $request->validated());
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        }

        return $this->successResponse(new JamPelajaranResource($updated), 'Jam pelajaran berhasil diperbarui.');
    }

    public function destroy(string $id): JsonResponse
    {
        $jam = $this->service->getById((int) $id);
        if (!$jam) {
            return $this->errorResponse('Jam pelajaran tidak ditemukan.', 404);
        }

        try {
            $this->service->delete($jam);
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        }

        return $this->successResponse(null, 'Jam pelajaran berhasil dihapus.');
    }

    public function reorder(): JsonResponse
    {
        $ids = request()->input('ids', []);
        $this->service->reorder($ids);
        return $this->successResponse(null, 'Urutan jam pelajaran berhasil diperbarui.');
    }
}
