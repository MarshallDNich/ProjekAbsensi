<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Batas Waktu Masuk
    |--------------------------------------------------------------------------
    |
    | Siswa yang melakukan absensi pada atau sebelum jam ini dihitung HADIR,
    | sedangkan yang lewat dari jam ini dihitung TERLAMBAT.
    |
    */
    'batas_masuk' => env('ABSENSI_BATAS_MASUK', '07:00'),

    /*
    |--------------------------------------------------------------------------
    | Konfigurasi Foto Absensi
    |--------------------------------------------------------------------------
    */
    'foto' => [
        'disk' => 'public',
        'path' => 'absensi',
        'max_size_kb' => 2048,
        'allowed_mimes' => ['jpeg', 'png'],
        'max_dimension' => 2000,
    ],

];
