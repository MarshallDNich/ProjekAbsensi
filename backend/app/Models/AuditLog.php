<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;


    protected $table = 'audit_logs';


    protected $fillable = [
        'user_id',
        'aktivitas',
        'deskripsi',
        'ip_address',
    ];


    /**
     * Relasi Audit Log dengan User
     *
     * Satu log aktivitas dibuat oleh satu user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }


    /**
     * Casting data
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}