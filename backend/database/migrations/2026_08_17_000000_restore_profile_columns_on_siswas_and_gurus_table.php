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
            if (!Schema::hasColumn('siswas', 'nisn')) {
                $table->string('nisn', 10)->nullable()->unique()->after('id');
            }
            if (!Schema::hasColumn('siswas', 'jenis_kelamin')) {
                $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan'])->nullable()->after('nisn');
            }
            if (!Schema::hasColumn('siswas', 'tanggal_lahir')) {
                $table->date('tanggal_lahir')->nullable()->after('jenis_kelamin');
            }
            if (!Schema::hasColumn('siswas', 'alamat')) {
                $table->text('alamat')->nullable()->after('tanggal_lahir');
            }
            if (!Schema::hasColumn('siswas', 'nomor_telepon')) {
                $table->string('nomor_telepon', 15)->nullable()->after('alamat');
            }
        });

        Schema::table('gurus', function (Blueprint $table) {
            if (!Schema::hasColumn('gurus', 'nip')) {
                $table->string('nip', 30)->nullable()->unique()->after('id');
            }
            if (!Schema::hasColumn('gurus', 'nama')) {
                $table->string('nama', 100)->nullable()->after('nip');
            }
            if (!Schema::hasColumn('gurus', 'jenis_kelamin')) {
                $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan'])->nullable()->after('nama');
            }
            if (!Schema::hasColumn('gurus', 'nomor_telepon')) {
                $table->string('nomor_telepon', 20)->nullable()->after('jenis_kelamin');
            }
            if (!Schema::hasColumn('gurus', 'email')) {
                $table->string('email', 100)->nullable()->after('nomor_telepon');
            }
            if (!Schema::hasColumn('gurus', 'status')) {
                $table->enum('status', ['Aktif', 'Tidak Aktif'])->default('Aktif')->after('email');
            }
            if (!Schema::hasColumn('gurus', 'alamat')) {
                $table->text('alamat')->nullable()->after('status');
            }
            if (!Schema::hasColumn('gurus', 'foto')) {
                $table->string('foto')->nullable()->after('alamat');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
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

        Schema::table('gurus', function (Blueprint $table) {
            $table->dropColumn([
                'nip',
                'nama',
                'jenis_kelamin',
                'nomor_telepon',
                'email',
                'status',
                'alamat',
                'foto'
            ]);
        });
    }
};