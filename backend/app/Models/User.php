<?php

namespace App\Models;

use App\Models\Guru;
use App\Models\Siswa;
use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;


    protected $fillable = [
        'nama',
        'email',
        'password',
        'role',
        'status',
        'foto',
    ];


    protected $hidden = [
        'password',
        'remember_token',
    ];


    protected $casts = [
        'email_verified_at' => 'datetime',
    ];



    /**
     * Relasi User dengan Siswa
     *
     * Satu user hanya memiliki satu data siswa.
     */
    public function siswa()
    {
        return $this->hasOne(Siswa::class);
    }
    
    public function guru()
{
    return $this->hasOne(Guru::class);
}


    /**
     * Relasi User dengan Audit Log
     *
     * Satu user dapat memiliki banyak aktivitas.
     */
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }



    /**
     * Mengecek apakah user memiliki role tertentu
     */
    public function isAdmin()
    {
        return $this->role === 'Admin';
    }


    public function isGuru()
    {
        return $this->role === 'Guru';
    }


    public function isSiswa()
    {
        return $this->role === 'Siswa';
    }
}