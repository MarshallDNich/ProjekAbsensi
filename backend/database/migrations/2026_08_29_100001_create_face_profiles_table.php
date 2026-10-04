<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabel face_profiles menyimpan template/embedding wajah siswa.
     * Embedding disimpan sebagai JSON (array of floats) dalam kolom longText.
     */
    public function up(): void
    {
        Schema::create('face_profiles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('siswa_id')
                ->constrained('siswas')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->longText('embedding')->nullable();

            $table->enum('status', ['active', 'inactive'])
                ->default('active');

            $table->timestamp('registered_at')->nullable();

            $table->timestamps();

            $table->unique('siswa_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('face_profiles');
    }
};
