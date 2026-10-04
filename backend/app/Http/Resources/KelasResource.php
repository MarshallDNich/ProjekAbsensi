<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KelasResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama_kelas' => $this->nama_kelas,
            'tingkat' => $this->tingkat,
            'jurusan' => $this->jurusan,
            'wali_kelas' => $this->guru_id,
            'wali_kelas_guru' => new GuruResource($this->whenLoaded('waliKelas')),
            'total_siswa' => $this->whenCounted('siswa'),
            'siswa' => $this->whenLoaded('siswa', function () {
                return $this->siswa->map(function ($siswa) {
                    return [
                        'id' => $siswa->id,
                        'user_id' => $siswa->user_id,
                        'nisn' => $siswa->nisn,
                        'nama' => $siswa->user->nama ?? null,
                        'email' => $siswa->user->email ?? null,
                        'foto' => $siswa->user->foto ? url('storage/' . $siswa->user->foto) : null,
                    ];
                })->values();
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
