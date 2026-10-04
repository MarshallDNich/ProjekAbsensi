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

        // Absensi hari ini (status di DB: hadir, terlambat, izin, sakit, alpa)
        $absensiHariIni = Absensi::whereDate('tanggal', $today)->get();
        $totalAbsensiHariIni = $absensiHariIni->count();
        $siswaHadirHariIni = $absensiHariIni->where('status', 'hadir')->count();
        $siswaTerlambatHariIni = $absensiHariIni->where('status', 'terlambat')->count();
        $siswaSakitHariIni = $absensiHariIni->where('status', 'sakit')->count();
        $siswaIzinHariIni = $absensiHariIni->where('status', 'izin')->count();
        $siswaAlpaHariIni = $absensiHariIni->where('status', 'alpa')->count();

        $siswaBelumAbsenHariIni = max(0, $totalSiswa - $totalAbsensiHariIni);
        $persentaseKehadiranHariIni = $totalSiswa > 0
            ? round((($siswaHadirHariIni + $siswaTerlambatHariIni) / $totalSiswa) * 100, 1)
            : 0;

        // Rekap Kehadiran 7 Hari Terakhir (Hanya hari sekolah)
        $rekapMingguan = [];
        $currentDate = Carbon::today();
        $collected = 0;
        $lookback = 0;

        while ($collected < 7 && $lookback < 21) {
            $date = $currentDate->copy()->subDays($lookback);
            $lookback++;

            // Skip Sabtu & Minggu
            if ($date->isSaturday() || $date->isSunday()) {
                continue;
            }

            $dateStr = $date->format('Y-m-d');
            $dayName = $date->locale('id')->isoFormat('dddd');

            $countHadir = Absensi::whereDate('tanggal', $dateStr)
                ->whereIn('status', ['hadir', 'terlambat'])
                ->count();

            $pct = $totalSiswa > 0 ? round(($countHadir / $totalSiswa) * 100) : 0;

            $rekapMingguan[] = [
                'date' => $dateStr,
                'day' => mb_substr($dayName, 0, 3),
                'percentage' => $pct,
                'total_hadir' => $countHadir,
            ];

            $collected++;
        }

        // Revers ke urutan hari (terlama ke terbaru)
        $rekapMingguan = array_reverse($rekapMingguan);

        // Aktivitas Absensi Terkini (10 Terbaru)
        $aktivitasTerkini = Absensi::with(['siswa.user', 'siswa.kelas'])
            ->latest('updated_at')
            ->take(10)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'siswa_nama' => $item->siswa && $item->siswa->user ? $item->siswa->user->nama : 'Siswa',
                    'kelas' => $item->siswa && $item->siswa->kelas ? $item->siswa->kelas->nama_kelas : '-',
                    'status' => ucfirst($item->status),
                    'jam_masuk' => $item->jam_masuk ? Carbon::parse($item->jam_masuk)->format('H:i') : '-',
                    'tanggal' => $item->tanggal,
                    'waktu_relatif' => Carbon::parse($item->updated_at)->diffForHumans(),
                ];
            })
            ->toArray();

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
                'terlambat' => $siswaTerlambatHariIni,
                'sakit' => $siswaSakitHariIni,
                'izin' => $siswaIzinHariIni,
                'alpa' => $siswaAlpaHariIni,
                'belum_absen' => $siswaBelumAbsenHariIni,
                'persentase' => [
                    'hadir' => $totalSiswa > 0 ? round((($siswaHadirHariIni + $siswaTerlambatHariIni) / $totalSiswa) * 100) : 0,
                    'sakit' => $totalSiswa > 0 ? round(($siswaSakitHariIni / $totalSiswa) * 100) : 0,
                    'izin' => $totalSiswa > 0 ? round(($siswaIzinHariIni / $totalSiswa) * 100) : 0,
                    'alpa' => $totalSiswa > 0 ? round(($siswaAlpaHariIni / $totalSiswa) * 100) : 0,
                ],
            ],
            'rekap_mingguan' => $rekapMingguan,
            'aktivitas_terkini' => $aktivitasTerkini,
        ], 'Data analitik dashboard admin berhasil diambil.');
    }

    /**
     * Endpoint Analitik untuk Dashboard Siswa
     */
    public function siswaStats(Request $request): JsonResponse
    {
        $user = $request->user();
        $siswa = $user->siswa;

        if (!$siswa) {
            return $this->errorResponse('Akun Anda belum terhubung dengan data siswa.', 404);
        }

        $today = Carbon::today()->format('Y-m-d');
        $thisMonth = Carbon::now()->format('m');
        $thisYear = Carbon::now()->format('Y');

        // Status absensi hari ini
        $absensiHariIni = Absensi::where('siswa_id', $siswa->id)
            ->whereDate('tanggal', $today)
            ->first();

        // Rekap bulan ini
        $absensiBulanIni = Absensi::where('siswa_id', $siswa->id)
            ->whereMonth('tanggal', $thisMonth)
            ->whereYear('tanggal', $thisYear)
            ->get();

        $totalHadir = $absensiBulanIni->where('status', 'hadir')->count();
        $totalTerlambat = $absensiBulanIni->where('status', 'terlambat')->count();
        $totalSakit = $absensiBulanIni->where('status', 'sakit')->count();
        $totalIzin = $absensiBulanIni->where('status', 'izin')->count();
        $totalAlpa = $absensiBulanIni->where('status', 'alpa')->count();
        $totalAbsen = $absensiBulanIni->count();

        $persentaseKehadiran = $totalAbsen > 0
            ? round((($totalHadir + $totalTerlambat) / $totalAbsen) * 100, 1)
            : 0;

        // Jumlah hari sekolah bulan ini (Senin-Jumat)
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        $hariSekolah = 0;
        $cursor = $startOfMonth->copy();
        while ($cursor->lte($endOfMonth)) {
            if (!$cursor->isSaturday() && !$cursor->isSunday()) {
                $hariSekolah++;
            }
            $cursor->addDay();
        }

        // Pengajuan izin
        $pengajuanCount = \App\Models\PengajuanIzin::where('siswa_id', $siswa->id)->count();

        // Info siswa
        $kelas = $siswa->kelas;
        $hasFaceProfile = \App\Models\FaceProfile::where('siswa_id', $siswa->id)
            ->where('status', 'active')
            ->exists();

        return $this->successResponse([
            'siswa' => [
                'nama' => $user->nama,
                'nisn' => $siswa->nisn,
                'kelas' => $kelas ? $kelas->nama_kelas : '-',
                'jurusan' => $kelas ? $kelas->jurusan : '-',
                'has_face_profile' => $hasFaceProfile,
                'foto' => $user->foto ? (str_starts_with($user->foto, 'http') ? $user->foto : url('storage/' . $user->foto)) : null,
            ],
            'hari_ini' => [
                'sudah_absen' => (bool) $absensiHariIni,
                'status' => $absensiHariIni ? ucfirst($absensiHariIni->status) : null,
                'jam_masuk' => $absensiHariIni ? Carbon::parse($absensiHariIni->jam_masuk)->format('H:i') : null,
                'tanggal' => $today,
            ],
            'rekap_bulanan' => [
                'bulan' => Carbon::now()->locale('id')->isoFormat('MMMM YYYY'),
                'total_hadir' => $totalHadir,
                'total_terlambat' => $totalTerlambat,
                'total_sakit' => $totalSakit,
                'total_izin' => $totalIzin,
                'total_alpa' => $totalAlpa,
                'total_absen' => $totalAbsen,
                'persentase_kehadiran' => $persentaseKehadiran,
                'hari_sekolah' => $hariSekolah,
            ],
            'pengajuan_izin_count' => $pengajuanCount,
            'absensi_terakhir' => Absensi::where('siswa_id', $siswa->id)
                ->latest('tanggal')
                ->take(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'tanggal' => $item->tanggal,
                        'status' => ucfirst($item->status),
                        'jam_masuk' => $item->jam_masuk ? Carbon::parse($item->jam_masuk)->format('H:i') : null,
                        'keterangan' => $item->keterangan,
                    ];
                }),
        ], 'Data dashboard siswa berhasil diambil.');
    }
}
