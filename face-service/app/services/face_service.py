import base64
import os

import cv2
import numpy as np
from dotenv import load_dotenv
from insightface.app import FaceAnalysis

load_dotenv()

# Threshold cosine similarity (0 - 1). Dapat di-tune lewat .env MATCH_THRESHOLD.
THRESHOLD = float(os.getenv("MATCH_THRESHOLD", "0.5"))


class FaceService:
    """
    Wrapper untuk InsightFace.

    Model 'buffalo_l' (default InsightFace) menyediakan deteksi wajah
    + embeddingArcFace 512-dimensi.
    """

    _analyzer = None

    @classmethod
    def analyzer(cls):
        if cls._analyzer is None:
            cls._analyzer = FaceAnalysis(
                name="buffalo_l",
                providers=["CPUExecutionProvider"],
            )
            cls._analyzer.prepare(ctx_id=0, det_size=(640, 640))
        return cls._analyzer

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    @staticmethod
    def _decode_base64(b64: str) -> np.ndarray:
        if "," in b64:
            b64 = b64.split(",", 1)[1]
        raw = base64.b64decode(b64)
        arr = np.frombuffer(raw, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Gambar tidak valid atau tidak dapat dibaca.")
        return img

    @staticmethod
    def _cosine(a: np.ndarray, b: np.ndarray) -> float:
        denom = float(np.linalg.norm(a) * np.linalg.norm(b))
        if denom == 0:
            return 0.0
        return float(np.dot(a, b) / denom)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def get_embedding(self, b64: str) -> list:
        img = self._decode_base64(b64)
        faces = self.analyzer().get(img)

        if len(faces) == 0:
            raise ValueError("Tidak ada wajah terdeteksi pada gambar.")
        if len(faces) > 1:
            raise ValueError(
                "Terdapat lebih dari satu wajah. Pastikan hanya satu wajah."
            )

        return faces[0].embedding.astype(np.float32).tolist()

    def verify(self, b64: str, candidates: list, threshold: float = None) -> dict:
        if threshold is None:
            threshold = THRESHOLD

        img = self._decode_base64(b64)
        faces = self.analyzer().get(img)

        if len(faces) == 0:
            raise ValueError("Tidak ada wajah terdeteksi pada gambar.")
        if len(faces) > 1:
            raise ValueError(
                "Terdapat lebih dari satu wajah. Pastikan hanya satu wajah."
            )

        query = np.array(faces[0].embedding, dtype=np.float32)

        best = None
        for cand in candidates:
            emb = np.array(cand["embedding"], dtype=np.float32)
            sim = self._cosine(query, emb)
            if best is None or sim > best["confidence"]:
                best = {"siswa_id": cand["siswa_id"], "confidence": float(sim)}

        if best is None:
            return {"success": True, "matched": False, "confidence": 0.0}

        matched = best["confidence"] >= threshold

        return {
            "success": True,
            "matched": bool(matched),
            "siswa_id": best["siswa_id"] if matched else None,
            "confidence": round(best["confidence"], 4),
        }
