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
       Schema::create('siswas', function (Blueprint $table) {

    $table->id();

    $table->string('nisn', 10)->unique();

    $table->enum('jenis_kelamin', [
        'Laki-laki',
        'Perempuan'
    ]);

    $table->date('tanggal_lahir');

    $table->text('alamat');

    $table->string('nomor_telepon', 15);

    // Relasi ke users
    $table->foreignId('user_id')
        ->unique()
        ->constrained('users')
        ->cascadeOnUpdate()
        ->cascadeOnDelete();

    // Relasi ke kelas
    $table->foreignId('kelas_id')
        ->nullable()
        ->constrained('kelas')
        ->cascadeOnUpdate()
        ->nullOnDelete();

    $table->softDeletes();

    $table->timestamps();

});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('siswas');
    }
};