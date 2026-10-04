<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\DB;

class UserService
{
    protected UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Ambil semua user
     */
    public function getAll(array $filters = [])
    {
        return $this->userRepository->getAll($filters);
    }

    /**
     * Detail user
     */
    public function getById(User $user): User
    {
        return $this->userRepository->findById($user);
    }

    /**
     * Tambah user + profil terkait (Siswa/Guru).
     * Seluruh logika pembuatan profil ada di UserRepository
     * agar tidak terjadi double-create (bentrok unique user_id).
     */
    public function create(array $data): User
    {
        return $this->userRepository->create($data);
    }

    /**
     * Update user + profil terkait, dan bersihkan profil lama
     * yang tidak lagi relevan ketika role berubah.
     */
    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $oldRole = $user->role;
            $newRole = $data['role'] ?? $oldRole;

            $user = $this->userRepository->update($user, $data);

            // Hapus profil lama ketika role berubah
            if ($oldRole !== $newRole) {
                if ($newRole === 'Admin') {
                    $user->siswa()->delete();
                    $user->guru()->delete();
                } elseif ($newRole === 'Siswa' && $user->guru) {
                    $user->guru->delete();
                } elseif ($newRole === 'Guru' && $user->siswa) {
                    $user->siswa->delete();
                }
            }

            return $user->fresh(['siswa.kelas', 'guru']);
        });
    }

    /**
     * Hapus user
     */
    public function delete(User $user): bool
    {
        return $this->userRepository->delete($user);
    }
}
