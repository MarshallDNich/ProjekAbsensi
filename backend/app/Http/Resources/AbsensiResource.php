<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AbsensiResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,
            'siswa_id' => $this->siswa_id,
            'tanggal' => $this->tanggal ? \Carbon\Carbon::parse($this->tanggal)->format('Y-m-d') : null,
            'jam_masuk' => $this->jam_masuk ? \Carbon\Carbon::parse($this->jam_masuk)->format('H:i:s') : null,
            'jam_keluar' => $this->jam_keluar ? \Carbon\Carbon::parse($this->jam_keluar)->format('H:i:s') : null,
            'status' => $this->status,
            'metode' => $this->metode,
            'confidence_score' => $this->confidence_score ? (float) $this->confidence_score : null,
            'liveness_verified' => (bool) $this->liveness_verified,
            'keterangan' => $this->keterangan,
            'foto' => $this->foto ? url('storage/' . $this->foto) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'siswa' => $this->whenLoaded('siswa', function () {
                return [
                    'id' => $this->siswa->id,
                    'nisn' => $this->siswa->nisn,
                    'kelas' => $this->siswa->kelas ? [
                        'id' => $this->siswa->kelas->id,
                        'nama_kelas' => $this->siswa->kelas->nama_kelas,
                        'jurusan' => $this->siswa->kelas->jurusan,
                        'tingkat' => $this->siswa->kelas->tingkat,
                    ] : null,
                    'user' => $this->siswa->user ? [
                        'id' => $this->siswa->user->id,
                        'nama' => $this->siswa->user->nama,
                        'email' => $this->siswa->user->email,
                    ] : null,
                ];
            }),

        ];
    }
}
