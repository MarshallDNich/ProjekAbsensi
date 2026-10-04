import base64
import os

import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision

# Blendshape "eyeBlink*" bernilai 0-1. Di atas threshold dianggap mata terpejam.
BLINK_THRESHOLD = float(os.getenv("BLINK_THRESHOLD", "0.4"))

# Path model FaceLandmarker (.task). Unduh sekali ke folder face-service.
MODEL_PATH = os.getenv(
    "MEDIAPIPE_FACE_MODEL",
    os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "face_landmarker.task",
    ),
)

_landmarker = None
_ts_counter = 0


def _detector():
    global _landmarker
    if _landmarker is None:
        if not os.path.exists(MODEL_PATH):
            raise RuntimeError(
                f"Model FaceLandmarker tidak ditemukan di {MODEL_PATH}. "
                "Unduh dari https://storage.googleapis.com/mediapipe-models/"
                "face_landmarker/face_landmarker/float16/1/face_landmarker.task"
            )
        base = mp_tasks.BaseOptions(model_asset_path=MODEL_PATH)
        opts = vision.FaceLandmarkerOptions(
            base_options=base,
            running_mode=vision.RunningMode.VIDEO,
            num_faces=1,
            output_face_blendshapes=True,
        )
        _landmarker = vision.FaceLandmarker.create_from_options(opts)
    return _landmarker


def warmup():
    """Pra-muat model MediaPipe FaceLandmarker ke memori saat startup server."""
    try:
        _detector()
    except Exception as e:
        print(f"[warn] liveness warmup gagal: {e}")


def _decode_base64(b64: str) -> np.ndarray:
    if "," in b64:
        b64 = b64.split(",", 1)[1]
    raw = base64.b64decode(b64)
    arr = np.frombuffer(raw, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Gambar tidak valid atau tidak dapat dibaca.")
    return img


def detect_liveness(frames, min_blinks: int = 1) -> dict:
    """
    Deteksi liveness active berbasis kedipan mata dari sekuens frame.

    Mengembalikan:
        {
            "success": true,
            "liveness": bool,   # True jika jumlah kedip >= min_blinks
            "blinks": int,
            "confidence": float
        }
    """
    if not frames or len(frames) < 2:
        raise ValueError("Minimal 2 frame diperlukan untuk deteksi kedipan.")

    global _ts_counter

    detector = _detector()
    blinks = 0
    was_closed = False
    faces_seen = 0

    for f in frames:
        img = _decode_base64(f)
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        _ts_counter += 100  # timestamp monoton naik di seluruh umur detector
        res = detector.detect_for_video(mp_image, _ts_counter)

        if not res.face_landmarks or not res.face_blendshapes:
            continue

        faces_seen += 1
        cats = {c.category_name: c.score for c in res.face_blendshapes[0]}
        blink_l = cats.get("eyeBlinkLeft", 0.0)
        blink_r = cats.get("eyeBlinkRight", 0.0)

        closed = min(blink_l, blink_r) > BLINK_THRESHOLD

        # Transisi: tertutup -> terbuka dihitung sebagai satu kedip
        if was_closed and not closed:
            blinks += 1
        was_closed = closed

    if faces_seen == 0:
        raise ValueError("Tidak ada wajah terdeteksi pada frame.")

    return {
        "success": True,
        "liveness": blinks >= min_blinks,
        "blinks": blinks,
        "confidence": min(1.0, blinks / max(1, min_blinks)),
    }
