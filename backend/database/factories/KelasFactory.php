<?php

namespace Database\Factories;

use App\Models\Guru;
use App\Models\Kelas;
use Illuminate\Database\Eloquent\Factories\Factory;

class KelasFactory extends Factory
{
    protected $model = Kelas::class;

    public function definition(): array
    {
        return [
            'nama_kelas' => fake()->randomElement([
                'X RPL 1',
                'X RPL 2',
                'XI RPL 1',
                'XI RPL 2',
                'XII RPL 1',
                'XII RPL 2',
            ]),

            'jurusan' => 'Rekayasa Perangkat Lunak',

            'guru_id' => Guru::inRandomOrder()->value('id'),
        ];
    }
}