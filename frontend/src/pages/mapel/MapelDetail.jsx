import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMataPelajaranById } from "../../services/mataPelajaranService";
import {
    ArrowLeft,
    BookOpen,
    GraduationCap,
    School,
    AtSign,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import "./Mapel.css";

function MapelDetail({ mapelId, onClose }) {
    const { token } = useAuth();

    const [mapel, setMapel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDetail = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getMataPelajaranById(token, mapelId);
            if (res.data?.success) {
                setMapel(res.data.data);
            } else {
                setError("Data mata pelajaran tidak ditemukan.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Gagal memuat detail mata pelajaran.");
        } finally {
            setLoading(false);
        }
    }, [token, mapelId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    if (loading) {
        return (
            <div className="mapel-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mapel-page">
                <div className="page-header-bar">
                    <div className="page-header-left">
                        <h2>Detail Mata Pelajaran</h2>
                    </div>
                </div>
                <div className="empty-state" style={{ padding: "2.5rem 1rem" }}>
                    <AlertCircle size={48} />
                    <p>{error}</p>
                    <button
                        className="btn-action btn-primary"
                        onClick={fetchDetail}
                        style={{ margin: "1rem auto 0", flex: "0 0 auto", maxWidth: 200 }}
                    >
                        <RefreshCw size={16} />
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    const guruPengampu = mapel.guru_pengampu || [];
    const kelasList = mapel.kelas || [];

    return (
        <div className="mapel-page">
            <div className="page-header-bar">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <button className="u-btn-cancel" onClick={onClose} style={{ padding: "0.5rem 1rem" }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 style={{ margin: 0 }}>Detail Mata Pelajaran</h2>
                        <p style={{ margin: "0.1rem 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                            Informasi master data serta guru pengampu dan kelas pengguna
                        </p>
                    </div>
                </div>
            </div>

            <div className="mapel-detail-grid">
                {/* Left: Info mapel */}
                <div className="mapel-detail-col">
                    <div className="mapel-info-card">
                        <div className="mapel-banner-icon">
                            <BookOpen size={28} />
                        </div>
                        <h3 className="mapel-detail-name">
                            {mapel.nama}
                            <span className="mapel-kode">{mapel.kode}</span>
                        </h3>
                        {mapel.deskripsi && (
                            <p className="mapel-detail-desc">{mapel.deskripsi}</p>
                        )}
                        <div style={{ marginTop: "0.75rem" }}>
                            <span className={`status-badge ${mapel.status === "Aktif" ? "aktif" : "nonaktif"}`}>
                                {mapel.status}
                            </span>
                        </div>
                    </div>

                    <div className="mapel-stats">
                        <div className="mapel-stat-box">
                            <GraduationCap size={18} className="mapel-stat-icon" />
                            <div className="mapel-stat-value">{guruPengampu.length}</div>
                            <div className="mapel-stat-label">Guru Pengampu</div>
                        </div>
                        <div className="mapel-stat-box">
                            <School size={18} className="mapel-stat-icon" />
                            <div className="mapel-stat-value">{kelasList.length}</div>
                            <div className="mapel-stat-label">Kelas Pengguna</div>
                        </div>
                    </div>
                </div>

                {/* Right: Guru pengampu + Kelas */}
                <div className="mapel-detail-col">
                    <div className="mapel-section-card">
                        <h4 className="mapel-section-title">
                            <GraduationCap size={18} className="mapel-section-icon" />
                            Guru Pengampu ({guruPengampu.length})
                        </h4>

                        {guruPengampu.length > 0 ? (
                            <div className="mapel-member-list">
                                {guruPengampu.map((g) => (
                                    <div key={g.guru_id} className="mapel-member">
                                        {g.foto ? (
                                            <img
                                                src={g.foto}
                                                alt={g.nama}
                                                className="mapel-member-avatar"
                                            />
                                        ) : (
                                            <div className="mapel-member-avatar">
                                                {g.nama?.charAt(0)?.toUpperCase() || "?"}
                                            </div>
                                        )}
                                        <div className="mapel-member-info">
                                            <div className="mapel-member-name">{g.nama}</div>
                                            {g.email && (
                                                <div className="mapel-member-meta">
                                                    <AtSign size={12} />
                                                    {g.email}
                                                </div>
                                            )}
                                        </div>
                                        <span className="mapel-member-tag">Guru</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mapel-empty">
                                Belum ada guru yang mengampu mata pelajaran ini.
                            </p>
                        )}

                        <p className="mapel-section-note">
                            Guru pengampu berasal dari penugasan pada fitur Data Guru.
                        </p>
                    </div>

                    <div className="mapel-section-card">
                        <h4 className="mapel-section-title">
                            <School size={18} className="mapel-section-icon" />
                            Kelas yang Menggunakan ({kelasList.length})
                        </h4>

                        {kelasList.length > 0 ? (
                            <div className="mapel-chip-wrap">
                                {kelasList.map((k) => (
                                    <span key={k.kelas_id} className="mapel-chip">
                                        <School size={13} />
                                        {k.nama_kelas}
                                        <span className="mapel-chip-sub">
                                            {k.tingkat} • {k.jurusan || "-"}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="mapel-empty">
                                Belum ada kelas yang menggunakan mata pelajaran ini.
                            </p>
                        )}

                        <p className="mapel-section-note">
                            Relasi dengan kelas terbentuk dari kombinasi penugasan guru yang mengampu.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MapelDetail;