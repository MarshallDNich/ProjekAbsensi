<?php

namespace App\Models;

use App\Models\User;
use App\Models\Kelas;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Guru extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'gurus';

    protected $fillable = [
        'user_id',
        'mata_pelajaran',
        'nip',
        'nama',
        'jenis_kelamin',
        'nomor_telepon',
        'email',
        'status',
        'alamat',
        'foto',
    ];

    protected $casts = [
        'mata_pelajaran' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relasi ke User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke Kelas (Many to Many)
     */
    public function kelas()
    {
        return $this->belongsToMany(Kelas::class, 'guru_kelas', 'guru_id', 'kelas_id');
    }

    /**
     * Relasi ke Kelas sebagai Wali Kelas
     */
    public function kelasAsWali()
    {
        return $this->hasMany(Kelas::class, 'guru_id');
    }

    public function jadwalPelajaran()
    {
        return $this->hasMany(JadwalPelajaran::class);
    }
}