<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('absensis', function (Blueprint $table) {
            $table->id();

            // Relasi ke tabel siswas
            $table->foreignId('siswa_id')
                ->constrained('siswas')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // Tanggal absensi
            $table->date('tanggal');

            // Waktu Check In
            $table->time('jam_masuk')->nullable();

            // Waktu Check Out
            $table->time('jam_keluar')->nullable();

            // Status Kehadiran
            $table->enum('status', [
                'Hadir',
                'Izin',
                'Sakit',
                'Alpha'
            ])->default('Hadir');

            // Keterangan tambahan
            $table->text('keterangan')->nullable();

            $table->softDeletes();
            $table->timestamps();

            // Mencegah siswa melakukan absensi lebih dari sekali dalam satu hari
            $table->unique(['siswa_id', 'tanggal']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('absensis');
    }
};