<?php

namespace Tests\Feature;

use App\Models\Guru;
use App\Models\JadwalPelajaran;
use App\Models\JamPelajaran;
use App\Models\Kelas;
use App\Models\MataPelajaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class JadwalPelajaranTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    // === Helpers ===

    private function makeUser(array $attrs = []): User
    {
        return User::create(array_merge([
            'nama'     => 'Test User',
            'email'    => 'test_' . uniqid() . '@mail.com',
            'password' => bcrypt('password'),
            'role'     => 'Admin',
            'status'   => 'Aktif',
        ], $attrs));
    }

    private function makeKelas(): Kelas
    {
        return Kelas::create([
            'nama_kelas' => 'VII A',
            'tingkat'    => 'X',
            'jurusan'    => 'RPL',
        ]);
    }

    private function makeGuru(array $mapelNames = ['Matematika']): User
    {
        $user = $this->makeUser(['role' => 'Guru', 'email' => 'guru_' . uniqid() . '@mail.com']);
        Guru::create([
            'user_id'         => $user->id,
            'nama'            => 'Guru Test',
            'status'          => 'Aktif',
            'email'           => $user->email,
            'mata_pelajaran'  => $mapelNames,
        ]);
        return $user->load('guru');
    }

    private function makeMapel(string $kode = 'MTK', string $nama = 'Matematika'): MataPelajaran
    {
        return MataPelajaran::create([
            'kode'   => $kode,
            'nama'   => $nama,
            'status' => 'Aktif',
        ]);
    }

    private function makeJam(int $urutan = 1, string $mulai = '07:00', string $selesai = '07:40', string $tipe = 'lesson'): JamPelajaran
    {
        return JamPelajaran::create([
            'nama'       => "Jam {$urutan}",
            'jam_mulai'  => $mulai,
            'jam_selesai' => $selesai,
            'urutan'     => $urutan,
            'tipe'       => $tipe,
        ]);
    }

    // === 1. Admin membuat jadwal → berhasil ===

    public function test_admin_buat_jadwal_berhasil(): void
    {
        $admin = $this->makeUser(['role' => 'Admin']);
        Sanctum::actingAs($admin);
        $kelas = $this->makeKelas();
        $guruUser = $this->makeGuru();
        $mapel = $this->makeMapel();
        $jam = $this->makeJam();

        $this->postJson('/api/jadwal-pelajaran', [
            'hari'              => 'Senin',
            'jam_pelajaran_id'  => $jam->id,
            'kelas_id'          => $kelas->id,
            'guru_id'           => $guruUser->guru->id,
            'mata_pelajaran_id' => $mapel->id,
        ])->assertCreated()
          ->assertJsonPath('data.hari', 'Senin')
          ->assertJsonPath('data.kelas.nama_kelas', 'VII A')
          ->assertJsonPath('data.guru.nama', 'Guru Test')
          ->assertJsonPath('data.mata_pelajaran.kode', 'MTK');

        $this->assertDatabaseHas('jadwal_pelajaran', [
            'hari' => 'Senin',
            'kelas_id' => $kelas->id,
        ]);
    }

    // === 2. Admin mengedit jadwal → berhasil ===

    public function test_admin_edit_jadwal_berhasil(): void
    {
        $admin = $this->makeUser(['role' => 'Admin']);
        Sanctum::actingAs($admin);
        $kelas = $this->makeKelas();
        $guruUser = $this->makeGuru();
        $mapel = $this->makeMapel();
        $jam = $this->makeJam();
        $jadwal = JadwalPelajaran::create([
            'hari' => 'Senin', 'jam_pelajaran_id' => $jam->id,
            'kelas_id' => $kelas->id, 'guru_id' => $guruUser->guru->id,
            'mata_pelajaran_id' => $mapel->id,
        ]);

        $guruUser2 = $this->makeGuru(['Fisika']);
        $mapel2 = $this->makeMapel('FIS', 'Fisika');

        $this->putJson("/api/jadwal-pelajaran/{$jadwal->id}", [
            'guru_id' => $guruUser2->guru->id,
            'mata_pelajaran_id' => $mapel2->id,
        ])->assertOk();

        $jadwal->refresh();
        $this->assertEquals($guruUser2->guru->id, $jadwal->guru_id);
    }

    // === 3. Admin menghapus jadwal → berhasil ===

    public function test_admin_hapus_jadwal_berhasil(): void
    {
        $admin = $this->makeUser(['role' => 'Admin']);
        Sanctum::actingAs($admin);
        $kelas = $this->makeKelas();
        $guruUser = $this->makeGuru();
        $mapel = $this->makeMapel();
        $jam = $this->makeJam();
        $jadwal = JadwalPelajaran::create([
            'hari' => 'Senin', 'jam_pelajaran_id' => $jam->id,
            'kelas_id' => $kelas->id, 'guru_id' => $guruUser->guru->id,
            'mata_pelajaran_id' => $mapel->id,
        ]);

        $this->deleteJson("/api/jadwal-pelajaran/{$jadwal->id}")->assertOk();
        $this->assertDatabaseMissing('jadwal_pelajaran', ['id' => $jadwal->id]);
    }

    // === 4. Guru melihat jadwalnya → berhasil ===

    public function test_guru_lihat_jadwalnya_berhasil(): void
    {
        $guruUser = $this->makeGuru();
        Sanctum::actingAs($guruUser);
        $kelas = $this->makeKelas();
        $mapel = $this->makeMapel();
        $jam = $this->makeJam();
        JadwalPelajaran::create([
            'hari' => 'Senin', 'jam_pelajaran_id' => $jam->id,
            'kelas_id' => $kelas->id, 'guru_id' => $guruUser->guru->id,
            'mata_pelajaran_id' => $mapel->id,
        ]);

        $this->getJson('/api/jadwal-pelajaran')->assertOk()->assertJsonCount(1, 'data');
    }

    // === 5. Siswa melihat jadwal kelasnya → berhasil ===

    public function test_siswa_lihat_jadwal_kelasnya_berhasil(): void
    {
        $admin = $this->makeUser(['role' => 'Admin']);
        $guruUser = $this->makeGuru();
        $siswaUser = $this->makeUser(['role' => 'Siswa', 'email' => 'siswa_' . uniqid() . '@mail.com']);
        $kelas = $this->makeKelas();
        $siswaUser->siswa()->create([
            'user_id' => $siswaUser->id,
            'kelas_id' => $kelas->id,
            'nisn' => '12345',
            'jenis_kelamin' => 'Laki-laki',
            'tanggal_lahir' => '2008-01-01',
            'alamat' => 'x',
            'nomor_telepon' => '0812',
        ]);

        $mapel = $this->makeMapel();
        $jam = $this->makeJam();
        Sanctum::actingAs($admin);
        JadwalPelajaran::create([
            'hari' => 'Senin', 'jam_pelajaran_id' => $jam->id,
            'kelas_id' => $kelas->id, 'guru_id' => $guruUser->guru->id,
            'mata_pelajaran_id' => $mapel->id,
        ]);

        Sanctum::actingAs($siswaUser);
        $this->getJson('/api/jadwal-pelajaran')->assertOk()->assertJsonCount(1, 'data');
    }

    // === 6. Guru mencoba membuat jadwal → 403 ===

    public function test_guru_buat_jadwal_ditolak_403(): void
    {
        $guruUser = $this->makeGuru();
        Sanctum::actingAs($guruUser);

        $this->postJson('/api/jadwal-pelajaran', [
            'hari' => 'Senin',
            'jam_pelajaran_id' => 1,
            'kelas_id' => 1,
            'guru_id' => 1,
            'mata_pelajaran_id' => 1,
        ])->assertStatus(403);
    }

    // === 7. Siswa mencoba membuat jadwal → 403 ===

    public function test_siswa_buat_jadwal_ditolak_403(): void
    {
        $siswa = $this->makeUser(['role' => 'Siswa']);
        Sanctum::actingAs($siswa);

        $this->postJson('/api/jadwal-pelajaran', [
            'hari' => 'Senin',
            'jam_pelajaran_id' => 1,
            'kelas_id' => 1,
            'guru_id' => 1,
            'mata_pelajaran_id' => 1,
        ])->assertStatus(403);
    }

    // === 8. Kelas bentrok → ditolak ===

    public function test_kelas_bentrok_ditolak(): void
    {
        $admin = $this->makeUser(['role' => 'Admin']);
        Sanctum::actingAs($admin);
        $kelas = $this->makeKelas();
        $guruUser = $this->makeGuru();
        $guruUser2 = $this->makeGuru(['Fisika']);
        $mapel = $this->makeMapel();
        $mapel2 = $this->makeMapel('FIS', 'Fisika');
        $jam = $this->makeJam();

        JadwalPelajaran::create([
            'hari' => 'Senin', 'jam_pelajaran_id' => $jam->id,
            'kelas_id' => $kelas->id, 'guru_id' => $guruUser->guru->id,
            'mata_pelajaran_id' => $mapel->id,
        ]);

        $this->postJson('/api/jadwal-pelajaran', [
            'hari' => 'Senin', 'jam_pelajaran_id' => $jam->id,
            'kelas_id' => $kelas->id, 'guru_id' => $guruUser2->guru->id,
            'mata_pelajaran_id' => $mapel2->id,
        ])->assertStatus(422)->assertJsonValidationErrors('kelas_id');
    }

    // === 9. Guru bentrok → ditolak ===

    public function test_guru_bentrok_ditolak(): void
    {
        $admin = $this->makeUser(['role' => 'Admin']);
        Sanctum::actingAs($admin);
        $kelasA = $this->makeKelas();
        $kelasB = Kelas::create(['nama_kelas' => 'VII B', 'tingkat' => 'X', 'jurusan' => 'RPL']);
        $guruUser = $this->makeGuru();
        $mapel = $this->makeMapel();
        $jam = $this->makeJam();

        JadwalPelajaran::create([
            'hari' => 'Senin', 'jam_pelajaran_id' => $jam->id,
            'kelas_id' => $kelasA->id, 'guru_id' => $guruUser->guru->id,
            'mata_pelajaran_id' => $mapel->id,
        ]);

        $this->postJson('/api/jadwal-pelajaran', [
            'hari' => 'Senin', 'jam_pelajaran_id' => $jam->id,
            'kelas_id' => $kelasB->id, 'guru_id' => $guruUser->guru->id,
            'mata_pelajaran_id' => $mapel->id,
        ])->assertStatus(422)->assertJsonValidationErrors('guru_id');
    }

    // === 10. Jadwal pada jam istirahat → ditolak ===

    public function test_jadwal_jam_istirahat_ditolak(): void
    {
        $admin = $this->makeUser(['role' => 'Admin']);
        Sanctum::actingAs($admin);
        $kelas = $this->makeKelas();
        $guruUser = $this->makeGuru();
        $mapel = $this->makeMapel();
        $break = $this->makeJam(5, '10:00', '10:20', 'break');

        $this->postJson('/api/jadwal-pelajaran', [
            'hari' => 'Senin', 'jam_pelajaran_id' => $break->id,
            'kelas_id' => $kelas->id, 'guru_id' => $guruUser->guru->id,
            'mata_pelajaran_id' => $mapel->id,
        ])->assertStatus(422)->assertJsonValidationErrors('jam_pelajaran_id');
    }

    // === 12. Guru tidak mengampu mapel → ditolak ===

    public function test_guru_tidak_ampu_mapel_ditolak(): void
    {
        $admin = $this->makeUser(['role' => 'Admin']);
        Sanctum::actingAs($admin);
        $kelas = $this->makeKelas();
        $guruUser = $this->makeGuru(['Matematika']); // hanya Matematika
        $mapel = $this->makeMapel('BIO', 'Biologi'); // Biologi bukan Matematika
        $jam = $this->makeJam();

        $this->postJson('/api/jadwal-pelajaran', [
            'hari' => 'Senin', 'jam_pelajaran_id' => $jam->id,
            'kelas_id' => $kelas->id, 'guru_id' => $guruUser->guru->id,
            'mata_pelajaran_id' => $mapel->id,
        ])->assertStatus(422)->assertJsonValidationErrors('mata_pelajaran_id');
    }

    // === 13-15. ID tidak valid → validation error ===

    public function test_kelas_id_tidak_valid(): void
    {
        $admin = $this->makeUser(['role' => 'Admin']);
        Sanctum::actingAs($admin);
        $guruUser = $this->makeGuru();
        $mapel = $this->makeMapel();
        $jam = $this->makeJam();

        $this->postJson('/api/jadwal-pelajaran', [
            'hari' => 'Senin', 'jam_pelajaran_id' => $jam->id,
            'kelas_id' => 9999, 'guru_id' => $guruUser->guru->id,
            'mata_pelajaran_id' => $mapel->id,
        ])->assertStatus(422)->assertJsonValidationErrors('kelas_id');
    }

    public function test_guru_id_tidak_valid(): void
    {
        $admin = $this->makeUser(['role' => 'Admin']);
        Sanctum::actingAs($admin);
        $kelas = $this->makeKelas();
        $mapel = $this->makeMapel();
        $jam = $this->makeJam();

        $this->postJson('/api/jadwal-pelajaran', [
            'hari' => 'Senin', 'jam_pelajaran_id' => $jam->id,
            'kelas_id' => $kelas->id, 'guru_id' => 9999,
            'mata_pelajaran_id' => $mapel->id,
        ])->assertStatus(422)->assertJsonValidationErrors('guru_id');
    }

    public function test_mapel_id_tidak_valid(): void
    {
        $admin = $this->makeUser(['role' => 'Admin']);
        Sanctum::actingAs($admin);
        $kelas = $this->makeKelas();
        $guruUser = $this->makeGuru();
        $jam = $this->makeJam();

        $this->postJson('/api/jadwal-pelajaran', [
            'hari' => 'Senin', 'jam_pelajaran_id' => $jam->id,
            'kelas_id' => $kelas->id, 'guru_id' => $guruUser->guru->id,
            'mata_pelajaran_id' => 9999,
        ])->assertStatus(422)->assertJsonValidationErrors('mata_pelajaran_id');
    }

    // === 16. Update tidak menyebabkan conflict → berhasil ===

    public function test_update_tanpa_conflict_berhasil(): void
    {
        $admin = $this->makeUser(['role' => 'Admin']);
        Sanctum::actingAs($admin);
        $kelas = $this->makeKelas();
        $guruUser = $this->makeGuru();
        $mapel = $this->makeMapel();
        $jam1 = $this->makeJam(1, '07:00', '07:40');
        $jam2 = $this->makeJam(2, '07:40', '08:20');

        $jadwal = JadwalPelajaran::create([
            'hari' => 'Senin', 'jam_pelajaran_id' => $jam1->id,
            'kelas_id' => $kelas->id, 'guru_id' => $guruUser->guru->id,
            'mata_pelajaran_id' => $mapel->id,
        ]);

        $this->putJson("/api/jadwal-pelajaran/{$jadwal->id}", [
            'jam_pelajaran_id' => $jam2->id,
        ])->assertOk();
    }

    // === 17. Update menyebabkan conflict → ditolak ===

    public function test_update_conflict_ditolak(): void
    {
        $admin = $this->makeUser(['role' => 'Admin']);
        Sanctum::actingAs($admin);
        $kelas = $this->makeKelas();
        $guruUser = $this->makeGuru();
        $guruUser2 = $this->makeGuru(['Fisika']);
        $mapel = $this->makeMapel();
        $mapel2 = $this->makeMapel('FIS', 'Fisika');
        $jam = $this->makeJam();

        JadwalPelajaran::create([
            'hari' => 'Senin', 'jam_pelajaran_id' => $jam->id,
            'kelas_id' => $kelas->id, 'guru_id' => $guruUser->guru->id,
            'mata_pelajaran_id' => $mapel->id,
        ]);

        $jadwal2 = JadwalPelajaran::create([
            'hari' => 'Selasa', 'jam_pelajaran_id' => $jam->id,
            'kelas_id' => $kelas->id, 'guru_id' => $guruUser2->guru->id,
            'mata_pelajaran_id' => $mapel2->id,
        ]);

        $this->putJson("/api/jadwal-pelajaran/{$jadwal2->id}", [
            'hari' => 'Senin',
        ])->assertStatus(422)->assertJsonValidationErrors('kelas_id');
    }

    // === 18. Delete jadwal → berhasil ===

    public function test_hapus_jadwal_berhasil(): void
    {
        $admin = $this->makeUser(['role' => 'Admin']);
        Sanctum::actingAs($admin);
        $kelas = $this->makeKelas();
        $guruUser = $this->makeGuru();
        $mapel = $this->makeMapel();
        $jam = $this->makeJam();
        $jadwal = JadwalPelajaran::create([
            'hari' => 'Senin', 'jam_pelajaran_id' => $jam->id,
            'kelas_id' => $kelas->id, 'guru_id' => $guruUser->guru->id,
            'mata_pelajaran_id' => $mapel->id,
        ]);

        $this->deleteJson("/api/jadwal-pelajaran/{$jadwal->id}")->assertOk();
        $this->assertDatabaseMissing('jadwal_pelajaran', ['id' => $jadwal->id]);
    }

    // === 19-21. Filter berdasarkan hari/kelas/guru ===

    public function test_filter_berdasarkan_hari(): void
    {
        $admin = $this->makeUser(['role' => 'Admin']);
        Sanctum::actingAs($admin);
        $kelas = $this->makeKelas();
        $guruUser = $this->makeGuru();
        $mapel = $this->makeMapel();
        $jam = $this->makeJam();

        JadwalPelajaran::create([
            'hari' => 'Senin', 'jam_pelajaran_id' => $jam->id,
            'kelas_id' => $kelas->id, 'guru_id' => $guruUser->guru->id,
            'mata_pelajaran_id' => $mapel->id,
        ]);

        $this->getJson('/api/jadwal-pelajaran?hari=Senin')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/jadwal-pelajaran?hari=Selasa')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_filter_berdasarkan_kelas(): void
    {
        $admin = $this->makeUser(['role' => 'Admin']);
        Sanctum::actingAs($admin);
        $kelas = $this->makeKelas();
        $guruUser = $this->makeGuru();
        $mapel = $this->makeMapel();
        $jam = $this->makeJam();

        JadwalPelajaran::create([
            'hari' => 'Senin', 'jam_pelajaran_id' => $jam->id,
            'kelas_id' => $kelas->id, 'guru_id' => $guruUser->guru->id,
            'mata_pelajaran_id' => $mapel->id,
        ]);

        $this->getJson("/api/jadwal-pelajaran?kelas_id={$kelas->id}")->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/jadwal-pelajaran?kelas_id=9999')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_filter_berdasarkan_guru(): void
    {
        $admin = $this->makeUser(['role' => 'Admin']);
        Sanctum::actingAs($admin);
        $kelas = $this->makeKelas();
        $guruUser = $this->makeGuru();
        $mapel = $this->makeMapel();
        $jam = $this->makeJam();

        JadwalPelajaran::create([
            'hari' => 'Senin', 'jam_pelajaran_id' => $jam->id,
            'kelas_id' => $kelas->id, 'guru_id' => $guruUser->guru->id,
            'mata_pelajaran_id' => $mapel->id,
        ]);

        $this->getJson("/api/jadwal-pelajaran?guru_id={$guruUser->guru->id}")->assertOk()->assertJsonCount(1, 'data');
    }

    // === 22. Tanpa login → 401 ===

    public function test_tanpa_login_401(): void
    {
        $this->getJson('/api/jadwal-pelajaran')->assertStatus(401);
        $this->postJson('/api/jadwal-pelajaran', [])->assertStatus(401);
    }
}

