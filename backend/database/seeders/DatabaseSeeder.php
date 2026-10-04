<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([

            AdminSeeder::class,

            GuruSeeder::class,

            KelasSeeder::class,

            MataPelajaranSeeder::class,

            SiswaSeeder::class,

            AbsensiSeeder::class,

            AuditLogSeeder::class,

        ]);
    }
}