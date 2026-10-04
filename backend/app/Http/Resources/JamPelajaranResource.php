<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JamPelajaranResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'nama'       => $this->nama,
            'jam_mulai'  => $this->jam_mulai,
            'jam_selesai' => $this->jam_selesai,
            'urutan'     => $this->urutan,
            'tipe'       => $this->tipe,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
