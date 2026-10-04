<?php

namespace Database\Factories;

use App\Models\Guru;
use Illuminate\Database\Eloquent\Factories\Factory;

class GuruFactory extends Factory
{
    protected $model = Guru::class;

    public function definition(): array
    {
        return [

            'nip' => fake()->unique()->numerify('##################'),

            'nama' => fake()->name(),

            'jenis_kelamin' => fake()->randomElement([
                'Laki-laki',
                'Perempuan'
            ]),

            'nomor_telepon' => '08' . fake()->numerify('##########'),

            'alamat' => fake()->address(),

            // Akan diisi oleh GuruSeeder
            'user_id' => null,

        ];
    }
}