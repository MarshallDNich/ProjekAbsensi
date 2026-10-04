<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\JadwalPelajaran\StoreJadwalPelajaranRequest;
use App\Http\Requests\JadwalPelajaran\UpdateJadwalPelajaranRequest;
use App\Http\Resources\JadwalPelajaranResource;
use App\Models\Guru;
use App\Services\JadwalPelajaranService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class JadwalPelajaranController extends BaseApiController
{
    public function __construct(
        protected JadwalPelajaranService $service
    ) {}

    /**
     * GET /jadwal-pelajaran — filter by hari/kelas_id/guru_id
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Guru hanya melihat jadwal sendiri
        if ($user->isGuru()) {
            $guru = $user->guru;
            if (!$guru) {
                return $this->successResponse([], 'Tidak ada data guru terkait.');
            }
            $data = $this->service->getForGuru($guru->id);
        }
        // Siswa hanya melihat jadwal kelasnya
        elseif ($user->isSiswa() && $user->siswa) {
            $data = $this->service->getForKelas($user->siswa->kelas_id);
        }
        // Admin melihat semua (dengan filter opsional)
        else {
            $data = $this->service->getAll($request->only(['hari', 'kelas_id', 'guru_id']));
        }

        return $this->successResponse(
            JadwalPelajaranResource::collection($data),
            'Data jadwal pelajaran berhasil diambil.'
        );
    }

    /**
     * GET /jadwal-pelajaran/timetable — data grid untuk frontend
     */
    public function timetable(Request $request): JsonResponse
    {
        $user = $request->user();
        $jamPelajaran = \App\Models\JamPelajaran::orderBy('urutan')->get();
        $kelas = \App\Models\Kelas::orderBy('tingkat')->orderBy('nama_kelas')->get();

        if ($user->isGuru()) {
            $guru = $user->guru;
            $jadwalData = $this->service->getForGuru($guru?->id ?? 0);
        } elseif ($user->isSiswa() && $user->siswa) {
            $jadwalData = $this->service->getForKelas($user->siswa->kelas_id);
        } else {
            $jadwalData = $this->service->getAll();
        }

        // Bangun sparse matrix
        $grid = [];
        foreach ($jadwalData as $j) {
            $grid[$j->hari][$j->kelas_id][$j->jam_pelajaran_id] = [
                'guru' => [
                    'id'   => $j->guru->id,
                    'nama' => $j->guru->nama,
                    'nip'  => $j->guru->nip,
                ],
                'mata_pelajaran' => [
                    'id'   => $j->mataPelajaran->id,
                    'kode' => $j->mataPelajaran->kode,
                    'nama' => $j->mataPelajaran->nama,
                ],
            ];
        }

        return $this->successResponse([
            'hari'         => ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
            'kelas'        => $kelas->map(fn ($k) => ['id' => $k->id, 'nama_kelas' => $k->nama_kelas, 'tingkat' => $k->tingkat]),
            'jam_pelajaran' => \App\Http\Resources\JamPelajaranResource::collection($jamPelajaran),
            'jadwal'       => $grid,
        ], 'Data timetable berhasil diambil.');
    }

    public function store(StoreJadwalPelajaranRequest $request): JsonResponse
    {
        try {
            $jadwal = $this->service->create($request->validated());
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        }

        return $this->successResponse(
            new JadwalPelajaranResource($jadwal->load(['kelas', 'guru.user', 'mataPelajaran', 'jamPelajaran'])),
            'Jadwal pelajaran berhasil dibuat.',
            201
        );
    }

    public function show(string $id): JsonResponse
    {
        $jadwal = $this->service->getById((int) $id);
        if (!$jadwal) {
            return $this->errorResponse('Jadwal pelajaran tidak ditemukan.', 404);
        }
        return $this->successResponse(new JadwalPelajaranResource($jadwal), 'Detail jadwal berhasil diambil.');
    }

    public function update(UpdateJadwalPelajaranRequest $request, string $id): JsonResponse
    {
        $jadwal = $this->service->getById((int) $id);
        if (!$jadwal) {
            return $this->errorResponse('Jadwal pelajaran tidak ditemukan.', 404);
        }

        try {
            $updated = $this->service->update($jadwal, $request->validated());
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        }

        return $this->successResponse(
            new JadwalPelajaranResource($updated),
            'Jadwal pelajaran berhasil diperbarui.'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $jadwal = $this->service->getById((int) $id);
        if (!$jadwal) {
            return $this->errorResponse('Jadwal pelajaran tidak ditemukan.', 404);
        }

        $this->service->delete($jadwal);

        return $this->successResponse(null, 'Jadwal pelajaran berhasil dihapus.');
    }
}
