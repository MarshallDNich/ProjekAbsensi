<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Testing User creation...\n";
    $userData = [
        'nama' => 'Budi Santoso',
        'email' => 'budi.santoso@school.com',
        'password' => 'password123',
        'role' => 'Siswa',
        'status' => 'Aktif',
        'nisn' => '1234567890',
        'jenis_kelamin' => 'Laki-laki',
        'tanggal_lahir' => '2008-05-15',
        'nomor_telepon' => '08123456789',
        'alamat' => 'Jl. Merdeka No 1',
        'kelas_id' => null,
    ];

    $userRepo = new \App\Repositories\UserRepository();
    $user = $userRepo->create($userData);

    echo "SUCCESS! User Created with ID: " . $user->id . "\n";
    echo "Role: " . $user->role . "\n";
    echo "Siswa NISN: " . ($user->siswa ? $user->siswa->nisn : 'None') . "\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "TRACE:\n" . $e->getTraceAsString() . "\n";
}
