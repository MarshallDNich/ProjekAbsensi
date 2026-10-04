import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getRiwayatSaya } from "../../services/absensiService";
import { getPengajuanList, createPengajuan } from "../../services/pengajuanIzinService";
import {
    Camera,
    AlertCircle,
    CalendarCheck,
    CheckCircle2,
    Clock,
    History,
    Sparkles,
    Filter,
    Layers,
    Calendar,
    ChevronLeft,
    ChevronRight,
    FileText,
    Send,
    File,
    X,
    ScanFace,
} from "lucide-react";
import Swal from "sweetalert2";
import "./Absensi.css";
import "../users/Users.css";

function todayStr() {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d - tzOffset).toISOString().slice(0, 10);
}

const STATUS_MAP = {
    Hadir: "badge-hadir",
    Terlambat: "badge-terlambat",
    Izin: "badge-izin",
    Sakit: "badge-sakit",
    Alpha: "badge-alpha",
};

const LABEL_JENIS = { izin: "Izin", sakit: "Sakit", dispensasi: "Dispensasi" };

function StatusBadge({ status }) {
    return (
        <span className={`absen-badge ${STATUS_MAP[status] || "badge-secondary"}`}>
            {status === "Hadir" && <CheckCircle2 size={12} />}
            {status === "Terlambat" && <Clock size={12} />}
            {status === "Izin" && <Sparkles size={12} />}
            {status}
        </span>
    );
}

