<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Repositories\AuthRepository;

class AuthService
{
    public function __construct(
        protected AuthRepository $authRepository
    ) {}

    /**
     * Register siswa
     */
    public function register(array $data): User
    {
        return $this->authRepository->register($data);
    }
    public function login(array $data): array
{
    $user = $this->authRepository->findByEmail($data['email']);

    if (!$user || !Hash::check($data['password'], $user->password)) {

        throw ValidationException::withMessages([
            'email' => ['Email atau password salah.'],
        ]);

    }

    // Blokir akun yang statusnya Nonaktif
    if (($user->status ?? 'Aktif') === 'Nonaktif') {
        throw ValidationException::withMessages([
            'email' => ['Akun Anda dinonaktifkan. Silakan hubungi administrator.'],
        ]);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return [
        'user' => $user,
        'token' => $token,
    ];
}
/**
 * Logout
 */
public function logout(User $user): void
{
    $user->currentAccessToken()->delete();
}
/**
 * Data user yang sedang login
 */
public function me(User $user): User
{
    // Token lama dari akun yang baru dinonaktifkan tidak boleh dipakai lagi
    if (($user->status ?? 'Aktif') === 'Nonaktif') {
        $user->tokens()->delete();

        throw ValidationException::withMessages([
            'email' => ['Akun Anda dinonaktifkan. Silakan hubungi administrator.'],
        ]);
    }

    return $user;
}
}
