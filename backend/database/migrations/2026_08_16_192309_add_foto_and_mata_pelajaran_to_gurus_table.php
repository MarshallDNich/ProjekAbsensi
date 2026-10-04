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
        Schema::table('gurus', function (Blueprint $table) {
            $table->string('foto')->nullable()->after('nama');
            $table->json('mata_pelajaran')->nullable()->after('alamat');
            $table->string('email')->nullable()->after('nomor_telepon');
            $table->enum('status', ['Aktif', 'Tidak Aktif'])->default('Aktif')->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gurus', function (Blueprint $table) {
            $table->dropColumn(['foto', 'mata_pelajaran', 'email', 'status']);
        });
    }
};
