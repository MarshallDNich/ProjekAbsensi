from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.face_service import FaceService
from app.services.liveness_service import detect_liveness

router = APIRouter(prefix="/face", tags=["face"])

_service = FaceService()


class EmbeddingRequest(BaseModel):
    image: str = Field(..., description="Gambar wajah (base64 data URL atau raw).")


class CandidateFace(BaseModel):
    siswa_id: int
    embedding: List[float]


class VerifyRequest(BaseModel):
    image: str = Field(..., description="Gambar wajah dari kamera (base64).")
    faces: List[CandidateFace]
    threshold: Optional[float] = None


class LivenessRequest(BaseModel):
    frames: List[str] = Field(
        ..., description="Sekuens frame wajah (base64) untuk deteksi kedipan."
    )
    min_blinks: Optional[int] = 1


@router.post("/embedding")
def embedding(req: EmbeddingRequest):
    """
    Menerima satu gambar wajah, mengembalikan embedding (vector).
    Gagal jika tidak ada wajah atau lebih dari satu wajah.
    """
    try:
        vector = _service.get_embedding(req.image)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"success": True, "embedding": vector}


@router.post("/verify")
def verify(req: VerifyRequest):
    """
    Menerima gambar wajah + daftar kandidat embedding.
    Mengembalikan hasil pencocokan terbaik (matched, siswa_id, confidence).
    """
    try:
        candidates = [
            {"siswa_id": c.siswa_id, "embedding": c.embedding}
            for c in req.faces
        ]
        result = _service.verify(req.image, candidates, req.threshold)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return result


@router.post("/liveness")
def liveness(req: LivenessRequest):
    """
    Menerima sekuens frame wajah, mengembalikan hasil deteksi liveness
    berbasis kedipan mata (active liveness / anti-spoofing).
    """
    try:
        return detect_liveness(req.frames, req.min_blinks)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
