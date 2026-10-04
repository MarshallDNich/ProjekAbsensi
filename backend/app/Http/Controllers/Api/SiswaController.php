<?php

namespace App\Http\Controllers\Api;

use App\Models\Siswa;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\SiswaService;
use App\Http\Resources\SiswaResource;
use App\Http\Requests\Siswa\StoreSiswaRequest;
use App\Http\Requests\Siswa\UpdateSiswaRequest;

class SiswaController extends BaseApiController
{
    public function __construct(
        protected SiswaService $siswaService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $siswa = $this->siswaService->getAll($request->all());

        return $this->successResponse(
            $siswa->map(function ($user) {
                return [
                    'id' => $user->id,
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'foto' => $user->foto ? url('storage/' . $user->foto) : null,
                    'status' => $user->status,
                    'role' => $user->role,
                    'siswa' => $user->siswa ? [
                        'id' => $user->siswa->id,
                        'kelas_id' => $user->siswa->kelas_id,
                        'kelas' => $user->siswa->kelas ? [
                            'id' => $user->siswa->kelas->id,
                            'nama_kelas' => $user->siswa->kelas->nama_kelas,
                            'tingkat' => $user->siswa->kelas->tingkat,
                            'jurusan' => $user->siswa->kelas->jurusan,
                        ] : null,
                    ] : null,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ];
            }),
            'Data siswa berhasil diambil.',
            200,
            [
                'current_page' => $siswa->currentPage(),
                'last_page' => $siswa->lastPage(),
                'per_page' => $siswa->perPage(),
                'total' => $siswa->total(),
            ]
        );
    }

    public function store(StoreSiswaRequest $request): JsonResponse
    {
        $siswa = $this->siswaService->create($request->validated());

        return $this->successResponse(
            new SiswaResource($siswa),
            'Penempatan kelas siswa berhasil dibuat.',
            201
        );
    }

    public function show($id): JsonResponse
    {
        $siswa = $this->siswaService->getByIdOrUserId($id);

        if (!$siswa) {
            return $this->errorResponse('Data siswa tidak ditemukan.', 404);
        }

        return $this->successResponse(
            new SiswaResource($siswa),
            'Detail siswa berhasil diambil.'
        );
    }

    public function update(UpdateSiswaRequest $request, Siswa $siswa): JsonResponse
    {
        $updatedSiswa = $this->siswaService->update($siswa, $request->validated());

        return $this->successResponse(
            new SiswaResource($updatedSiswa),
            'Kelas siswa berhasil diperbarui.'
        );
    }

    public function destroy(Siswa $siswa): JsonResponse
    {
        $this->siswaService->delete($siswa);

        return $this->successResponse(
            null,
            'Penempatan kelas siswa berhasil dihapus.'
        );
    }
}