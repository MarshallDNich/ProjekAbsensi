"""
Face Recognition Service (Python + FastAPI)

Service terpisah yang hanya bertugas:
  - Face Detection
  - Face Embedding
  - Face Matching

TIDAK mengakses database Laravel secara langsung.
Laravel yang mengirimkan gambar & kandidat, lalu menerima hasil recognition.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from dotenv import load_dotenv

from app.routes import face as face_routes
from app.services.face_service import FaceService
from app.services.liveness_service import warmup

load_dotenv()

app = FastAPI(
    title="Face Recognition Service",
    description="Layanan pengenalan wajah untuk sistem absensi sekolah.",
    version="1.0.0",
)


@app.on_event("startup")
def _warmup_models():
    print("Memuat model wajah (InsightFace buffalo_l) ...")
    FaceService.analyzer()
    print("Memuat model liveness (MediaPipe FaceLandmarker) ...")
    warmup()
    print("Semua model wajah siap.")


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    import traceback
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": str(exc),
            "traceback": traceback.format_exc().splitlines()[-5:],
        },
    )


app.include_router(face_routes.router)


@app.get("/health")
def health():
    return {"status": "ok"}
