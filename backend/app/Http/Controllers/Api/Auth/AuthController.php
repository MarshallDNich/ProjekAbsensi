<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    /**
     * Register akun siswa
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil.',
            'data' => new UserResource($user),
        ], 201);
    }
    /**
 * Login
 */
public function login(LoginRequest $request): JsonResponse
{
    $result = $this->authService->login(
        $request->validated()
    );

    return response()->json([
        'success' => true,
        'message' => 'Login berhasil.',
        'token' => $result['token'],
        'data' => new UserResource($result['user']),
    ]);
}
public function logout(Request $request): JsonResponse
{
    $this->authService->logout(
        $request->user()
    );

    return response()->json([
        'success' => true,
        'message' => 'Logout berhasil.',
    ]);
}
/*************************************************
 * Profile User Login
 *************************************************/
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if ($user->role === 'Siswa') {
            $user->load('siswa.kelas');
        } elseif ($user->role === 'Guru') {
            $user->load('guru');
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Data profil user berhasil diambil.',
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Daftarkan / perbarui foto wajah referensi siswa
     */
    public function registerWajah(Request $request): JsonResponse
    {
        $request->validate([
            'foto' => ['required', 'string', new \App\Rules\Base64Image],
        ], [
            'foto.required' => 'Foto wajah wajib diambil dari kamera.',
        ]);

        $user = $request->user();

        // Decode & simpan foto via Intervention Image GD
        [, $base64Payload] = explode(',', $request->input('foto'), 2);
        $decoded = base64_decode($base64Payload, strict: true);

        $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver);
        $image   = $manager->read($decoded);
        $encoded = $image->toJpeg(quality: 85);

        $filename = 'wajah/' . \Illuminate\Support\Str::uuid() . '.jpg';
        \Illuminate\Support\Facades\Storage::disk('public')->put($filename, (string) $encoded);

        // Hapus foto lama jika ada
        if ($user->foto && \Illuminate\Support\Facades\Storage::disk('public')->exists($user->foto)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($user->foto);
        }

        $user->update(['foto' => $filename]);

        return response()->json([
            'success' => true,
            'message' => 'Data wajah berhasil didaftarkan.',
            'data'    => new UserResource($user->fresh(['siswa.kelas', 'guru'])),
        ]);
    }
}