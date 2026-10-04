<?php

namespace Tests\Feature;

use App\Models\Absensi;
use App\Models\Guru;
use App\Models\Kelas;
use App\Models\PengajuanIzin;
use App\Models\Siswa;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PengajuanIzinTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    // ===================================================================
    // Helpers
    // ===================================================================

    private function makeUser(array $attrs = []): User
    {
        return User::create(array_merge([
            'nama'     => 'Test User',
            'email'    => 'test_' . uniqid() . '@mail.com',
            'password' => bcrypt('password'),
            'role'     => 'Siswa',
            'status'   => 'Aktif',
        ], $attrs));
    }

    private function makeSiswa(int $kelasId, array $attrs = []): User
    {
        $user = $this->makeUser(array_merge(['role' => 'Siswa'], $attrs));

        Siswa::create([
            'user_id'        => $user->id,
            'kelas_id'       => $kelasId,
            'nisn'           => 'N' . substr(uniqid(), -9),
            'jenis_kelamin'  => 'Laki-laki',
            'tanggal_lahir'  => '2008-01-01',
            'alamat'         => 'Alamat test',
            'nomor_telepon'  => '08123456789',
        ]);

        return $user->load('siswa');
    }

    private function makeAdmin(): User
    {
        return $this->makeUser(['role' => 'Admin']);
    }

    private function makeGuru(array $kelasIds = []): User
    {
        $user = $this->makeUser(['role' => 'Guru']);

        $guru = Guru::create([
            'user_id' => $user->id,
            'nama'    => 'Guru Test',
            'status'  => 'Aktif',
            'email'   => $user->email,
        ]);

        if ($kelasIds) {
            $guru->kelas()->attach($kelasIds);
        }

        return $user->load('guru.kelas');
    }

    private function fakeBukti(string $ext = 'jpg', int $sizeKb = 100, string $mime = null): UploadedFile
    {
        return UploadedFile::fake()->create("bukti.{$ext}", $sizeKb, $mime);
    }

    private function submitPengajuan(User $user, array $overrides = []): \Illuminate\Testing\TestResponse
    {
        $data = array_merge([
            'tanggal_mulai'  => '2026-09-01',
            'tanggal_selesai' => '2026-09-03',
            'jenis'          => 'izin',
            'alasan'         => 'Acara keluarga',
            'bukti'          => $this->fakeBukti(),
        ], $overrides);

        return $this->actingAs($user, 'sanctum')
            ->postJson('/api/pengajuan-izin', $data);
    }

    // ===================================================================
    // 1-3. Siswa mengajukan izin / sakit / dispensasi -> berhasil
    // ===================================================================

    public function test_siswa_dapat_mengajukan_izin(): void
    {
        $kelas = Kelas::factory()->create();
        $siswa = $this->makeSiswa($kelas->id);

        $response = $this->submitPengajuan($siswa, ['jenis' => 'izin']);

        $response->assertCreated()->assertJsonPath('data.status', 'pending');
        $this->assertDatabaseHas('pengajuan_izin', [
            'siswa_id' => $siswa->siswa->id,
            'jenis'    => 'izin',
            'status'   => 'pending',
        ]);
        // Siswa tidak bisa menentukan status sendiri
        $this->assertNotEquals('approved', PengajuanIzin::first()->status);
    }

    public function test_siswa_dapat_mengajukan_sakit(): void
    {
        $kelas = Kelas::factory()->create();
        $siswa = $this->makeSiswa($kelas->id);

        $this->submitPengajuan($siswa, ['jenis' => 'sakit'])
            ->assertCreated()->assertJsonPath('data.jenis', 'sakit');
    }

    public function test_siswa_dapat_mengajukan_dispensasi(): void
    {
        $kelas = Kelas::factory()->create();
        $siswa = $this->makeSiswa($kelas->id);

        $this->submitPengajuan($siswa, ['jenis' => 'dispensasi'])
            ->assertCreated()->assertJsonPath('data.jenis', 'dispensasi');
    }

    // ===================================================================
    // 4. Tanpa login -> 401
    // ===================================================================

    public function test_tanpa_login_ditolak_401(): void
    {
        $this->postJson('/api/pengajuan-izin', [
            'tanggal_mulai'   => '2026-09-01',
            'tanggal_selesai' => '2026-09-03',
            'jenis'           => 'izin',
            'alasan'          => 'x',
            'bukti'           => $this->fakeBukti(),
        ])->assertStatus(401);
    }

    // ===================================================================
    // 5. Siswa melihat pengajuan miliknya -> berhasil
    // ===================================================================

    public function test_siswa_melihat_pengajuan_miliknya(): void
    {
        $kelas = Kelas::factory()->create();
        $siswa = $this->makeSiswa($kelas->id);
        $this->submitPengajuan($siswa);

        $this->actingAs($siswa, 'sanctum')
            ->getJson('/api/pengajuan-izin')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    // ===================================================================
    // 6. Siswa mencoba melihat pengajuan siswa lain -> 403
    // ===================================================================

    public function test_siswa_tidak_bisa_lihat_pengajuan_orang_lain(): void
    {
        $kelas = Kelas::factory()->create();
        $siswaA = $this->makeSiswa($kelas->id);
        $siswaB = $this->makeSiswa($kelas->id);
        $pengajuan = PengajuanIzin::create([
            'siswa_id'        => $siswaB->siswa->id,
            'tanggal_mulai'   => '2026-09-01',
            'tanggal_selesai' => '2026-09-02',
            'jenis'           => 'izin',
            'alasan'          => 'x',
            'status'          => 'pending',
        ]);

        $this->actingAs($siswaA, 'sanctum')
            ->getJson("/api/pengajuan-izin/{$pengajuan->id}")
            ->assertStatus(403);
    }

    // ===================================================================
    // 7. Siswa mencoba approve -> 403
    // ===================================================================

    public function test_siswa_tidak_bisa_approve(): void
    {
        $kelas = Kelas::factory()->create();
        $siswa = $this->makeSiswa($kelas->id);
        $pengajuan = PengajuanIzin::create([
            'siswa_id'        => $siswa->siswa->id,
            'tanggal_mulai'   => '2026-09-01',
            'tanggal_selesai' => '2026-09-02',
            'jenis'           => 'izin',
            'alasan'          => 'x',
            'status'          => 'pending',
        ]);

        $this->actingAs($siswa, 'sanctum')
            ->patchJson("/api/pengajuan-izin/{$pengajuan->id}/approve")
            ->assertStatus(403);

        $this->assertEquals('pending', $pengajuan->fresh()->status);
    }

    // ===================================================================
    // 8. Admin approve -> berhasil + absensi dibuat
    // ===================================================================

    public function test_admin_approve_berhasil_dan_membuat_absensi(): void
    {
        $kelas = Kelas::factory()->create();
        $siswa = $this->makeSiswa($kelas->id);
        $admin = $this->makeAdmin();

        $pengajuan = PengajuanIzin::create([
            'siswa_id'        => $siswa->siswa->id,
            'tanggal_mulai'   => '2026-09-01',
            'tanggal_selesai' => '2026-09-03',
            'jenis'           => 'izin',
            'alasan'          => 'Acara keluarga',
            'status'          => 'pending',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/pengajuan-izin/{$pengajuan->id}/approve", ['catatan' => 'Disetujui'])
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $pengajuan->refresh();
        $this->assertEquals('approved', $pengajuan->status);
        $this->assertEquals($admin->id, $pengajuan->verified_by);
        $this->assertNotNull($pengajuan->verified_at);

        // 3 hari -> 3 absensi izin
        foreach (['2026-09-01', '2026-09-02', '2026-09-03'] as $tgl) {
            $this->assertDatabaseHas('absensis', [
                'siswa_id' => $siswa->siswa->id,
                'tanggal'  => $tgl,
                'status'   => 'izin',
                'metode'   => 'manual',
            ]);
        }
        $this->assertCount(3, Absensi::where('siswa_id', $siswa->siswa->id)->get());
    }

    // ===================================================================
    // 9. Admin reject -> berhasil, absensi tidak berubah
    // ===================================================================

    public function test_admin_reject_tidak_mengubah_absensi(): void
    {
        $kelas = Kelas::factory()->create();
        $siswa = $this->makeSiswa($kelas->id);
        $admin = $this->makeAdmin();

        $pengajuan = PengajuanIzin::create([
            'siswa_id'        => $siswa->siswa->id,
            'tanggal_mulai'   => '2026-09-01',
            'tanggal_selesai' => '2026-09-02',
            'jenis'           => 'sakit',
            'alasan'          => 'Sakit',
            'status'          => 'pending',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/pengajuan-izin/{$pengajuan->id}/reject", ['catatan' => 'Tidak lengkap'])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');

        $this->assertDatabaseCount('absensis', 0);
    }

    // ===================================================================
    // 10. Guru tanpa permission (bukan wali kelas) approve -> 403
    // ===================================================================

    public function test_guru_tanpa_permission_approve_ditolak_403(): void
    {
        $kelasSiswa = Kelas::factory()->create();
        $kelasLain  = Kelas::factory()->create();
        $siswa = $this->makeSiswa($kelasSiswa->id);
        $guru  = $this->makeGuru([$kelasLain->id]); // guru kelas lain

        $pengajuan = PengajuanIzin::create([
            'siswa_id'        => $siswa->siswa->id,
            'tanggal_mulai'   => '2026-09-01',
            'tanggal_selesai' => '2026-09-02',
            'jenis'           => 'izin',
            'alasan'          => 'x',
            'status'          => 'pending',
        ]);

        $this->actingAs($guru, 'sanctum')
            ->patchJson("/api/pengajuan-izin/{$pengajuan->id}/approve")
            ->assertStatus(403);

        $this->assertEquals('pending', $pengajuan->fresh()->status);
    }

    public function test_guru_dengan_permission_approve_berhasil(): void
    {
        $kelas = Kelas::factory()->create();
        $siswa = $this->makeSiswa($kelas->id);
        $guru  = $this->makeGuru([$kelas->id]); // wali kelas

        $pengajuan = PengajuanIzin::create([
            'siswa_id'        => $siswa->siswa->id,
            'tanggal_mulai'   => '2026-09-01',
            'tanggal_selesai' => '2026-09-01',
            'jenis'           => 'sakit',
            'alasan'          => 'Sakit',
            'status'          => 'pending',
        ]);

        $this->actingAs($guru, 'sanctum')
            ->patchJson("/api/pengajuan-izin/{$pengajuan->id}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('absensis', [
            'siswa_id' => $siswa->siswa->id,
            'tanggal'  => '2026-09-01',
            'status'   => 'sakit',
        ]);
    }

    // ===================================================================
    // 11. Approved -> absensi dibuat/diubah (termasuk yang sudah ada)
    // ===================================================================

    public function test_approve_memperbarui_absensi_yang_sudah_ada(): void
    {
        $kelas = Kelas::factory()->create();
        $siswa = $this->makeSiswa($kelas->id);
        $admin = $this->makeAdmin();

        // Sudah ada absensi 'hadir' di salah satu tanggal periode
        Absensi::create([
            'siswa_id' => $siswa->siswa->id,
            'tanggal'  => '2026-09-02',
            'status'   => 'hadir',
            'metode'   => 'face_recognition',
        ]);

        $pengajuan = PengajuanIzin::create([
            'siswa_id'        => $siswa->siswa->id,
            'tanggal_mulai'   => '2026-09-01',
            'tanggal_selesai' => '2026-09-03',
            'jenis'           => 'izin',
            'alasan'          => 'x',
            'status'          => 'pending',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/pengajuan-izin/{$pengajuan->id}/approve")
            ->assertOk();

        // Yang tadinya 'hadir' menjadi 'izin' (diperbarui, tidak diduplikasi)
        $this->assertDatabaseHas('absensis', [
            'siswa_id' => $siswa->siswa->id,
            'tanggal'  => '2026-09-02',
            'status'   => 'izin',
        ]);
        $this->assertCount(3, Absensi::where('siswa_id', $siswa->siswa->id)->get());
    }

    public function test_dispensasi_dipetakan_ke_status_izin_di_absensi(): void
    {
        $kelas = Kelas::factory()->create();
        $siswa = $this->makeSiswa($kelas->id);
        $admin = $this->makeAdmin();

        $pengajuan = PengajuanIzin::create([
            'siswa_id'        => $siswa->siswa->id,
            'tanggal_mulai'   => '2026-10-05',
            'tanggal_selesai' => '2026-10-05',
            'jenis'           => 'dispensasi',
            'alasan'          => 'x',
            'status'          => 'pending',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/pengajuan-izin/{$pengajuan->id}/approve")
            ->assertOk();

        $this->assertDatabaseHas('absensis', [
            'siswa_id' => $siswa->siswa->id,
            'tanggal'  => '2026-10-05',
            'status'   => 'izin',
        ]);
    }

    // ===================================================================
    // 12. Rejected -> absensi tidak berubah (sudah tercakup test 9)
    // ===================================================================

    // ===================================================================
    // 13. tanggal_selesai < tanggal_mulai -> validation error
    // ===================================================================

    public function test_tanggal_selesai_sebelum_mulai_ditolak(): void
    {
        $kelas = Kelas::factory()->create();
        $siswa = $this->makeSiswa($kelas->id);

        $this->submitPengajuan($siswa, [
            'tanggal_mulai'   => '2026-09-05',
            'tanggal_selesai' => '2026-09-01',
        ])->assertStatus(422);
    }

    // ===================================================================
    // 14. File tidak sesuai format -> validation error
    // ===================================================================

    public function test_bukti_format_salah_ditolak(): void
    {
        $kelas = Kelas::factory()->create();
        $siswa = $this->makeSiswa($kelas->id);

        $this->submitPengajuan($siswa, [
            'bukti' => UploadedFile::fake()->create('bukti.txt', 50, 'text/plain'),
        ])->assertStatus(422);
    }

    // ===================================================================
    // 15. File > 2MB -> validation error
    // ===================================================================

    public function test_bukti_lebih_2mb_ditolak(): void
    {
        $kelas = Kelas::factory()->create();
        $siswa = $this->makeSiswa($kelas->id);

        $this->submitPengajuan($siswa, [
            'bukti' => UploadedFile::fake()->create('besar.pdf', 3000, 'application/pdf'),
        ])->assertStatus(422);
    }

    // ===================================================================
    // 16. Pengajuan overlap -> ditolak
    // ===================================================================

    public function test_pengajuan_overlap_ditolak(): void
    {
        $kelas = Kelas::factory()->create();
        $siswa = $this->makeSiswa($kelas->id);

        $this->submitPengajuan($siswa, [
            'tanggal_mulai'   => '2026-09-01',
            'tanggal_selesai' => '2026-09-03',
        ])->assertCreated();

        // Overlap: 2026-09-02 s.d. 2026-09-04
        $this->submitPengajuan($siswa, [
            'tanggal_mulai'   => '2026-09-02',
            'tanggal_selesai' => '2026-09-04',
        ])->assertStatus(422);
    }

    // ===================================================================
    // 17. Approval dua kali -> ditolak (idempoten)
    // ===================================================================

    public function test_approve_dua_kali_ditolak(): void
    {
        $kelas = Kelas::factory()->create();
        $siswa = $this->makeSiswa($kelas->id);
        $admin = $this->makeAdmin();

        $pengajuan = PengajuanIzin::create([
            'siswa_id'        => $siswa->siswa->id,
            'tanggal_mulai'   => '2026-11-01',
            'tanggal_selesai' => '2026-11-01',
            'jenis'           => 'izin',
            'alasan'          => 'x',
            'status'          => 'pending',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/pengajuan-izin/{$pengajuan->id}/approve")
            ->assertOk();

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/pengajuan-izin/{$pengajuan->id}/approve")
            ->assertStatus(422);
    }

    // ===================================================================
    // 18. Dua approval bersamaan -> data tetap konsisten (tidak duplikat)
    // ===================================================================

    public function test_approval_berulang_tidak_membuat_duplikat_absensi(): void
    {
        $kelas = Kelas::factory()->create();
        $siswa = $this->makeSiswa($kelas->id);
        $admin = $this->makeAdmin();

        $pengajuan = PengajuanIzin::create([
            'siswa_id'        => $siswa->siswa->id,
            'tanggal_mulai'   => '2026-12-01',
            'tanggal_selesai' => '2026-12-02',
            'jenis'           => 'izin',
            'alasan'          => 'x',
            'status'          => 'pending',
        ]);

        // Simulasi pemanggilan berulang (mis. klik ganda / request bersamaan)
        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/pengajuan-izin/{$pengajuan->id}/approve")
            ->assertOk();
        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/pengajuan-izin/{$pengajuan->id}/approve")
            ->assertStatus(422);

        // Pasti hanya 1 absensi per tanggal (unique constraint siswa_id+tanggal)
        $this->assertCount(1, Absensi::where('siswa_id', $siswa->siswa->id)
            ->where('tanggal', '2026-12-01')->get());
        $this->assertCount(1, Absensi::where('siswa_id', $siswa->siswa->id)
            ->where('tanggal', '2026-12-02')->get());
    }
}
