<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\UserService;
use App\Http\Resources\UserResource;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;

class UserController extends BaseApiController
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Menampilkan daftar user
     */
    public function index(Request $request): JsonResponse
    {
        $users = $this->userService->getAll($request->all());

        // Kembalikan array item langsung (bukan wrapper Resource::collection)
        // agar konsisten dengan bentuk response AuthController & DashboardController.
        $data = $users->getCollection()
            ->map(fn (User $user) => new UserResource($user))
            ->values();

        return $this->successResponse(
            $data,
            'Data user berhasil diambil.',
            200,
            [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ]
        );
    }

    /**
     * Menambahkan user
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());

        return $this->successResponse(
            new UserResource($user),
            'Data user berhasil ditambahkan.',
            201
        );
    }

    /**
     * Menampilkan detail user
     */
    public function show(User $user): JsonResponse
    {
        return $this->successResponse(
            new UserResource($this->userService->getById($user)),
            'Detail user berhasil diambil.'
        );
    }

    /**
     * Mengubah user
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user = $this->userService->update(
            $user,
            $request->validated()
        );

        return $this->successResponse(
            new UserResource($user),
            'Data user berhasil diperbarui.'
        );
    }

    /**
     * Mengaktifkan / Menonaktifkan status user
     */
    public function toggleStatus(User $user): JsonResponse
    {
        $newStatus = ($user->status === 'Aktif') ? 'Nonaktif' : 'Aktif';
        $user->update(['status' => $newStatus]);

        return $this->successResponse(
            new UserResource($user->fresh(['siswa.kelas', 'guru'])),
            "Status user berhasil diubah menjadi {$newStatus}."
        );
    }

    /**
     * Menghapus user
     */
    public function destroy(User $user): JsonResponse
    {
        $this->userService->delete($user);

        return $this->successResponse(
            null,
            'Data user berhasil dihapus.'
        );
    }
}
