<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jam_pelajaran', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 50);              // "Jam 1", "Istirahat 1"
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->unsignedSmallInteger('urutan');   // untuk pengurutan
            $table->enum('tipe', ['lesson', 'break'])->default('lesson');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jam_pelajaran');
    }
};
