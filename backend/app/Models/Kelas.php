<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class Kelas extends Model
{
    use HasFactory, SoftDeletes;


    protected $table = 'kelas';


    protected $fillable = [
        'nama_kelas',
        'tingkat',
        'jurusan',
        'guru_id',
    ];


    /*
    |--------------------------------------------------------------------------
    | Relasi Kelas ke Guru
    |--------------------------------------------------------------------------
    |
    | Setiap kelas memiliki satu wali kelas.
    | Kolom yang digunakan adalah wali_kelas
    | yang mengarah ke gurus.id
    |
    */

    public function waliKelas()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }

    /**
     * Relasi ke Guru (Many to Many) - Guru yang mengajar di kelas ini
     */
    public function guru()
    {
        return $this->belongsToMany(Guru::class, 'guru_kelas', 'kelas_id', 'guru_id');
    }



    /*
    |--------------------------------------------------------------------------
    | Relasi Kelas ke Siswa
    |--------------------------------------------------------------------------
    |
    | Satu kelas memiliki banyak siswa.
    |
    */

    public function siswa()
    {
        return $this->hasMany(Siswa::class);
    }

    public function jadwalPelajaran()
    {
        return $this->hasMany(JadwalPelajaran::class);
    }
}