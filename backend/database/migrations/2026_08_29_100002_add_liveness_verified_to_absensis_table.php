<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah kolom verifikasi liveness (kedipan mata) pada absensi.
     */
    public function up(): void
    {
        Schema::table('absensis', function (Blueprint $table) {
            $table->boolean('liveness_verified')
                ->default(false)
                ->after('confidence_score')
                ->comment('True jika presensi lolos verifikasi hidup (kedipan mata).');
        });
    }

    public function down(): void
    {
        Schema::table('absensis', function (Blueprint $table) {
            $table->dropColumn('liveness_verified');
        });
    }
};
