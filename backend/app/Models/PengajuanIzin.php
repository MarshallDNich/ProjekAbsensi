<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengajuanIzin extends Model
{

    protected $table = 'pengajuan_izin';

    protected $fillable = [
        'siswa_id',
        'tanggal_mulai',
        'tanggal_selesai',
        'jenis',
        'alasan',
        'bukti',
        'status',
        'catatan_verifikator',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'verified_at' => 'datetime',
    ];

    /**
     * Siswa pembuat pengajuan.
     */
    public function siswa()
    {
        return $this->belongsTo(Siswa::class);
    }

    /**
     * User (Admin/Guru) yang memverifikasi pengajuan.
     */
    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public const JENIS = ['izin', 'sakit', 'dispensasi'];

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
}
