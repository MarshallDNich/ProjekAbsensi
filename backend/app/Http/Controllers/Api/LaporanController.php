<?php

namespace App\Http\Controllers\Api;

use App\Models\Siswa;
use App\Models\Kelas;
use App\Models\Absensi;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class LaporanController extends BaseApiController
{
    /**
     * Laporan Rekap Absensi (Admin & Guru)
     */
    public function rekap(Request $request): JsonResponse
    {
        $bulan = $request->get('bulan', Carbon::now()->format('m'));
        $tahun = $request->get('tahun', Carbon::now()->format('Y'));
        $kelasId = $request->get('kelas_id');

        $query = Siswa::with(['user', 'kelas'])
            ->withCount([
                'absensis as count_hadir' => function ($q) use ($bulan, $tahun) {
                    $q->whereMonth('tanggal', $bulan)
                      ->whereYear('tanggal', $tahun)
                      ->where('status', 'Hadir');
                },
                'absensis as count_sakit' => function ($q) use ($bulan, $tahun) {
                    $q->whereMonth('tanggal', $bulan)
                      ->whereYear('tanggal', $tahun)
                      ->where('status', 'Sakit');
                },
                'absensis as count_izin' => function ($q) use ($bulan, $tahun) {
                    $q->whereMonth('tanggal', $bulan)
                      ->whereYear('tanggal', $tahun)
                      ->where('status', 'Izin');
                },
                'absensis as count_alpa' => function ($q) use ($bulan, $tahun) {
                    $q->whereMonth('tanggal', $bulan)
                      ->whereYear('tanggal', $tahun)
                      ->where('status', 'Alpa');
                },
            ]);

        if ($kelasId) {
            $query->where('kelas_id', $kelasId);
        }

        $rekapSiswa = $query->get()->map(function ($siswa) {
            $totalHadir = $siswa->count_hadir;
            $totalSakit = $siswa->count_sakit;
            $totalIzin = $siswa->count_izin;
            $totalAlpa = $siswa->count_alpa;
            $totalPertemuan = $totalHadir + $totalSakit + $totalIzin + $totalAlpa;

            $persentase = $totalPertemuan > 0 
                ? round(($totalHadir / $totalPertemuan) * 100, 1) 
                : 0;

            return [
                'siswa_id' => $siswa->id,
                'nisn' => $siswa->nisn,
                'nama' => $siswa->user ? $siswa->user->nama : '-',
                'kelas' => $siswa->kelas ? $siswa->kelas->nama_kelas : '-',
                'hadir' => $totalHadir,
                'sakit' => $totalSakit,
                'izin' => $totalIzin,
                'alpa' => $totalAlpa,
                'total' => $totalPertemuan,
                'persentase_kehadiran' => $persentase,
            ];
        });

        return $this->successResponse([
            'filter' => [
                'bulan' => (int) $bulan,
                'tahun' => (int) $tahun,
                'kelas_id' => $kelasId ? (int) $kelasId : null,
            ],
            'rekap' => $rekapSiswa,
        ], 'Laporan rekap absensi berhasil diambil.');
    }
}
