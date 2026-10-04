<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JamPelajaran extends Model
{
    protected $table = 'jam_pelajaran';

    protected $fillable = [
        'nama',
        'jam_mulai',
        'jam_selesai',
        'urutan',
        'tipe',
    ];

    protected $casts = [
        'jam_mulai'   => 'string',
        'jam_selesai' => 'string',
    ];

    public function jadwalPelajaran()
    {
        return $this->hasMany(JadwalPelajaran::class);
    }
}
