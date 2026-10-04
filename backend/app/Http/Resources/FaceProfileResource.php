<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FaceProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [

            'id'              => $this->id,
            'siswa_id'        => $this->siswa_id,
            'status'          => $this->status,
            'registered_at'   => $this->registered_at,
            'created_at'      => $this->created_at,
            'updated_at'      => $this->updated_at,

            'siswa' => $this->whenLoaded('siswa', function () {
                return [
                    'id'    => $this->siswa->id,
                    'nisn'  => $this->siswa->nisn,
                    'user'  => $this->siswa->user ? [
                        'id'    => $this->siswa->user->id,
                        'nama'  => $this->siswa->user->nama,
                        'email' => $this->siswa->user->email,
                    ] : null,
                ];
            }),

        ];
    }
}
