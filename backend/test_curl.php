<?php

$ch = curl_init('http://127.0.0.1:8000/api/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Accept: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'admin@absensi.com',
    'password' => 'password'
]));
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $resData = json_decode($response, true);
    $token = $resData['data']['token'] ?? $resData['token'] ?? null;

    if ($token) {
        $ch2 = curl_init('http://127.0.0.1:8000/api/users');
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch2, CURLOPT_POST, true);
        curl_setopt($ch2, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json',
            'Authorization: Bearer ' . $token
        ]);
        curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode([
            'nama' => 'User Dari cURL',
            'email' => 'curltester2@school.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'Siswa',
            'status' => 'Aktif',
            'nisn' => '0098765433'
        ]));
        $resp2 = curl_exec($ch2);
        $code2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
        curl_close($ch2);

        echo "POST /api/users HTTP Code: " . $code2 . "\n";
        $data = json_decode($resp2, true);
        echo "Exception Message: " . ($data['message'] ?? 'No message') . "\n";
        echo "Exception File: " . ($data['file'] ?? 'No file') . " line " . ($data['line'] ?? '') . "\n";
    }
}
