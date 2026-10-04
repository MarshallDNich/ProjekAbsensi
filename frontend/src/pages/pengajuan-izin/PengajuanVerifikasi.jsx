import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    getPengajuanList,
    approvePengajuan,
    rejectPengajuan,
} from "../../services/pengajuanIzinService";
import {
    FileText,
    ClipboardList,
    CheckCircle2,
    X,
    Eye,
    RefreshCw,
} from "lucide-react";
import Swal from "sweetalert2";
import "../absensi/Absensi.css";
import "../users/Users.css";

const LABEL_JENIS = { izin: "Izin", sakit: "Sakit", dispensasi: "Dispensasi" };

function PengajuanVerifikasi() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionModal, setActionModal] = useState(null);
    const [catatan, setCatatan] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user && user.role !== "Admin" && user.role !== "Guru") {
            navigate("/absensi/siswa", { replace: true });
        }
    }, [user, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getPengajuanList(token);
            setData(res.data?.data || []);
        } catch {
            Swal.fire("Error", "Gagal memuat daftar pengajuan.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAction = async () => {
        if (!actionModal) return;
        setSubmitting(true);
        try {
            if (actionModal.type === "approve") {
                await approvePengajuan(token, actionModal.item.id, catatan || null);
            } else {
                await rejectPengajuan(token, actionModal.item.id, catatan || null);
            }
            Swal.fire(
                "Berhasil",
                actionModal.type === "approve"
                    ? "Pengajuan disetujui. Absensi otomatis diperbarui."
                    : "Pengajuan ditolak.",
                "success"
            );
            setActionModal(null);
            setCatatan("");
            fetchData();
        } catch (err) {
            Swal.fire(
                "Gagal",
                err?.response?.data?.message ||
                Object.values(err?.response?.data?.errors || {}).flat().join(" ") ||
                "Gagal memverifikasi.",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="absen-page-container">
            {/* Header */}
            <div className="absen-header-hero">
                <div>
                    <h1 className="absen-header-title">
                        <span className="title-icon"><FileText size={20} /></span>
                        Verifikasi Pengajuan Izin
                    </h1>
                    <p className="absen-header-subtitle">
                        {user?.role === "Guru"
                            ? "Daftar izin yang belum diverifikasi untuk siswa di kelas Anda."
                            : "Setujui atau tolak pengajuan izin siswa. Absensi otomatis diperbarui saat disetujui."}
                    </p>
                </div>
                <button className="btn-print-report" onClick={fetchData}>
                    <RefreshCw size={15} /> Muat Ulang
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner" />
                    <p style={{ marginTop: "1rem", color: "#64748b", fontWeight: 600 }}>Memuat pengajuan...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="empty-state">
                    <ClipboardList size={44} />
                    <p>Tidak ada pengajuan izin yang perlu diverifikasi saat ini.</p>
                </div>
            ) : (
                <div className="absen-table-container">
                    <div className="table-top-bar">
                        <div className="table-count-text">
                            Perlu Verifikasi
                            <span className="count-pill">{data.length} data</span>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="modern-absen-table">
                            <thead>
                                <tr>
                                    <th>Siswa</th>
                                    <th>Kelas</th>
                                    <th>Periode</th>
                                    <th>Jenis</th>
                                    <th>Alasan</th>
                                    <th>Bukti</th>
                                    <th style={{ textAlign: "right" }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="student-meta-cell">
                                                <div className="student-meta-avatar">
                                                    {item.siswa?.user?.nama?.charAt(0).toUpperCase() || "S"}
                                                </div>
                                                <div>
                                                    <div className="student-meta-name">{item.siswa?.user?.nama || "—"}</div>
                                                    <div className="student-meta-sub">NISN: {item.siswa?.nisn || "—"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{item.siswa?.kelas?.nama_kelas || "—"}</td>
                                        <td style={{ fontFamily: "ui-monospace, Consolas, monospace", fontWeight: 600, fontSize: "0.825rem" }}>
                                            {item.tanggal_mulai} → {item.tanggal_selesai}
                                        </td>
                                        <td>
                                            <span className="absen-badge badge-izin" style={{ fontSize: "0.72rem" }}>
                                                {LABEL_JENIS[item.jenis] || item.jenis}
                                            </span>
                                        </td>
                                        <td style={{ maxWidth: "200px" }}>{item.alasan || "—"}</td>
                                        <td>
                                            {item.bukti ? (
                                                <a className="absen-badge badge-izin" href={item.bukti} target="_blank" rel="noopener noreferrer"
                                                    style={{ fontSize: "0.72rem", textDecoration: "none", cursor: "pointer" }}>
                                                    <Eye size={12} /> Lihat
                                                </a>
                                            ) : <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>—</span>}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                                                <button
                                                    type="button"
                                                    className="btn-action btn-detail"
                                                    style={{ flex: "none", padding: "0.4rem 0.75rem", fontSize: "0.75rem" }}
                                                    onClick={() => { setActionModal({ type: "approve", item }); setCatatan(""); }}
                                                >
                                                    <CheckCircle2 size={13} /> Setujui
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-action btn-delete"
                                                    style={{ flex: "none", padding: "0.4rem 0.75rem", fontSize: "0.75rem" }}
                                                    onClick={() => { setActionModal({ type: "reject", item }); setCatatan(""); }}
                                                >
                                                    <X size={13} /> Tolak
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ======== Modal: Approve / Reject ======== */}
            {actionModal && (
                <div className="u-modal-overlay" onClick={() => { setActionModal(null); setCatatan(""); }}>
                    <div className="u-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="u-modal-header">
                            <div className="u-modal-header-info">
                                <h3>{actionModal.type === "approve" ? "Setujui Pengajuan" : "Tolak Pengajuan"}</h3>
                                <p>
                                    {actionModal.item.siswa?.user?.nama} — {LABEL_JENIS[actionModal.item.jenis]}{" "}
                                    ({actionModal.item.tanggal_mulai} → {actionModal.item.tanggal_selesai})
                                </p>
                            </div>
                            <button type="button" className="u-modal-close" onClick={() => { setActionModal(null); setCatatan(""); }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="u-modal-body">
                            <div className="u-form-group">
                                <label className="u-form-label">Catatan Verifikator (opsional)</label>
                                <textarea
                                    className="u-form-control"
                                    rows={3}
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                    maxLength={500}
                                    placeholder={actionModal.type === "approve" ? "Catatan persetujuan..." : "Alasan penolakan..."}
                                    style={{ padding: "0.65rem 0.9rem", lineHeight: "1.5" }}
                                />
                            </div>
                        </div>

                        <div className="u-modal-footer">
                            <button type="button" className="u-btn-cancel" onClick={() => { setActionModal(null); setCatatan(""); }} disabled={submitting}>
                                Batal
                            </button>
                            {actionModal.type === "approve" ? (
                                <button type="button" className="u-btn-save" onClick={handleAction} disabled={submitting}>
                                    {submitting ? "Memproses..." : "Setujui"}
                                </button>
                            ) : (
                                <button type="button" className="u-btn-danger" onClick={handleAction} disabled={submitting}>
                                    {submitting ? "Memproses..." : "Tolak"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PengajuanVerifikasi;
