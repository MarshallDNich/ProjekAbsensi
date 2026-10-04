<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Perubahan:
     * 1. Tambah kolom foto (string, nullable) untuk menyimpan path foto absensi.
     * 2. Ubah enum status → ['Hadir','Terlambat','Izin','Sakit','Alpha'] default 'Hadir'.
     *    (Menambahkan nilai 'Terlambat' yang sebelumnya belum ada.)
     */
    public function up(): void
    {
        Schema::table('absensis', function (Blueprint $table) {
            // Tambah kolom foto path (relatif ke disk public)
            $table->string('foto')->nullable()->after('keterangan');
        });

        // Ubah enum via raw SQL karena Blueprint::enum() tidak support change() pada MySQL
        DB::statement(
            "ALTER TABLE absensis MODIFY COLUMN status
             ENUM('Hadir','Terlambat','Izin','Sakit','Alpha')
             NOT NULL DEFAULT 'Hadir'"
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Kembalikan enum tanpa 'Terlambat'
        DB::statement(
            "ALTER TABLE absensis MODIFY COLUMN status
             ENUM('Hadir','Izin','Sakit','Alpha')
             NOT NULL DEFAULT 'Hadir'"
        );

        Schema::table('absensis', function (Blueprint $table) {
            $table->dropColumn('foto');
        });
    }
};
