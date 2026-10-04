# Face Recognition Service

Layanan pengenalan wajah terpisah untuk sistem absensi sekolah.

- **Stack:** Python + FastAPI
- **Library (gratis/open-source):** InsightFace, OpenCV, NumPy
- **Tidak ada** layanan cloud berbayar.

Service ini **tidak** mengakses database MySQL Laravel. Laravel yang
mengatur database; Python hanya menerima gambar + kandidat embedding dan
mengembalikan hasil face recognition.

## Struktur

```
face-service/
├── main.py                  # entrypoint FastAPI
├── app/
│   ├── routes/
│   │   └── face.py          # endpoint /face/embedding & /face/verify
│   ├── services/
│   │   └── face_service.py  # deteksi, embedding, matching
│   ├── models/
│   └── utils/
│       └── image.py         # helper decode base64 -> numpy
├── requirements.txt
├── .env
└── README.md
```

## Instalasi

```bash
cd face-service
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

> InsightFace akan mengunduh model `buffalo_l` secara otomatis ke
> `~/.insightface` saat pertama kali dijalankan (perlu koneksi internet).

## Menjalankan

```bash
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

Health check:

```bash
curl http://127.0.0.1:8001/health
```

## Endpoint

### POST /face/embedding

Input:

```json
{ "image": "data:image/jpeg;base64,...." }
```

Proses: decode → detect (harus tepat 1 wajah) → embedding → return.

Response sukses:

```json
{ "success": true, "embedding": [0.12, -0.03, ...] }
```

### POST /face/verify

Input:

```json
{
  "image": "data:image/jpeg;base64,....",
  "faces": [
    { "siswa_id": 15, "embedding": [0.12, -0.03, ...] },
    { "siswa_id": 22, "embedding": [...] }
  ],
  "threshold": 0.5
}
```

Proses: detect wajah → embedding → cocokkan dengan tiap kandidat
(cosine similarity) → ambil yang tertinggi → bandingkan dengan threshold.

Response cocok:

```json
{ "success": true, "matched": true, "siswa_id": 15, "confidence": 0.91 }
```

Response tidak cocok:

```json
{ "success": true, "matched": false, "confidence": 0.32 }
```

## Konfigurasi

| Variable `.env`       | Default | Keterangan |
|----------------------|---------|------------|
| `FACE_SERVICE_HOST`  | 127.0.0.1 | bind host |
| `FACE_SERVICE_PORT`  | 8001    | bind port |
| `MATCH_THRESHOLD`    | 0.5     | batas cosine similarity |

Threshold bersifat **configurable** agar dapat di-tune berdasarkan hasil
testing. Semakin tinggi threshold, semakin ketat kecocokannya.
