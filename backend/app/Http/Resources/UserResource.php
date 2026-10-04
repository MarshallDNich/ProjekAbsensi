<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'nama' => $this->nama,
            'email' => $this->email,
            'role' => $this->role,
            'status' => $this->status ?? 'Aktif',
            'foto' => $this->foto ? (str_starts_with($this->foto, 'http') ? $this->foto : url('storage/' . $this->foto)) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        if ($this->role === 'Siswa' && $this->relationLoaded('siswa') && $this->siswa) {
            $hasFaceProfile = \App\Models\FaceProfile::where('siswa_id', $this->siswa->id)
                ->where('status', 'active')
                ->exists();

            $data['siswa'] = [
                'id' => $this->siswa->id,
                'nisn' => $this->siswa->nisn,
                'jenis_kelamin' => $this->siswa->jenis_kelamin,
                'tanggal_lahir' => $this->siswa->tanggal_lahir,
                'nomor_telepon' => $this->siswa->nomor_telepon,
                'alamat' => $this->siswa->alamat,
                'kelas_id' => $this->siswa->kelas_id,
                'has_face_profile' => $hasFaceProfile,
                'kelas' => $this->siswa->kelas ? [
                    'id' => $this->siswa->kelas->id,
                    'nama_kelas' => $this->siswa->kelas->nama_kelas,
                    'jurusan' => $this->siswa->kelas->jurusan,
                    'tingkat' => $this->siswa->kelas->tingkat,
                ] : null,
            ];
        } elseif ($this->role === 'Guru' && $this->relationLoaded('guru') && $this->guru) {
            $data['guru'] = [
                'id' => $this->guru->id,
                'nip' => $this->guru->nip,
                'jenis_kelamin' => $this->guru->jenis_kelamin,
                'nomor_telepon' => $this->guru->nomor_telepon,
                'alamat' => $this->guru->alamat,
            ];
        }

        return $data;
    }
}