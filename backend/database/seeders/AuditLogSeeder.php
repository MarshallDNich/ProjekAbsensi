<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class AuditLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $activities = [
            ['Login', 'Authentication'],
            ['Logout', 'Authentication'],
            ['Tambah Guru', 'Guru'],
            ['Ubah Guru', 'Guru'],
            ['Hapus Guru', 'Guru'],
            ['Tambah Kelas', 'Kelas'],
            ['Ubah Kelas', 'Kelas'],
            ['Tambah Siswa', 'Siswa'],
            ['Check In', 'Absensi'],
            ['Check Out', 'Absensi'],
        ];

        foreach (User::all() as $user) {

            for ($i = 1; $i <= 5; $i++) {

                $log = fake()->randomElement($activities);

                AuditLog::create([
                    'user_id' => $user->id,

                    'activity' => $log[0],

                    'module' => $log[1],

                    'description' => 'Data dummy aktivitas ' . strtolower($log[0]),

                    'ip_address' => fake()->ipv4(),

                    'user_agent' => fake()->userAgent(),
                ]);
            }
        }
    }
}