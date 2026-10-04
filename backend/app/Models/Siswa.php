<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class Siswa extends Model
{
    use HasFactory, SoftDeletes;


    protected $table = 'siswas';


    protected $fillable = [
        'user_id',
        'kelas_id',
        'nisn',
        'jenis_kelamin',
        'tanggal_lahir',
        'alamat',
        'nomor_telepon',
    ];



    /*
    |--------------------------------------------------------------------------
    | Relasi Siswa ke User
    |--------------------------------------------------------------------------
    |
    | Setiap siswa memiliki satu akun login.
    |
    */

    public function user()
    {
        return $this->belongsTo(User::class);
    }



    /*
    |--------------------------------------------------------------------------
    | Relasi Siswa ke Kelas
    |--------------------------------------------------------------------------
    |
    | Setiap siswa berada dalam satu kelas.
    |
    */

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }



    /*
    |--------------------------------------------------------------------------
    | Relasi Siswa ke Absensi
    |--------------------------------------------------------------------------
    |
    | Satu siswa memiliki banyak riwayat absensi.
    |
    */

    public function absensis()
    {
        return $this->hasMany(Absensi::class);
    }


    /**
     * Relasi Siswa ke FaceProfile
     *
     * Satu siswa memiliki satu face profile (template wajah).
     */
    public function faceProfile()
    {
        return $this->hasOne(FaceProfile::class);
    }
}