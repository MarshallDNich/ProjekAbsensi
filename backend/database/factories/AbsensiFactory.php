<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AbsensiFactory extends Factory
{

    public function definition(): array
    {

        return [

            'siswa_id'=>null,

            'tanggal'=>fake()->date(),

            'jam_masuk'=>fake()->time(),

            'jam_keluar'=>fake()->time(),

            'status'=>fake()->randomElement([
                'Hadir',
                'Izin',
                'Sakit',
                'Alpha'
            ]),

            'keterangan'=>fake()->sentence(),

        ];

    }

}