<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PengajuanIzinResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'siswa' => $this->whenLoaded('siswa', function () {
                return [
                    'id'    => $this->siswa->id,
                    'nisn'  => $this->siswa->nisn,
                    'kelas' => $this->siswa->kelas ? [
                        'id'         => $this->siswa->kelas->id,
                        'nama_kelas' => $this->siswa->kelas->nama_kelas,
                    ] : null,
                    'user'  => $this->siswa->user ? [
                        'id'   => $this->siswa->user->id,
                        'nama' => $this->siswa->user->nama,
                    ] : null,
                ];
            }),

            'tanggal_mulai'  => $this->tanggal_mulai ? \Carbon\Carbon::parse($this->tanggal_mulai)->format('Y-m-d') : null,
            'tanggal_selesai' => $this->tanggal_selesai ? \Carbon\Carbon::parse($this->tanggal_selesai)->format('Y-m-d') : null,
            'jenis'           => $this->jenis,
            'alasan'          => $this->alasan,
            'bukti'           => $this->bukti ? url('storage/' . $this->bukti) : null,
            'status'          => $this->status,
            'catatan_verifikator' => $this->catatan_verifikator,
            'verified_by'     => $this->verified_by,
            'verified_at'     => $this->verified_at ? \Carbon\Carbon::parse($this->verified_at)->format('Y-m-d H:i:s') : null,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
