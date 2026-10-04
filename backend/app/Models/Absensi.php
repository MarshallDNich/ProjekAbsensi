<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Absensi extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'absensis';

    protected $fillable = [
        'siswa_id',
        'tanggal',
        'jam_masuk',
        'jam_keluar',
        'status',
        'metode',
        'confidence_score',
        'liveness_verified',
        'keterangan',
        'foto',
    ];

    /**
     * Relasi Absensi ke Siswa
     *
     * Satu data absensi dimiliki oleh satu siswa.
     */
    public function siswa()
    {
        return $this->belongsTo(Siswa::class);
    }

    /**
     * Casting tipe data
     *
     * jam_masuk & jam_keluar dibiarkan sebagai string agar format 'H:i:s'
     * tidak berubah saat dibaca dari database (tidak perlu Carbon).
     */
    protected $casts = [
        'tanggal' => 'date',
        'confidence_score' => 'decimal:4',
        'liveness_verified' => 'boolean',
    ];
}