function AbsensiSiswa() {
    const { token, user, updateUser } = useAuth();
    const navigate = useNavigate();

    // ====== Riwayat State ======
    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [sudahAbsenHariIni, setSudahAbsenHariIni] = useState(false);
    const [todayAbsenData, setTodayAbsenData] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");

    // ====== Pengajuan Izin State ======
    const [pengajuanData, setPengajuanData] = useState([]);
    const [pengajuanLoading, setPengajuanLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("riwayat");
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        tanggal_mulai: todayStr(),
        tanggal_selesai: todayStr(),
        jenis: "izin",
        alasan: "",
        bukti: null,
    });
    const [fileName, setFileName] = useState("");

    // Refresh user data on mount
    useEffect(() => {
        const refreshUserData = async () => {
            try {
                const meRes = await import('../../services/authService').then(m => m.me(token));
                updateUser(meRes.data.data);
                console.log('User data refreshed:', meRes.data.data);
            } catch (e) {
                console.warn('Failed to refresh user data:', e);
            }
        };
        refreshUserData();
    }, [token, updateUser]);

    // ====== Fetch ======
    const fetchRiwayat = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, per_page: 15, status: selectedStatus || undefined };
            const res = await getRiwayatSaya(token, params);
            const items = res.data.data || [];
            setData(items);
            setMeta(res.data.meta || {});
            const today = todayStr();
            const foundToday = items.find((a) => a.tanggal === today);
            if (foundToday) { setSudahAbsenHariIni(true); setTodayAbsenData(foundToday); }
        } catch (err) {
            Swal.fire("Error", "Gagal mengambil riwayat absensi", "error");
        } finally {
            setLoading(false);
        }
    }, [token, selectedStatus]);

    const fetchPengajuan = useCallback(async () => {
        setPengajuanLoading(true);
        try {
            const res = await getPengajuanList(token);
            setPengajuanData(res.data?.data || []);
        } catch (err) { /* abaikan */ } finally {
            setPengajuanLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchRiwayat(); fetchPengajuan(); }, [fetchRiwayat, fetchPengajuan]);

    // ====== Pengajuan Izin Logic ======
    const resetForm = () => {
        setForm({ tanggal_mulai: todayStr(), tanggal_selesai: todayStr(), jenis: "izin", alasan: "", bukti: null });
        setFileName("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.bukti) {
            Swal.fire("Peringatan", "Bukti/surat wajib diunggah.", "warning");
            return;
        }
        setSubmitting(true);
        try {
            await createPengajuan(token, form);
            Swal.fire("Berhasil", "Pengajuan izin berhasil diajukan.", "success");
            setModalOpen(false);
            resetForm();
            fetchPengajuan();
        } catch (err) {
            const errors = err?.response?.data?.errors;
            if (errors) {
                Swal.fire({ icon: "error", title: "Validasi Gagal", html: Object.values(errors).flat().join("<br/>"), confirmButtonColor: "#dc2626" });
            } else {
                Swal.fire("Error", err?.response?.data?.message || "Gagal mengajukan izin.", "error");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const openModal = () => { resetForm(); setModalOpen(true); };

    // Jika sudah absen hari ini, izin hanya bisa mulai besok
    const minTanggalMulai = sudahAbsenHariIni
        ? new Date(Date.now() + 86400000).toISOString().slice(0, 10)
        : todayStr();
    const minTanggalSelesai = form.tanggal_mulai || minTanggalMulai;

    // ====== Stats ======
    const totalRecords = data.length;
    const hadirCount = data.filter((d) => d.status === "Hadir").length;
    const terlambatCount = data.filter((d) => d.status === "Terlambat").length;
    const izinSakitCount = data.filter((d) => d.status === "Izin" || d.status === "Sakit").length;
    const filteredData = selectedMonth ? data.filter((d) => d.tanggal?.startsWith(selectedMonth)) : data;

    return (
        <div className="absen-page-container">
            {/* ======== Header ======== */}
            <div className="absen-header-hero">
                <div>
                    <h1 className="absen-header-title">
                        <span className="title-icon"><History size={20} /></span>
                        Presensi & Pengajuan Izin
                    </h1>
                    <p className="absen-header-subtitle">
                        {activeTab === "riwayat"
                            ? "Catatan kehadiran harian, waktu masuk, dan status presensi Anda."
                            : "Daftar pengajuan izin/sakit dan status verifikasi."}
                    </p>
                </div>
                <div className="absen-header-right" style={{ gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {activeTab === "riwayat" && (
                        !user?.siswa?.has_face_profile ? (
                            <button className="btn-absen primary" onClick={() => navigate("/absensi/siswa/ambil")}>
                                <ScanFace size={18} /> Daftarkan Wajah
                            </button>
                        ) : !sudahAbsenHariIni ? (
                            <button className="btn-absen primary" onClick={() => navigate("/absensi/siswa/ambil")}>
                                <Camera size={18} /> Ambil Presensi
                            </button>
                        ) : (
                            <button className="btn-absen success" onClick={() => navigate("/absensi/siswa/ambil")}>
                                <CheckCircle2 size={18} /> Sudah Absen Hari Ini
                            </button>
                        )
                    )}
                    {activeTab === "pengajuan" && (
                        <button className="btn-absen primary" onClick={openModal}>
                            <Send size={16} /> Ajukan Izin
                        </button>
                    )}
                </div>
            </div>

            {/* ======== Attendance Status Banner ======== */}
            {sudahAbsenHariIni && todayAbsenData && activeTab === "riwayat" && (
                <div style={{
                    background: todayAbsenData.status === "Terlambat" ? "#fff7ed" : "#ecfdf5",
                    border: `1.5px solid ${todayAbsenData.status === "Terlambat" ? "#fed7aa" : "#a7f3d0"}`,
                    borderRadius: "16px", padding: "1rem 1.25rem", marginBottom: "1.5rem",
                    display: "flex", alignItems: "center", gap: "0.75rem",
                }}>
                    <div style={{
                        width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
                        background: todayAbsenData.status === "Terlambat" ? "#ffedd5" : "#d1fae5",
                        color: todayAbsenData.status === "Terlambat" ? "#ea580c" : "#059669",
                    }}>
                        <CalendarCheck size={20} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem" }}>Presensi Hari Ini Sudah Tercatat</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                            Masuk: <b>{todayAbsenData.jam_masuk || "-"} WIB</b> • Status: <StatusBadge status={todayAbsenData.status} />
                        </div>
                    </div>
                </div>
            )}

            {/* ======== Tab Switcher ======== */}
            <div style={{
                display: "flex", background: "#f1f5f9", borderRadius: "14px", padding: "4px", gap: "4px", marginBottom: "1.5rem",
            }}>
                <button
                    type="button"
                    onClick={() => setActiveTab("riwayat")}
                    style={{
                        flex: 1, padding: "0.65rem 1rem", borderRadius: "10px", border: "none",
                        fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center", gap: "0.5rem",
                        background: activeTab === "riwayat" ? "#fff" : "transparent",
                        color: activeTab === "riwayat" ? "#0f172a" : "#64748b",
                        boxShadow: activeTab === "riwayat" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                    }}
                >
                    <History size={16} /> Riwayat Kehadiran
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("pengajuan")}
                    style={{
                        flex: 1, padding: "0.65rem 1rem", borderRadius: "10px", border: "none",
                        fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center", gap: "0.5rem",
                        background: activeTab === "pengajuan" ? "#fff" : "transparent",
                        color: activeTab === "pengajuan" ? "#dc2626" : "#64748b",
                        boxShadow: activeTab === "pengajuan" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                    }}
                >
                    <FileText size={16} /> Pengajuan Izin
                    {pengajuanData.length > 0 && (
                        <span className="count-pill" style={{ marginLeft: "0.25rem" }}>{pengajuanData.length}</span>
                    )}
                </button>
            </div>

            {/* ==================== TAB: RIWAYAT ==================== */}
            {activeTab === "riwayat" && (
                <>
                    <div className="absen-stats-grid">
                        <div className="absen-stat-card stat-hadir">
                            <div className="absen-stat-icon"><CheckCircle2 size={22} /></div>
                            <div className="absen-stat-info">
                                <div className="absen-stat-label">Hadir</div>
                                <div className="absen-stat-value">{hadirCount}</div>
                            </div>
                        </div>
                        <div className="absen-stat-card stat-terlambat">
                            <div className="absen-stat-icon"><Clock size={22} /></div>
                            <div className="absen-stat-info">
                                <div className="absen-stat-label">Terlambat</div>
                                <div className="absen-stat-value">{terlambatCount}</div>
                            </div>
                        </div>
                        <div className="absen-stat-card stat-izin">
                            <div className="absen-stat-icon"><Sparkles size={22} /></div>
                            <div className="absen-stat-info">
                                <div className="absen-stat-label">Izin / Sakit</div>
                                <div className="absen-stat-value">{izinSakitCount}</div>
                            </div>
                        </div>
                        <div className="absen-stat-card stat-alpha">
                            <div className="absen-stat-icon"><Layers size={22} /></div>
                            <div className="absen-stat-info">
                                <div className="absen-stat-label">Total Presensi</div>
                                <div className="absen-stat-value">{meta.total ?? totalRecords}</div>
                            </div>
                        </div>
                    </div>

                    <div className="absen-filter-card">
                        <div className="filter-grid-row">
                            <div className="filter-col">
                                <label><Calendar size={13} /> Filter Bulan</label>
                                <input type="month" className="form-control" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
                            </div>
                            <div className="filter-col flex-grow">
                                <label><Filter size={13} /> Status Kehadiran</label>
                                <div className="status-tabs-row" style={{ marginTop: 0, paddingTop: 0, border: "none" }}>
                                    {[{ val: "", label: "Semua" }, { val: "Hadir", label: "Hadir" }, { val: "Terlambat", label: "Terlambat" }, { val: "Izin", label: "Izin" }, { val: "Sakit", label: "Sakit" }].map((tab) => (
                                        <button key={tab.val} type="button" className={`status-tab-btn ${selectedStatus === tab.val ? "active" : ""}`} onClick={() => setSelectedStatus(tab.val)}>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state"><div className="spinner" /><p style={{ marginTop: "1rem", color: "#64748b", fontWeight: 600 }}>Memuat riwayat...</p></div>
                    ) : !user?.siswa?.has_face_profile ? (
                        <div className="empty-state" style={{ background: "#fef3c7", border: "2px dashed #f59e0b", borderRadius: "16px", padding: "2.5rem" }}>
                            <ScanFace size={48} style={{ color: "#f59e0b" }} />
                            <h3 style={{ marginTop: "1rem", color: "#92400e", fontWeight: 700, fontSize: "1.1rem" }}>Wajah Belum Terdaftar</h3>
                            <p style={{ color: "#78350f", fontSize: "0.9rem", marginTop: "0.5rem", maxWidth: "400px" }}>
                                Anda belum dapat melihat riwayat presensi. Silakan ambil presensi untuk mendaftarkan wajah Anda terlebih dahulu.
                            </p>
                            <button 
                                className="btn-absen primary" 
                                style={{ marginTop: "1.5rem" }}
                                onClick={() => navigate("/absensi/siswa/ambil")}
                            >
                                <Camera size={18} /> Daftarkan Wajah & Ambil Presensi
                            </button>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="empty-state"><AlertCircle size={44} /><p>Belum ada riwayat untuk filter ini.</p></div>
                    ) : (
                        <div className="absen-table-container">
                            <div className="table-top-bar">
                                <div className="table-count-text">Riwayat Presensi <span className="count-pill">{meta.total ?? filteredData.length}</span></div>
                            </div>
                            <div className="table-responsive">
                                <table className="modern-absen-table">
                                    <thead><tr><th style={{ width: "50px" }}>#</th><th>Tanggal</th><th>Waktu Masuk</th><th>Status</th><th>Keterangan</th></tr></thead>
                                    <tbody>
                                        {filteredData.map((item, idx) => (
                                            <tr key={item.id}>
                                                <td style={{ fontWeight: 700, color: "#94a3b8" }}>{(meta.current_page ? (meta.current_page - 1) * meta.per_page : 0) + idx + 1}</td>
                                                <td style={{ fontWeight: 700, color: "#0f172a" }}>{item.tanggal}</td>
                                                <td><span className="time-cell-badge"><Clock size={13} color="#64748b" />{item.jam_masuk || "-"}</span></td>
                                                <td><StatusBadge status={item.status} /></td>
                                                <td style={{ color: item.keterangan ? "#334155" : "#94a3b8", fontSize: "0.825rem" }}>{item.keterangan || "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {meta.last_page > 1 && (
                                <div className="absen-pagination-bar">
                                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Halaman <b>{meta.current_page}</b> dari <b>{meta.last_page}</b></span>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button className="page-nav-btn" disabled={meta.current_page <= 1} onClick={() => fetchRiwayat(meta.current_page - 1)}><ChevronLeft size={16} /> Sebelumnya</button>
                                        <button className="page-nav-btn" disabled={meta.current_page >= meta.last_page} onClick={() => fetchRiwayat(meta.current_page + 1)}>Berikutnya <ChevronRight size={16} /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ==================== TAB: PENGAJUAN IZIN ==================== */}
            {activeTab === "pengajuan" && (
                <>
                    {pengajuanLoading ? (
                        <div className="loading-state" style={{ padding: "3rem" }}>
                            <div className="spinner" />
                            <p style={{ marginTop: "1rem", color: "#64748b", fontWeight: 600 }}>Memuat pengajuan...</p>
                        </div>
                    ) : pengajuanData.length === 0 ? (
                        <div className="empty-state">
                            <FileText size={44} />
                            <p>Belum ada pengajuan izin. Klik "Ajukan Izin" untuk membuat baru.</p>
                        </div>
                    ) : (
                        <div className="absen-table-container">
                            <div className="table-top-bar">
                                <div className="table-count-text">
                                    Pengajuan Izin Saya
                                    <span className="count-pill">{pengajuanData.length} data</span>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="modern-absen-table">
                                    <thead>
                                        <tr>
                                            <th>Periode</th>
                                            <th>Jenis</th>
                                            <th>Alasan</th>
                                            <th>Status</th>
                                            <th>Bukti</th>
                                            <th>Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pengajuanData.map((item) => {
                                            const STATUS_PENGAJUAN = {
                                                pending: "badge-terlambat",
                                                approved: "badge-hadir",
                                                rejected: "badge-alpha",
                                            };
                                            const STATUS_LABEL = {
                                                pending: "Menunggu",
                                                approved: "Disetujui",
                                                rejected: "Ditolak",
                                            };
                                            return (
                                                <tr key={item.id}>
                                                    <td style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.825rem" }}>
                                                        {item.tanggal_mulai} → {item.tanggal_selesai}
                                                    </td>
                                                    <td><span className="absen-badge badge-izin" style={{ fontSize: "0.72rem" }}>{LABEL_JENIS[item.jenis] || item.jenis}</span></td>
                                                    <td style={{ maxWidth: "220px" }}>{item.alasan || "—"}</td>
                                                    <td>
                                                        <span className={`absen-badge ${STATUS_PENGAJUAN[item.status] || "badge-secondary"}`}>
                                                            {STATUS_LABEL[item.status] || item.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {item.bukti ? (
                                                            <a className="absen-badge badge-izin" href={item.bukti} target="_blank" rel="noopener noreferrer"
                                                                style={{ fontSize: "0.72rem", textDecoration: "none", cursor: "pointer" }}>
                                                                <File size={12} /> Buka
                                                            </a>
                                                        ) : <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>—</span>}
                                                    </td>
                                                    <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                                                        {item.status === "pending" ? <em style={{ color: "#94a3b8" }}>Menunggu verifikasi</em> : (item.catatan_verifikator || "—")}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ======== Modal: Ajukan Izin ======== */}
            {modalOpen && (
                <div className="u-modal-overlay" onClick={() => { setModalOpen(false); resetForm(); }}>
                    <div className="u-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="u-modal-header">
                            <div className="u-modal-header-info">
                                <h3>Ajukan Izin / Sakit / Dispensasi</h3>
                                <p>Isi formulir berikut untuk mengajukan surat izin kepada wali kelas / admin.</p>
                            </div>
                            <button type="button" className="u-modal-close" onClick={() => { setModalOpen(false); resetForm(); }}>
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
                        >
                            <div className="u-modal-body">
                                {/* Tanggal */}
                                <div className="u-form-row">
                                    <div className="u-form-group flex-1">
                                        <label className="u-form-label">Tanggal Mulai <span className="req">*</span></label>
                                        <input type="date" className="u-form-control" min={minTanggalMulai} value={form.tanggal_mulai} onChange={(e) => setForm({ ...form, tanggal_mulai: e.target.value, tanggal_selesai: e.target.value < form.tanggal_selesai ? form.tanggal_selesai : form.tanggal_selesai })} required />
                                        {sudahAbsenHariIni && (
                                            <span className="u-form-hint">Karena sudah absen hari ini, izin hanya bisa dimulai besok.</span>
                                        )}
                                    </div>
                                    <div className="u-form-group flex-1">
                                        <label className="u-form-label">Tanggal Selesai <span className="req">*</span></label>
                                        <input type="date" className="u-form-control" min={minTanggalSelesai} value={form.tanggal_selesai} onChange={(e) => setForm({ ...form, tanggal_selesai: e.target.value })} required />
                                    </div>
                                </div>

                                {/* Jenis */}
                                <div className="u-form-group">
                                    <label className="u-form-label">Jenis Pengajuan <span className="req">*</span></label>
                                    <div style={{ display: "flex", gap: "0.6rem" }}>
                                        {[
                                            { val: "izin", label: "Izin", color: "#2563eb" },
                                            { val: "sakit", label: "Sakit", color: "#ea580c" },
                                            { val: "dispensasi", label: "Dispensasi", color: "#7c3aed" },
                                        ].map((opt) => (
                                            <button
                                                key={opt.val}
                                                type="button"
                                                onClick={() => setForm({ ...form, jenis: opt.val })}
                                                style={{
                                                    flex: 1, padding: "0.65rem 0.75rem", borderRadius: "10px",
                                                    border: `1.5px solid ${form.jenis === opt.val ? opt.color : "#e2e8f0"}`,
                                                    background: form.jenis === opt.val ? `${opt.color}12` : "#fff",
                                                    color: form.jenis === opt.val ? opt.color : "#64748b",
                                                    fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                                                    transition: "all 0.2s", fontFamily: "inherit",
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Alasan */}
                                <div className="u-form-group">
                                    <label className="u-form-label">Alasan <span className="req">*</span></label>
                                    <textarea
                                        className="u-form-control"
                                        rows={3}
                                        value={form.alasan}
                                        placeholder="Contoh: Menghadiri acara keluarga di luar kota"
                                        maxLength={500}
                                        onChange={(e) => setForm({ ...form, alasan: e.target.value })}
                                        required
                                        style={{ padding: "0.65rem 0.9rem", lineHeight: "1.5" }}
                                    />
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span className="u-form-hint">Jelaskan alasan pengajuan izin Anda</span>
                                        <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{form.alasan.length}/500</span>
                                    </div>
                                </div>

                                {/* Bukti */}
                                <div className="u-form-group">
                                    <label className="u-form-label">Dokumen Bukti <span className="req">*</span></label>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <label
                                            style={{
                                                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                                                padding: "0.6rem 1rem", borderRadius: "10px", border: "1.5px solid #cbd5e1",
                                                background: "#fff", color: "#475569", fontWeight: 600, fontSize: "0.85rem",
                                                cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
                                            }}
                                            htmlFor="bukti-absen"
                                        >
                                            <File size={15} /> Pilih File
                                        </label>
                                        <input
                                            id="bukti-absen"
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            style={{ display: "none" }}
                                            onChange={(e) => { const f = e.target.files[0]; setForm({ ...form, bukti: f }); setFileName(f ? f.name : ""); }}
                                            required
                                        />
                                        <span style={{ fontSize: "0.82rem", color: fileName ? "#0f172a" : "#94a3b8" }}>
                                            {fileName || "Belum ada file dipilih"}
                                        </span>
                                        {fileName && (
                                            <button type="button" onClick={() => { setForm({ ...form, bukti: null }); setFileName(""); }}
                                                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "2px" }}>
                                                <X size={15} />
                                            </button>
                                        )}
                                    </div>
                                    <span className="u-form-hint">Format: JPG, PNG, PDF — Maksimal 2MB</span>
                                </div>
                            </div>

                            <div className="u-modal-footer">
                                <button type="button" className="u-btn-cancel" onClick={() => { setModalOpen(false); resetForm(); }} disabled={submitting}>
                                    Batal
                                </button>
                                <button type="submit" className="u-btn-save" disabled={submitting}>
                                    {submitting ? "Mengirim..." : "Kirim Pengajuan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AbsensiSiswa;
