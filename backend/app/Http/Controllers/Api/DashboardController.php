<?php

namespace App\Http\Controllers\Api;

use App\Models\Guru;
use App\Models\Siswa;
use App\Models\Kelas;
use App\Models\Absensi;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends BaseApiController
{
    /**
     * Endpoint Analitik untuk Dashboard Admin
     */
    public function adminStats(Request $request): JsonResponse
    {
        $today = Carbon::today()->format('Y-m-d');
        $totalGuru = Guru::count();
        $totalSiswa = Siswa::count();
        $totalKelas = Kelas::count();

        // Absensi hari ini
        $absensiHariIni = Absensi::whereDate('tanggal', $today)->get();
        $totalAbsensiHariIni = $absensiHariIni->count();
        $siswaHadirHariIni = $absensiHariIni->where('status', 'Hadir')->count();
        $siswaSakitHariIni = $absensiHariIni->where('status', 'Sakit')->count();
        $siswaIzinHariIni = $absensiHariIni->where('status', 'Izin')->count();
        $siswaAlpaHariIni = $absensiHariIni->where('status', 'Alpa')->count();

        $siswaBelumAbsenHariIni = max(0, $totalSiswa - $totalAbsensiHariIni);
        $persentaseKehadiranHariIni = $totalSiswa > 0 
            ? round(($siswaHadirHariIni / $totalSiswa) * 100, 1) 
            : 0;

        // Rekap Kehadiran 7 Hari Terakhir (Mingguan)
        $rekapMingguan = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dateStr = $date->format('Y-m-d');
            $dayNameName = $date->locale('id')->isoFormat('dd'); // Sen, Sel, Rab, Kam, Jum, Sab, Min

            $countHadir = Absensi::whereDate('tanggal', $dateStr)
                ->where('status', 'Hadir')
                ->count();

            $pct = $totalSiswa > 0 ? round(($countHadir / $totalSiswa) * 100) : 0;

            $rekapMingguan[] = [
                'date' => $dateStr,
                'day' => $dayNameName,
                'percentage' => $pct,
                'total_hadir' => $countHadir,
            ];
        }

        // Aktivitas Absensi Terkini (5 Terbaru)
        $aktivitasTerkini = Absensi::with(['siswa.user', 'siswa.kelas'])
            ->latest('updated_at')
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'siswa_nama' => $item->siswa && $item->siswa->user ? $item->siswa->user->nama : 'Siswa',
                    'kelas' => $item->siswa && $item->siswa->kelas ? $item->siswa->kelas->nama_kelas : '-',
                    'status' => $item->status,
                    'jam_masuk' => $item->jam_masuk ? Carbon::parse($item->jam_masuk)->format('H:i') : '-',
                    'waktu_relatif' => Carbon::parse($item->updated_at)->diffForHumans(),
                ];
            });

        return $this->successResponse([
            'summary' => [
                'total_guru' => $totalGuru,
                'total_siswa' => $totalSiswa,
                'total_kelas' => $totalKelas,
                'total_absensi_hari_ini' => $totalAbsensiHariIni,
                'siswa_belum_absen' => $siswaBelumAbsenHariIni,
                'persentase_kehadiran_hari_ini' => $persentaseKehadiranHariIni,
            ],
            'distribusi_status' => [
                'hadir' => $siswaHadirHariIni,
                'sakit' => $siswaSakitHariIni,
                'izin' => $siswaIzinHariIni,
                'alpa' => $siswaAlpaHariIni,
                'belum_absen' => $siswaBelumAbsenHariIni,
                'persentase' => [
                    'hadir' => $totalSiswa > 0 ? round(($siswaHadirHariIni / $totalSiswa) * 100) : 0,
                    'sakit' => $totalSiswa > 0 ? round(($siswaSakitHariIni / $totalSiswa) * 100) : 0,
                    'izin' => $totalSiswa > 0 ? round(($siswaIzinHariIni / $totalSiswa) * 100) : 0,
                    'alpa' => $totalSiswa > 0 ? round(($siswaAlpaHariIni / $totalSiswa) * 100) : 0,
                ],
            ],
            'rekap_mingguan' => $rekapMingguan,
            'aktivitas_terkini' => $aktivitasTerkini,
        ], 'Data analitik dashboard admin berhasil diambil.');
    }
}
