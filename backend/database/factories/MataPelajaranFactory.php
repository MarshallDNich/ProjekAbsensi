<?php

namespace Database\Factories;

use App\Models\MataPelajaran;
use Illuminate\Database\Eloquent\Factories\Factory;

class MataPelajaranFactory extends Factory
{
    protected $model = MataPelajaran::class;

    public function definition(): array
    {
        return [
            'kode' => fake()->unique()->bothify('??###'),
            'nama' => fake()->randomElement([
                'Matematika',
                'Bahasa Indonesia',
                'Bahasa Inggris',
                'Fisika',
                'Kimia',
                'Pemrograman Web',
                'Basis Data',
                'Pemrograman Berorientasi Objek',
            ]),
            'deskripsi' => fake()->sentence(8),
            'status' => 'Aktif',
        ];
    }
}