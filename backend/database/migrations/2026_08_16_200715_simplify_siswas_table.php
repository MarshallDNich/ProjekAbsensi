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
        Schema::table('siswas', function (Blueprint $table) {
            $table->dropColumn([
                'nisn',
                'jenis_kelamin',
                'tanggal_lahir',
                'alamat',
                'nomor_telepon'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('siswas', function (Blueprint $table) {
            $table->string('nisn', 10)->unique()->after('id');
            $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan'])->after('nisn');
            $table->date('tanggal_lahir')->after('jenis_kelamin');
            $table->text('alamat')->after('tanggal_lahir');
            $table->string('nomor_telepon', 15)->after('alamat');
        });
    }
};
