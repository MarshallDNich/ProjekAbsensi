<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FaceProfile extends Model
{
    protected $table = 'face_profiles';

    protected $fillable = [
        'siswa_id',
        'embedding',
        'status',
        'registered_at',
    ];

    protected $casts = [
        'embedding' => 'array',
        'registered_at' => 'datetime',
        'status' => 'string',
    ];

    protected $hidden = [
        'embedding',
    ];

    /**
     * Relasi FaceProfile ke Siswa
     *
     * Satu face profile dimiliki oleh satu siswa.
     */
    public function siswa()
    {
        return $this->belongsTo(Siswa::class);
    }
}
