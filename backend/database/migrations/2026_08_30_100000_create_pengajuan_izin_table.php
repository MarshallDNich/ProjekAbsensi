<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Buat tabel pengajuan_izin untuk fitur pengajuan surat izin siswa.
     *
     * Tabel ini tidak mengubah struktur absensi yang sudah ada; integrasi
     * ke absensi dilakukan lewat service saat sebuah pengajuan disetujui.
     */
    public function up(): void
    {
        Schema::create('pengajuan_izin', function (Blueprint $table) {
            $table->id();

            $table->foreignId('siswa_id')
                ->constrained('siswas')
                ->cascadeOnDelete();

            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');

            $table->enum('jenis', ['izin', 'sakit', 'dispensasi']);
            $table->text('alasan');

            // Path file bukti di storage disk public (storage/app/public/...).
            $table->string('bukti')->nullable();

            $table->enum('status', ['pending', 'approved', 'rejected'])
                ->default('pending');

            $table->text('catatan_verifikator')->nullable();

            $table->foreignId('verified_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('verified_at')->nullable();

            $table->timestamps();

            // Index untuk query overlap & daftar verifikasi.
            $table->index(['siswa_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengajuan_izin');
    }
};
