<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AuditLogFactory extends Factory
{

    public function definition(): array
    {

        return [

            'user_id'=>null,

            'aktivitas'=>fake()->randomElement([
                'Login',
                'Logout',
                'Tambah Data',
                'Edit Data',
                'Hapus Data',
                'Check In',
                'Check Out'
            ]),

            'deskripsi'=>fake()->sentence(),

            'ip_address'=>fake()->ipv4(),

        ];

    }

}