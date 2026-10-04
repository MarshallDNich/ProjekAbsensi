<?php

namespace Database\Factories;

use App\Models\Siswa;
use Illuminate\Database\Eloquent\Factories\Factory;

class SiswaFactory extends Factory
{
    protected $model = Siswa::class;

    public function definition(): array
{
    return [

       'nisn' => fake()->unique()->numerify('##########'),

        'jenis_kelamin' => fake()->randomElement([
            'Laki-laki',
            'Perempuan'
        ]),

        'tanggal_lahir' => fake()->date(),

        'alamat' => fake()->address(),

        'nomor_telepon' => '08' . fake()->numerify('##########'),

        // Diisi oleh Seeder
        'kelas_id' => null,

        // Diisi oleh Seeder
        'user_id' => null,

    ];
}
}