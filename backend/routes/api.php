<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\GuruController;
use App\Http\Controllers\Api\KelasController;
use App\Http\Controllers\Api\SiswaController;
use App\Http\Controllers\Api\MataPelajaranController;
use App\Http\Controllers\Api\AbsensiController;
use App\Http\Controllers\Api\FaceProfileController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LaporanController;
use App\Http\Controllers\Api\PengajuanIzinController;
use App\Http\Controllers\Api\JamPelajaranController;
use App\Http\Controllers\Api\JadwalPelajaranController;

/*
|--------------------------------------------------------------------------
| API Routes — Sistem Absensi Sekolah
|--------------------------------------------------------------------------
*/

// Public Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Authenticated Routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {

    // General Auth
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/me/register-wajah', [AuthController::class, 'registerWajah']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin Routes — Restricted to Role: Admin
    Route::middleware('role:Admin')->group(function () {
        Route::get('/dashboard/admin-stats', [DashboardController::class, 'adminStats']);
        Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
        Route::apiResource('users', UserController::class);
        Route::apiResource('guru', GuruController::class);
        Route::apiResource('kelas', KelasController::class);
        Route::apiResource('mata-pelajaran', MataPelajaranController::class);
        Route::apiResource('siswa', SiswaController::class);
    });

    // Dashboard Siswa
    Route::middleware('role:Siswa')->group(function () {
        Route::get('/dashboard/siswa-stats', [DashboardController::class, 'siswaStats']);
    });

    // Laporan Rekap Route (Admin & Guru)
    Route::middleware('role:Admin,Guru')->group(function () {
        Route::get('/laporan/rekap', [LaporanController::class, 'rekap']);
    });

    // -------------------------------------------------------------------------
    // Absensi Routes
    // -------------------------------------------------------------------------

    // Siswa: hanya bisa absen masuk dan lihat riwayat sendiri
    Route::middleware('role:Siswa')->group(function () {
        Route::post('/absensi', [AbsensiController::class, 'store']);
        Route::get('/absensi/riwayat-saya', [AbsensiController::class, 'riwayatSaya'])
            ->name('absensi.riwayat-saya');
    });

    // Admin & Guru: bisa lihat semua data absensi & daftarkan wajah siswa
    Route::middleware('role:Admin,Guru')->group(function () {
        Route::get('/absensi', [AbsensiController::class, 'index']);
        Route::post('/absensi/manual', [AbsensiController::class, 'storeManual']);
        Route::get('/absensi/{id}', [AbsensiController::class, 'show']);

        // Pendaftaran wajah siswa (hanya Admin/Guru)
        Route::post('/siswa/{siswa}/face-register', [FaceProfileController::class, 'register']);
        Route::delete('/siswa/{siswa}/face-profile', [FaceProfileController::class, 'destroy']);
    });

    // Admin saja: update & hapus
    Route::middleware('role:Admin')->group(function () {
        Route::put('/absensi/{id}', [AbsensiController::class, 'update']);
        Route::delete('/absensi/{id}', [AbsensiController::class, 'destroy']);
    });

    // -------------------------------------------------------------------------
    // Pengajuan Izin Siswa
    // -------------------------------------------------------------------------

    // Siswa: membuat pengajuan (identitas diambil dari token, bukan input).
    Route::middleware('role:Siswa')->group(function () {
        Route::post('/pengajuan-izin', [PengajuanIzinController::class, 'store']);
    });

    // Siswa (milik sendiri) & Admin/Guru (verifikasi): lihat daftar & detail.
    Route::middleware('role:Siswa,Admin,Guru')->group(function () {
        Route::get('/pengajuan-izin', [PengajuanIzinController::class, 'index']);
        Route::get('/pengajuan-izin/{id}', [PengajuanIzinController::class, 'show']);
    });

    // Admin & Guru: verifikasi (approve / reject).
    Route::middleware('role:Admin,Guru')->group(function () {
        Route::patch('/pengajuan-izin/{id}/approve', [PengajuanIzinController::class, 'approve']);
        Route::patch('/pengajuan-izin/{id}/reject', [PengajuanIzinController::class, 'reject']);
    });

    // -------------------------------------------------------------------------
    // Jam Pelajaran (hanya Admin)
    // -------------------------------------------------------------------------
    Route::middleware('role:Admin')->group(function () {
        Route::apiResource('jam-pelajaran', JamPelajaranController::class);
        Route::post('/jam-pelajaran/reorder', [JamPelajaranController::class, 'reorder']);
    });

    // -------------------------------------------------------------------------
    // Jadwal Pelajaran
    // -------------------------------------------------------------------------

    // Semua role: lihat jadwal (dibatasi controller berdasarkan role)
    Route::middleware('role:Admin,Guru,Siswa')->group(function () {
        Route::get('/jadwal-pelajaran', [JadwalPelajaranController::class, 'index']);
        Route::get('/jadwal-pelajaran/timetable', [JadwalPelajaranController::class, 'timetable']);
    });

    // Admin saja: CRUD tulis
    Route::middleware('role:Admin')->group(function () {
        Route::post('/jadwal-pelajaran', [JadwalPelajaranController::class, 'store']);
        Route::get('/jadwal-pelajaran/{id}', [JadwalPelajaranController::class, 'show']);
        Route::put('/jadwal-pelajaran/{id}', [JadwalPelajaranController::class, 'update']);
        Route::delete('/jadwal-pelajaran/{id}', [JadwalPelajaranController::class, 'destroy']);
    });

});