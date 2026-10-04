"""
Stub sementara untuk smoke-test kontrak Laravel <-> Python Face Service.

Menggantikan InsightFace dengan logika deterministik agar dapat memverifikasi
request/response shape tanpa mengunduh model berat (~500 MB).

Env:
  STUB_VERIFY = "ok" (default) -> return matched=true, confidence 0.96
  STUB_VERIFY = "reject"       -> return matched=false, confidence 0.30
"""

import os
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Face Service (stub)")


class EmbeddingRequest(BaseModel):
    image: str = Field(..., description="base64 image")


class CandidateFace(BaseModel):
    siswa_id: int
    embedding: List[float]


class VerifyRequest(BaseModel):
    image: str
    faces: List[CandidateFace]
    threshold: Optional[float] = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/face/embedding")
def embedding(req: EmbeddingRequest):
    # dummy 512-d vector
    return {"success": True, "embedding": [0.0] * 512}


@app.post("/face/verify")
def verify(req: VerifyRequest):
    mode = os.getenv("STUB_VERIFY", "ok")
    if not req.faces:
        return {"success": True, "matched": False, "confidence": 0.0}

    if mode == "reject":
        return {
            "success": True,
            "matched": False,
            "siswa_id": None,
            "confidence": 0.30,
        }

    first = req.faces[0]
    return {
        "success": True,
        "matched": True,
        "siswa_id": first.siswa_id,
        "confidence": 0.96,
    }
