import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { storeAbsensi, getRiwayatSaya } from "../../services/absensiService";
import { me } from "../../services/authService";
import {
    Camera,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Clock,
    Calendar,
    Sparkles,
    ShieldCheck,
    RotateCcw,
    History,
    Info,
    Zap,
    ScanFace,
    Edit3,
} from "lucide-react";
import Swal from "sweetalert2";
import "./Absensi.css";

const QUICK_CHIPS = [
    "Tepat Waktu 👍",
    "Tugas Piket 🧹",
    "Hujan Deras 🌧️",
    "Macet Jalanan 🚗",
    "Kondisi Sehat 💪",
];

// Durasi window perekaman liveness (detik) & interval ambil frame (ms)
const CAPTURE_SECONDS = 3;
const FRAME_INTERVAL_MS = 150;

function todayStr() {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d - tzOffset).toISOString().slice(0, 10);
}

function AbsensiAmbil() {
    const { user, token, updateUser } = useAuth();
    const navigate = useNavigate();

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const framesRef = useRef([]);
    const startedRef = useRef(false);

    const [currentTime, setCurrentTime] = useState("");
    const [currentDateFormatted, setCurrentDateFormatted] = useState("");

    // Modes: 'presensi' or 'register_wajah'
    const [mode, setMode] = useState(user?.foto ? "presensi" : "register_wajah");

    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    const [keterangan, setKeterangan] = useState("");

    const [sudahAbsen, setSudahAbsen] = useState(null);

    // Liveness capture state
    const [capturing, setCapturing] = useState(false);
    const [countdown, setCountdown] = useState(CAPTURE_SECONDS);

    // Live clock updater
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                }) + " WIB"
            );
            setCurrentDateFormatted(
                now.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                })
            );
        };

        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    const startCamera = async () => {
        setCameraError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setCameraReady(true);
        } catch (err) {
            console.error("Camera access error:", err);
            setCameraReady(false);
            setCameraError(
                "Tidak dapat mengakses kamera. Pastikan izin kamera pada browser telah diberikan."
            );
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        setCameraReady(false);
    };

    const checkSudahAbsen = async () => {
        try {
            const res = await getRiwayatSaya(token, { per_page: 30 });
            const items = res.data.data || [];
            const today = todayStr();
            const todayAbsen = items.find((a) => a.tanggal === today);
            if (todayAbsen) {
                setSudahAbsen(todayAbsen);
                return true;
            }
        } catch (err) {
            // abaikan
        }
        return false;
    };

    useEffect(() => {
        setChecking(true);
        (async () => {
            const sudah = await checkSudahAbsen();
            if (!sudah && !capturing) {
                await startCamera();
            }
            setChecking(false);
        })();
        return () => stopCamera();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    // Ambil 1 frame dari video ke buffer framesRef (base64 JPEG)
    const captureFrameToBuffer = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.videoWidth === 0) return;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
        framesRef.current.push(dataUrl);
    };

    // Alur utama: rekam ~3 detik lalu kirim untuk verifikasi hidup + presensi
    const startLivenessFlow = async (enroll) => {
        if (!cameraReady) {
            await startCamera();
            if (!cameraReady) return;
        }

        if (capturing || startedRef.current) return;
        startedRef.current = true;

        setCapturing(true);
        framesRef.current = [];
        setCountdown(CAPTURE_SECONDS);

        // Ambil frame pertama segera
        captureFrameToBuffer();

        let remaining = CAPTURE_SECONDS;
        const captureTimer = setInterval(captureFrameToBuffer, FRAME_INTERVAL_MS);
        const countdownTimer = setInterval(() => {
            remaining -= 1;
            setCountdown(remaining);
            if (remaining <= 0) {
                clearInterval(captureTimer);
                clearInterval(countdownTimer);
                finishLivenessFlow(enroll);
            }
        }, 1000);
    };

    const finishLivenessFlow = async (enroll) => {
        const frames = framesRef.current;

        if (!frames || frames.length < 4) {
            setCapturing(false);
            startedRef.current = false;
            Swal.fire({
                icon: "error",
                title: "Gagal Merekam Wajah",
                text: "Kamera tidak menangkap cukup frame. Pastikan wajah terlihat jelas dan coba lagi.",
                confirmButtonColor: "#dc2626",
            });
            return;
        }

        // Frame terakhir (mata cenderung terbuka setelah kedip) dipakai untuk rekognisi
        const foto = frames[frames.length - 1];

        const wasRegistered = !!user?.foto;
        setCapturing(false);
        setLoading(true);

        try {
            const res = await storeAbsensi(token, {
                foto,
                frames,
                keterangan: keterangan || null,
                enroll: enroll ? true : undefined,
            });

            const saved = res.data.data;
            setSudahAbsen(saved);
            stopCamera();

            // Refresh user data untuk update has_face_profile & foto
            try {
                const meRes = await me(token);
                updateUser(meRes.data.data);
            } catch (e) {
                console.warn('Failed to refresh user data:', e);
            }

            Swal.fire({
                icon: "success",
                title: !wasRegistered
                    ? "Pendaftaran & Presensi Berhasil!"
                    : "Presensi Berhasil Dicatat!",
                html: `
                    <div style="text-align: center;">
                        <p style="margin-bottom: 8px;">
                            ${
                                !wasRegistered
                                    ? "Wajah Anda berhasil didaftarkan & kehadiran hari ini tercatat."
                                    : "Presensi kehadiran Anda telah diverifikasi oleh sistem."
                            }
                        </p>
                        <span class="absen-badge ${
                            (saved.status || "").toLowerCase() === "terlambat"
                                ? "badge-terlambat"
                                : "badge-hadir"
                        }" style="font-size: 14px; padding: 6px 16px;">
                            ${saved.status ? saved.status.charAt(0).toUpperCase() + saved.status.slice(1) : "-"}
                        </span>
                        <p style="margin-top: 10px; font-size: 13px; color: #64748b;">
                            Waktu masuk: <b>${saved.jam_masuk || "-"} WIB</b>
                        </p>
                    </div>
                `,
                confirmButtonColor: "#dc2626",
                confirmButtonText: "Selesai",
            });
        } catch (err) {
            const errors = err.response?.data?.errors;
            let msg = "Gagal melakukan presensi.";
            if (errors) {
                msg = Object.values(errors).flat().join(" ");
            } else if (err.response?.data?.message) {
                msg = err.response.data.message;
            }
            Swal.fire({
                icon: "error",
                title: "Gagal Presensi",
                text: msg,
                confirmButtonColor: "#dc2626",
            });
        } finally {
            setLoading(false);
            setKeterangan("");
            startedRef.current = false;
        }
    };

    const handleChipClick = (chip) => {
        if (keterangan.includes(chip)) {
            setKeterangan(
                keterangan
                    .replace(chip, "")
                    .replace(/,\s*,/g, ",")
                    .trim()
            );
        } else {
            setKeterangan(keterangan ? `${keterangan}, ${chip}` : chip);
        }
    };

    const isFirstTime = !user?.foto;

    return (
        <div className="absen-page-container">
            {/* Header Hero */}
            <div className="absen-header-hero">
                <div>
                    <h1 className="absen-header-title">
                        <span className="title-icon">
                            <ScanFace size={22} />
                        </span>
                        Presensi &amp; Verifikasi Wajah Siswa
                    </h1>
                    <p className="absen-header-subtitle">
                        {isFirstTime
                            ? "Daftarkan wajah & presensi hari ini. Kedipkan mata saat kamera merekam untuk verifikasi."
                            : "Verifikasi presensi kehadiran Anda hari ini menggunakan kamera selfie."}
                    </p>
                </div>
                <div className="absen-header-right">
                    <div className="live-clock-pill">
                        <span className="clock-dot"></span>
                        <Clock size={16} />
                        <span>{currentTime || "Memuat waktu..."}</span>
                    </div>
                    <div className="date-pill">
                        <Calendar size={14} />
                        <span>{currentDateFormatted}</span>
                    </div>
                </div>
            </div>

            {/* Face Registration Status Banner */}
            <div className={`face-reg-banner ${!user?.foto ? "unregistered" : ""}`}>
                <div className="face-reg-left">
                    <div className="face-reg-avatar">
                        {user?.foto ? (
                            <img src={user.foto} alt="Wajah Terdaftar" />
                        ) : (
                            <ScanFace size={28} />
                        )}
                    </div>
                    <div>
                        <div className="face-reg-title">
                            {user?.foto ? (
                                <>
                                    <CheckCircle2 size={16} color="#059669" />
                                    Data Wajah Siswa Terdaftar
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={16} color="#d97706" />
                                    Data Wajah Belum Terdaftar
                                </>
                            )}
                        </div>
                        <p className="face-reg-desc">
                            {user?.foto
                                ? "Wajah referensi Anda sudah aktif. Kamera akan mencocokkan kehadiran dengan data ini."
                                : "Sekali perekaman, wajah Anda didaftarkan sekaligus mencatat presensi hari ini."}
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {user?.foto && (
                        <button
                            type="button"
                            className="btn-action btn-detail"
                            onClick={() => {
                                setMode(
                                    mode === "presensi"
                                        ? "register_wajah"
                                        : "presensi"
                                );
                            }}
                            style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }}
                        >
                            <Edit3 size={14} />
                            {mode === "presensi"
                                ? "Perbarui Wajah"
                                : "Kembali ke Presensi"}
                        </button>
                    )}
                </div>
            </div>

            {/* Mode Switcher Tabs */}
            {user?.foto && !sudahAbsen && (
                <div className="absen-mode-switcher">
                    <button
                        type="button"
                        className={`mode-switch-btn ${mode === "presensi" ? "active primary" : ""}`}
                        onClick={() => {
                            setMode("presensi");
                        }}
                    >
                        <Camera size={16} /> Presensi Harian
                    </button>
                    <button
                        type="button"
                        className={`mode-switch-btn ${mode === "register_wajah" ? "active" : ""}`}
                        onClick={() => {
                            setMode("register_wajah");
                        }}
                    >
                        <ScanFace size={16} /> Perbarui Foto Wajah
                    </button>
                </div>
            )}

            {checking ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p style={{ marginTop: "1rem", color: "#64748b", fontWeight: 600 }}>
                        Memeriksa status kehadiran dan data wajah...
                    </p>
                </div>
            ) : sudahAbsen && mode !== "register_wajah" ? (
                /* Digital Attendance Pass Card */
                <div className="digital-pass-card">
                    <div
                        className={`pass-header-ribbon ${
                            (sudahAbsen.status || "").toLowerCase() === "terlambat"
                                ? "status-terlambat"
                                : "status-hadir"
                        }`}
                    >
                        <div className="pass-ribbon-icon">
                            {(sudahAbsen.status || "").toLowerCase() === "terlambat" ? (
                                <Clock size={36} />
                            ) : (
                                <ShieldCheck size={36} />
                            )}
                        </div>
                        <h2 className="pass-title">
                            {(sudahAbsen.status || "").toLowerCase() === "terlambat"
                                ? "Presensi Terlambat"
                                : "Presensi Berhasil!"}
                        </h2>
                        <p className="pass-subtitle">
                            Anda sudah melakukan absensi untuk hari ini ({sudahAbsen.tanggal})
                        </p>
                    </div>

                    <div className="pass-ticket-cutout">
                        <div className="cutout-line"></div>
                    </div>

                    <div className="pass-body">
                        <div
                            className="pass-photo-frame"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#059669",
                                background: "#ecfdf5",
                                border: "1.5px solid #a7f3d0",
                            }}
                        >
                            <ShieldCheck size={36} />
                            <span style={{ marginTop: "0.35rem", fontSize: "0.8rem", fontWeight: 700 }}>
                                Terverifikasi Face ID
                            </span>
                        </div>

                        <div className="pass-grid-meta">
                            <div className="pass-meta-item">
                                <span className="pass-meta-label">Nama Siswa</span>
                                <span className="pass-meta-val">{user?.nama || "Siswa"}</span>
                            </div>
                            <div className="pass-meta-item">
                                <span className="pass-meta-label">Status Kehadiran</span>
                                <div>
                                    <span
                                        className={`absen-badge ${
                                            (sudahAbsen.status || "").toLowerCase() === "terlambat"
                                                ? "badge-terlambat"
                                                : "badge-hadir"
                                        }`}
                                    >
                                        <Sparkles size={12} />
                                        {sudahAbsen.status ? sudahAbsen.status.charAt(0).toUpperCase() + sudahAbsen.status.slice(1) : "-"}
                                    </span>
                                </div>
                            </div>
                            <div className="pass-meta-item">
                                <span className="pass-meta-label">Jam Masuk (Server)</span>
                                <span className="pass-meta-val" style={{ fontFamily: "monospace" }}>
                                    {sudahAbsen.jam_masuk || "-"} WIB
                                </span>
                            </div>
                            <div className="pass-meta-item">
                                <span className="pass-meta-label">Batas Jam Masuk</span>
                                <span className="pass-meta-val" style={{ color: "#dc2626" }}>
                                    07:00 WIB
                                </span>
                            </div>
                        </div>

                        {sudahAbsen.keterangan && (
                            <div className="pass-note-box">
                                <b>Catatan:</b> {sudahAbsen.keterangan}
                            </div>
                        )}

                        <div className="pass-actions">
                            <button
                                className="btn-action btn-detail"
                                onClick={() => navigate("/absensi/siswa")}
                            >
                                <History size={16} /> Lihat Riwayat Saya
                            </button>
                            <button
                                className="btn-action btn-primary"
                                onClick={() => navigate("/dashboard")}
                            >
                                Ke Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            ) : mode === "register_wajah" && user?.foto ? (
                /* Mode perbarui wajah: gunakan flow liveness juga */
                <div className="camera-workspace">
                    <div className="camera-main-card">
                        <div className="camera-card-top">
                            <h3 className="camera-card-title">
                                <ScanFace size={18} color="#2563eb" />
                                {capturing
                                    ? `Merekam… ${countdown}s`
                                    : "Perbarui Foto Wajah Referensi"}
                            </h3>
                            <div className="camera-live-badge">
                                <span className="live-dot"></span>
                                {capturing ? "Sedang merekam" : "Siap"}
                            </div>
                        </div>

                        <div className="viewfinder-box">
                            <video
                                ref={videoRef}
                                className="viewfinder-video"
                                playsInline
                                muted
                            />
                            {capturing && (
                                <div className="camera-hud-overlay">
                                    <div className="hud-corner top-left"></div>
                                    <div className="hud-corner top-right"></div>
                                    <div className="hud-corner bottom-left"></div>
                                    <div className="hud-corner bottom-right"></div>
                                    <div className="hud-bottom-info" style={{ background: "rgba(220, 38, 38, 0.9)" }}>
                                        <Zap size={14} /> Kedipkan mata Anda…
                                    </div>
                                    <div className="rec-countdown">{countdown}</div>
                                </div>
                            )}
                        </div>

                        <div className="camera-card-bottom">
                            <div className="camera-controls-row">
                                <button
                                    className="btn-capture-big blue-theme"
                                    onClick={() => startLivenessFlow(true)}
                                    disabled={capturing || loading || !cameraReady}
                                >
                                    {capturing ? (
                                        <RefreshCw size={20} className="spin" />
                                    ) : (
                                        <ScanFace size={20} />
                                    )}
                                    {capturing
                                        ? "Merekam…"
                                        : "Mulai Perekaman & Perbarui"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="camera-side-panel">
                        <div className="guideline-card">
                            <h4 className="side-card-title" style={{ fontSize: "0.9rem", margin: 0 }}>
                                <Info size={16} color="#dc2626" />
                                Panduan Perbarui Wajah:
                            </h4>
                            <div className="guideline-list">
                                <div className="guideline-item">
                                    <div className="g-icon">
                                        <ShieldCheck size={14} />
                                    </div>
                                    <div>
                                        <b>Wajah Jelas &amp; Terang:</b> Pencahayaan cukup, tidak memakai masker/kacamata hitam.
                                    </div>
                                </div>
                                <div className="guideline-item">
                                    <div className="g-icon">
                                        <Zap size={14} />
                                    </div>
                                    <div>
                                        <b>Kedipkan Mata:</b> Sistem memverifikasi wajah asli lewat kedipan saat merekam ~3 detik.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Camera Capture Workspace — flow presensi / daftar+absen */
                <div className="camera-workspace">
                    {/* Viewfinder Column */}
                    <div className="camera-main-card">
                        <div className="camera-card-top">
                            <h3 className="camera-card-title">
                                {isFirstTime ? (
                                    <>
                                        <ScanFace size={18} color="#2563eb" />
                                        {capturing
                                            ? `Merekam… ${countdown}s`
                                            : "Kamera Pendaftaran & Presensi"}
                                    </>
                                ) : (
                                    <>
                                        <Camera size={18} color="#dc2626" />
                                        {capturing
                                            ? `Merekam… ${countdown}s`
                                            : "Kamera Presensi Harian"}
                                    </>
                                )}
                            </h3>
                            <div className="camera-live-badge">
                                <span className="live-dot"></span>
                                {capturing ? "Sedang merekam" : "Live Viewfinder"}
                            </div>
                        </div>

                        <div className="viewfinder-box">
                            {!capturing && !cameraReady && !cameraError && (
                                <div className="camera-state-overlay">
                                    <div className="spinner"></div>
                                    <span style={{ fontWeight: 600 }}>Menghubungkan ke kamera...</span>
                                    <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                                        Mohon izinkan akses kamera pada peramban Anda.
                                    </span>
                                </div>
                            )}

                            {cameraError && (
                                <div className="camera-state-overlay error-state">
                                    <AlertCircle size={40} />
                                    <span style={{ fontWeight: 700, fontSize: "1rem" }}>
                                        Kamera Tidak Dapat Dibuka
                                    </span>
                                    <p>{cameraError}</p>
                                    <button
                                        className="btn-absen primary"
                                        onClick={startCamera}
                                        style={{ marginTop: "0.5rem" }}
                                    >
                                        <RotateCcw size={16} /> Coba Hubungkan Ulang
                                    </button>
                                </div>
                            )}

                            <video
                                ref={videoRef}
                                className="viewfinder-video"
                                playsInline
                                muted
                                style={{ display: cameraError ? "none" : "block" }}
                            />

                            {capturing && (
                                <div className="camera-hud-overlay">
                                    <div className="hud-corner top-left"></div>
                                    <div className="hud-corner top-right"></div>
                                    <div className="hud-corner bottom-left"></div>
                                    <div className="hud-corner bottom-right"></div>
                                    <div className="hud-bottom-info" style={{ background: "rgba(220, 38, 38, 0.9)" }}>
                                        <Zap size={14} /> Kedipkan mata Anda…
                                    </div>
                                    <div className="rec-countdown">{countdown}</div>
                                </div>
                            )}
                            <canvas ref={canvasRef} className="d-none" />
                        </div>

                        <div className="camera-card-bottom">
                            <div className="camera-controls-row">
                                <button
                                    className={`btn-capture-big ${isFirstTime ? "blue-theme" : ""}`}
                                    onClick={() => startLivenessFlow(isFirstTime)}
                                    disabled={capturing || loading || !cameraReady || !!cameraError}
                                >
                                    {capturing ? (
                                        <RefreshCw size={20} className="spin" />
                                    ) : isFirstTime ? (
                                        <ScanFace size={20} />
                                    ) : (
                                        <Camera size={20} />
                                    )}
                                    {capturing
                                        ? "Merekam…"
                                        : isFirstTime
                                        ? "Daftarkan & Presensi"
                                        : "Ambil Presensi"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Side Panel */}
                    <div className="camera-side-panel">
                        {!isFirstTime && user?.foto && (
                            <div className="registered-face-card">
                                <div className="registered-face-preview">
                                    <img src={user.foto} alt="Foto Referensi" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>
                                        Wajah Referensi Anda
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>
                                        Terdaftar &amp; Aktif
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isFirstTime && (
                            <div className="side-form-card">
                                <h4 className="side-card-title">
                                    <Sparkles size={18} color="#dc2626" />
                                    Keterangan / Catatan
                                </h4>

                                <div className="quick-chips-label">Pilih Catatan Cepat:</div>
                                <div className="quick-chips-wrap">
                                    {QUICK_CHIPS.map((chip) => (
                                        <button
                                            key={chip}
                                            type="button"
                                            className={`quick-chip-btn ${
                                                keterangan.includes(chip) ? "active" : ""
                                            }`}
                                            onClick={() => handleChipClick(chip)}
                                        >
                                            {chip}
                                        </button>
                                    ))}
                                </div>

                                <div className="input-with-icon">
                                    <textarea
                                        rows="3"
                                        className="form-control"
                                        placeholder="Tulis keterangan tambahan jika diperlukan (opsional)..."
                                        value={keterangan}
                                        maxLength={255}
                                        onChange={(e) => setKeterangan(e.target.value)}
                                    />
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "0.725rem", color: "#94a3b8" }}>
                                    <span>Maksimal 255 karakter</span>
                                    <span>{keterangan.length}/255</span>
                                </div>
                            </div>
                        )}

                        <div className="guideline-card">
                            <h4 className="side-card-title" style={{ fontSize: "0.9rem", margin: 0 }}>
                                <Info size={16} color="#dc2626" />
                                {isFirstTime
                                    ? "Panduan Daftar & Presensi:"
                                    : "Ketentuan Presensi Online:"}
                            </h4>
                            <div className="guideline-list">
                                <div className="guideline-item">
                                    <div className="g-icon">
                                        <ShieldCheck size={14} />
                                    </div>
                                    <div>
                                        <b>Wajah Jelas &amp; Terang:</b> Pastikan pencahayaan cukup, tidak memakai masker/kacamata hitam.
                                    </div>
                                </div>
                                <div className="guideline-item">
                                    <div className="g-icon">
                                        <Zap size={14} />
                                    </div>
                                    <div>
                                        <b>Kedipkan Mata:</b> Sistem merekam ~{CAPTURE_SECONDS} detik & memverifikasi wajah asli lewat kedipan.
                                    </div>
                                </div>
                                <div className="guideline-item">
                                    <div className="g-icon">
                                        <Clock size={14} />
                                    </div>
                                    <div>
                                        <b>Batas Waktu Hadir:</b> Presensi sebelum pukul <b>07:00 WIB</b> tercatat <b>Hadir</b>, setelahnya <b>Terlambat</b>.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AbsensiAmbil;
