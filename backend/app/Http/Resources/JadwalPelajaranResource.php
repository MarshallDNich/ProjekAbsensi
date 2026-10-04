<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JadwalPelajaranResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'hari' => $this->hari,

            'jam_pelajaran' => $this->whenLoaded('jamPelajaran', fn () => [
                'id'         => $this->jamPelajaran->id,
                'nama'       => $this->jamPelajaran->nama,
                'jam_mulai'  => $this->jamPelajaran->jam_mulai,
                'jam_selesai' => $this->jamPelajaran->jam_selesai,
                'urutan'     => $this->jamPelajaran->urutan,
                'tipe'       => $this->jamPelajaran->tipe,
            ]),

            'kelas' => $this->whenLoaded('kelas', fn () => [
                'id'         => $this->kelas->id,
                'nama_kelas' => $this->kelas->nama_kelas,
                'tingkat'    => $this->kelas->tingkat,
                'jurusan'    => $this->kelas->jurusan,
            ]),

            'guru' => $this->whenLoaded('guru', fn () => [
                'id'   => $this->guru->id,
                'nip'  => $this->guru->nip,
                'nama' => $this->guru->nama,
            ]),

            'mata_pelajaran' => $this->whenLoaded('mataPelajaran', fn () => [
                'id'   => $this->mataPelajaran->id,
                'kode' => $this->mataPelajaran->kode,
                'nama' => $this->mataPelajaran->nama,
            ]),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
