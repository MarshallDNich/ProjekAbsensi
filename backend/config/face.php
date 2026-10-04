<?php

use Illuminate\Support\Arr;

return [

    /*
    |--------------------------------------------------------------------------
    | Python Face Recognition Service
    |--------------------------------------------------------------------------
    |
    | Laravel (backend utama) memanggil service Python/FastAPI ini untuk
    | face detection, embedding, dan face matching.
    |
    */

    'service_url' => env('FACE_SERVICE_URL', 'http://127.0.0.1:8001'),

    'endpoints' => [
        'embedding' => env('FACE_EMBEDDING_ENDPOINT', '/face/embedding'),
        'verify'    => env('FACE_VERIFY_ENDPOINT', '/face/verify'),
        'liveness'  => env('FACE_LIVENESS_ENDPOINT', '/face/liveness'),
    ],

    /*
    | Cosine similarity threshold (0 - 1).
    | Nilai di atas threshold dianggap cocok (matched).
    |
    */
    'threshold' => env('FACE_MATCH_THRESHOLD', 0.5),

    'timeout' => env('FACE_SERVICE_TIMEOUT', 30),
];
