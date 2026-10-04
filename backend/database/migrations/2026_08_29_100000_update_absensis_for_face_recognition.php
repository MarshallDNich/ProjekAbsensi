<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * - normalisasi status ke huruf kecil (hadir, terlambat, izin, sakit, alpa)
     * - tambah kolom metode & confidence_score
     */
    public function up(): void
    {
        // normalisasi status yang sudah ada (termasuk data test)
        DB::statement(
            "UPDATE absensis SET status = CASE status "
            . "WHEN 'Hadir' THEN 'hadir' "
            . "WHEN 'Terlambat' THEN 'terlambat' "
            . "WHEN 'Izin' THEN 'izin' "
            . "WHEN 'Sakit' THEN 'sakit' "
            . "WHEN 'Alpha' THEN 'alpa' "
            . "ELSE 'hadir' END"
        );

        DB::statement(
            "ALTER TABLE absensis MODIFY COLUMN status "
            . "ENUM('hadir','terlambat','izin','sakit','alpa') NOT NULL DEFAULT 'hadir'"
        );

        Schema::table('absensis', function (Blueprint $table) {
            $table->enum('metode', ['face_recognition', 'manual'])
                ->default('face_recognition')
                ->after('status');

            $table->decimal('confidence_score', 5, 4)
                ->nullable()
                ->after('foto');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('absensis', function (Blueprint $table) {
            $table->dropColumn(['metode', 'confidence_score']);
        });

        DB::statement(
            "ALTER TABLE absensis MODIFY COLUMN status "
            . "ENUM('Hadir','Terlambat','Izin','Sakit','Alpha') NOT NULL DEFAULT 'Hadir'"
        );
    }
};
