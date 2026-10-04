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
            $table->dropColumn([
                'nip',
                'jenis_kelamin',
                'nomor_telepon',
                'email',
                'status',
                'alamat',
                'foto'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gurus', function (Blueprint $table) {
            $table->string('nip', 30)->unique()->after('user_id');
            $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan'])->after('nip');
            $table->string('nomor_telepon', 20)->after('jenis_kelamin');
            $table->string('email', 100)->nullable()->after('nomor_telepon');
            $table->enum('status', ['Aktif', 'Tidak Aktif'])->default('Aktif')->after('email');
            $table->text('alamat')->after('status');
            $table->string('foto')->nullable()->after('alamat');
        });
    }
};
