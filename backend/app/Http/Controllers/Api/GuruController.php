<?php

namespace App\Http\Controllers\Api;

use App\Models\Guru;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\GuruService;
use App\Http\Resources\GuruResource;
use App\Http\Requests\Guru\StoreGuruRequest;
use App\Http\Requests\Guru\UpdateGuruRequest;

class GuruController extends BaseApiController
{
    public function __construct(
        protected GuruService $guruService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $users = $this->guruService->getAll($request->all());

        return $this->successResponse(
            $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'foto' => $user->foto ? url('storage/' . $user->foto) : null,
                    'status' => $user->status,
                    'role' => $user->role,
                    'guru' => $user->guru ? [
                        'id' => $user->guru->id,
                        'mata_pelajaran' => $user->guru->mata_pelajaran ?? [],
                        'kelas' => $user->guru->kelas->map(function ($kelas) {
                            return [
                                'id' => $kelas->id,
                                'nama_kelas' => $kelas->nama_kelas,
                                'tingkat' => $kelas->tingkat,
                                'jurusan' => $kelas->jurusan,
                            ];
                        }),
                    ] : null,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ];
            }),
            'Data guru berhasil diambil.',
            200,
            [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ]
        );
    }

    public function store(StoreGuruRequest $request): JsonResponse
    {
        $guru = $this->guruService->create($request->validated());

        return $this->successResponse(
            new GuruResource($guru),
            'Data guru berhasil dilengkapi.',
            201
        );
    }

    public function show($id): JsonResponse
    {
        // Cek apakah ini user_id atau guru_id
        $guru = $this->guruService->getByUserIdOrGuruId($id);
        
        if (!$guru) {
            return $this->errorResponse('Data guru tidak ditemukan.', 404);
        }

        return $this->successResponse(
            new GuruResource($guru),
            'Detail guru berhasil diambil.'
        );
    }

    public function update(UpdateGuruRequest $request, Guru $guru): JsonResponse
    {
        $updatedGuru = $this->guruService->update($guru, $request->validated());

        return $this->successResponse(
            new GuruResource($updatedGuru),
            'Data guru berhasil diperbarui.'
        );
    }

    public function destroy(Guru $guru): JsonResponse
    {
        $this->guruService->delete($guru);

        return $this->successResponse(
            null,
            'Data guru berhasil dihapus.'
        );
    }
}
