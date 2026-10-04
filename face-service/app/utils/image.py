"""Utilitas kecil untuk decode gambar base64 ke numpy array (BGR)."""

import base64

import cv2
import numpy as np


def decode_base64_to_bgr(b64: str) -> np.ndarray:
    if "," in b64:
        b64 = b64.split(",", 1)[1]
    raw = base64.b64decode(b64)
    arr = np.frombuffer(raw, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Gambar tidak valid atau tidak dapat dibaca.")
    return img
