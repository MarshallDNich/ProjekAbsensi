<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\Siswa;
use App\Models\Guru;
use Illuminate\Support\Facades\DB;

class UserRepository
{
    /**
     * Menampilkan seluruh data user
     */
    public function getAll(array $filters = [])
    {
        $query = User::with(['siswa.kelas', 'guru']);

        // Search
        if (!empty($filters['search'])) {
            $search = $filters['search'];

            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter Role
        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        // Filter Status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        return $query->paginate(
            $filters['per_page'] ?? 10
        );
    }

    /**
     * Menampilkan detail user
     */
    public function findById(User $user): User
    {
        return $user->load(['siswa.kelas', 'guru']);
    }

    /**
     * Menyimpan user baru + profil terkait (Siswa / Guru)
     */
    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $userData = [
                'nama' => $data['nama'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => $data['role'],
                'status' => $data['status'] ?? 'Aktif',
            ];
            if (!empty($data['foto'])) {
                $userData['foto'] = $data['foto'];
            }

            $user = User::create($userData);

            // Handle Siswa creation
            if ($user->role === 'Siswa') {
                $nisn = !empty($data['nisn']) ? $data['nisn'] : str_pad((string)mt_rand(1, 9999999999), 10, '0', STR_PAD_LEFT);
                Siswa::create([
                    'user_id' => $user->id,
                    'nisn' => $nisn,
                    'jenis_kelamin' => !empty($data['jenis_kelamin']) ? $data['jenis_kelamin'] : 'Laki-laki',
                    'tanggal_lahir' => !empty($data['tanggal_lahir']) ? $data['tanggal_lahir'] : now()->toDateString(),
                    'alamat' => !empty($data['alamat']) ? $data['alamat'] : 'Belum diisi',
                    'nomor_telepon' => !empty($data['nomor_telepon']) ? $data['nomor_telepon'] : '-',
                    'kelas_id' => !empty($data['kelas_id']) ? $data['kelas_id'] : null,
                ]);
            }

            // Handle Guru creation
            if ($user->role === 'Guru') {
                $nip = !empty($data['nip']) ? $data['nip'] : date('Ymd') . mt_rand(1000, 9999);
                Guru::create([
                    'user_id' => $user->id,
                    'nip' => $nip,
                    'nama' => $user->nama,
                    'jenis_kelamin' => !empty($data['jenis_kelamin']) ? $data['jenis_kelamin'] : 'Laki-laki',
                    'nomor_telepon' => !empty($data['nomor_telepon']) ? $data['nomor_telepon'] : '-',
                    'alamat' => !empty($data['alamat']) ? $data['alamat'] : 'Belum diisi',
                ]);
            }

            return $user->load(['siswa.kelas', 'guru']);
        });
    }

    /**
     * Update user + profil terkait
     */
    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $userData = [
                'nama' => $data['nama'],
                'email' => $data['email'],
                'role' => $data['role'],
                'status' => $data['status'] ?? $user->status ?? 'Aktif',
            ];
            if (!empty($data['password'])) {
                $userData['password'] = $data['password'];
            }
            if (isset($data['foto'])) {
                $userData['foto'] = $data['foto'];
            }

            $user->update($userData);

            // Handle Siswa profile
            if ($user->role === 'Siswa') {
                $existingNisn = $user->siswa ? $user->siswa->nisn : str_pad((string)mt_rand(1, 9999999999), 10, '0', STR_PAD_LEFT);
                Siswa::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'nisn' => !empty($data['nisn']) ? $data['nisn'] : $existingNisn,
                        'jenis_kelamin' => !empty($data['jenis_kelamin']) ? $data['jenis_kelamin'] : ($user->siswa ? $user->siswa->jenis_kelamin : 'Laki-laki'),
                        'tanggal_lahir' => !empty($data['tanggal_lahir']) ? $data['tanggal_lahir'] : ($user->siswa ? $user->siswa->tanggal_lahir : now()->toDateString()),
                        'alamat' => !empty($data['alamat']) ? $data['alamat'] : ($user->siswa ? $user->siswa->alamat : 'Belum diisi'),
                        'nomor_telepon' => !empty($data['nomor_telepon']) ? $data['nomor_telepon'] : ($user->siswa ? $user->siswa->nomor_telepon : '-'),
                        'kelas_id' => !empty($data['kelas_id']) ? $data['kelas_id'] : ($user->siswa ? $user->siswa->kelas_id : null),
                    ]
                );
            }

            // Handle Guru profile
            if ($user->role === 'Guru') {
                $existingNip = $user->guru ? $user->guru->nip : date('Ymd') . mt_rand(1000, 9999);
                Guru::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'nip' => !empty($data['nip']) ? $data['nip'] : $existingNip,
                        'nama' => $user->nama,
                        'jenis_kelamin' => !empty($data['jenis_kelamin']) ? $data['jenis_kelamin'] : ($user->guru ? $user->guru->jenis_kelamin : 'Laki-laki'),
                        'nomor_telepon' => !empty($data['nomor_telepon']) ? $data['nomor_telepon'] : ($user->guru ? $user->guru->nomor_telepon : '-'),
                        'alamat' => !empty($data['alamat']) ? $data['alamat'] : ($user->guru ? $user->guru->alamat : 'Belum diisi'),
                    ]
                );
            }

            return $user->fresh(['siswa.kelas', 'guru']);
        });
    }

    /**
     * Soft delete user
     */
    public function delete(User $user): bool
    {
        return $user->delete();
    }
}