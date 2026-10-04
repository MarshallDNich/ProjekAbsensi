import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { getKelasById } from "../../services/kelasService";
import { getAllSiswa } from "../../services/siswaService";
import { createSiswa, updateSiswa } from "../../services/siswaService";
import {
    ArrowLeft,
    School,
    Users,
    UserCircle,
    GraduationCap,
    BookOpen,
    UserPlus,
    Trash2,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import Swal from "sweetalert2";
import "./Kelas.css";

function KelasDetail({ kelasId, onClose, onUpdated }) {
    const { token } = useAuth();

    const [kelas, setKelas] = useState(null);
    const [siswaList, setSiswaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedStudent, setSelectedStudent] = useState("");
    const [saving, setSaving] = useState(false);
    const [removingId, setRemovingId] = useState(null);

    const fetchDetail = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getKelasById(token, kelasId);
            if (res.data?.success) {
                setKelas(res.data.data);
            } else {
                setError("Data kelas tidak ditemukan.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Gagal memuat detail kelas.");
        } finally {
            setLoading(false);
        }
    }, [token, kelasId]);

    const fetchSiswa = useCallback(async () => {
        try {
            const res = await getAllSiswa(token, { per_page: 100 });
            setSiswaList(res.data?.data || []);
        } catch {
            setSiswaList([]);
        }
    }, [token]);

    useEffect(() => {
        fetchDetail();
        fetchSiswa();
    }, [fetchDetail, fetchSiswa]);

    const refresh = async () => {
        await fetchDetail();
        await fetchSiswa();
        onUpdated?.();
    };

    const memberUserIds = new Set((kelas?.siswa || []).map((s) => s.user_id));

    const availableStudents = siswaList.filter((s) => !memberUserIds.has(s.id));

    const handleAddStudent = async () => {
        if (!selectedStudent) {
            Swal.fire("Pilih Siswa", "Silakan pilih siswa yang ingin dimasukkan ke kelas terlebih dahulu.", "warning");
            return;
        }

        setSaving(true);
        const student = siswaList.find((s) => String(s.id) === String(selectedStudent));

        try {
            if (!student) {
                throw new Error("Siswa tidak ditemukan.");
            }

            if (student.siswa) {
                await updateSiswa(token, student.siswa.id, { kelas_id: kelas.id });
            } else {
                await createSiswa(token, { user_id: student.id, kelas_id: kelas.id });
            }

            Swal.fire("Berhasil", `${student.nama} berhasil dimasukkan ke kelas ${kelas.nama_kelas}.`, "success");
            setSelectedStudent("");
            await refresh();
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || err.message || "Gagal memasukkan siswa ke kelas.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveStudent = async (member) => {
        const result = await Swal.fire({
            title: "Keluarkan Siswa?",
            html: `Yakin ingin mengeluarkan <strong>${member.nama}</strong> dari kelas <strong>${kelas.nama_kelas}</strong>?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, Keluarkan",
            cancelButtonText: "Batal",
        });

        if (!result.isConfirmed) return;

        setRemovingId(member.id);
        try {
            await updateSiswa(token, member.id, { kelas_id: null });
            Swal.fire("Berhasil", `${member.nama} berhasil dikeluarkan dari kelas.`, "success");
            await refresh();
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || "Gagal mengeluarkan siswa dari kelas.", "error");
        } finally {
            setRemovingId(null);
        }
    };

    if (loading) {
        return (
            <div className="kelas-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="kelas-page">
                <div className="page-header-bar">
                    <div className="page-header-left">
                        <h2>Detail Kelas</h2>
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

    const waliNama =
        kelas?.wali_kelas_guru?.user?.nama ||
        kelas?.wali_kelas_guru?.nama ||
        null;

    return (
        <div className="kelas-page">
            <div className="page-header-bar">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <button className="u-btn-cancel" onClick={onClose} style={{ padding: "0.5rem 1rem" }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 style={{ margin: 0 }}>Detail Kelas</h2>
                        <p style={{ margin: "0.1rem 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                            Informasi kelas, wali kelas, dan daftar siswa
                        </p>
                    </div>
                </div>
            </div>

            <div className="kelas-detail-grid">
                {/* Left: Info kelas */}
                <div className="kelas-detail-col">
                    <div className="kelas-info-card">
                        <div className="kelas-banner-icon" style={{ boxShadow: "none" }}>
                            <School size={28} />
                        </div>
                        <h3 className="kelas-detail-name">
                            {kelas.nama_kelas}
                            <span className="tingkat-badge">{kelas.tingkat}</span>
                        </h3>
                        <p className="kelas-detail-sub">
                            {kelas.jurusan}
                        </p>
                        <div style={{ marginTop: "0.5rem" }}>
                            <span className="kelas-detail-chip">
                                <Users size={14} />
                                {kelas.total_siswa || 0} Siswa
                            </span>
                            {waliNama && (
                                <span className="kelas-detail-chip">
                                    <GraduationCap size={14} />
                                    Wali: {waliNama}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="guru-card">
                        <div className="guru-card-body" style={{ textAlign: "left" }}>
                            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#0f172a", margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <UserCircle size={18} className="text-danger" />
                                Wali Kelas
                            </h4>
                            {waliNama ? (
                                <div className="kelas-wali">
                                    <div className="kelas-wali-avatar">
                                        {waliNama.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="kelas-wali-info">
                                        <div className="kelas-wali-label">Wali Kelas</div>
                                        <div className="kelas-wali-name">{waliNama}</div>
                                        <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                                            {kelas.wali_kelas_guru?.user?.email || "Guru aktif"}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="kelas-wali">
                                    <div className="kelas-wali-avatar" style={{ background: "#94a3b8" }}>
                                        <UserCircle size={18} />
                                    </div>
                                    <div className="kelas-wali-info">
                                        <div className="kelas-wali-name" style={{ color: "#94a3b8", fontStyle: "italic" }}>
                                            Belum ada wali kelas
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Member management */}
                <div className="kelas-detail-col">
                    {/* Add member panel */}
                    <div className="add-member-panel">
                        <p className="add-member-title">
                            <UserPlus size={18} className="text-danger" />
                            Masukkan / Pindahkan Siswa ke Kelas
                        </p>
                        <div className="add-member-row">
                            <select
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                            >
                                <option value="">-- Pilih Siswa --</option>
                                {availableStudents.map((s) => {
                                    const current = s.siswa?.kelas
                                        ? `${s.siswa.kelas.nama_kelas}`
                                        : "Belum ada kelas";
                                    return (
                                        <option key={s.id} value={s.id}>
                                            {s.nama} — {current}
                                        </option>
                                    );
                                })}
                            </select>
                            <button
                                className="btn-action btn-primary"
                                onClick={handleAddStudent}
                                disabled={saving}
                                style={{ flex: "0 0 auto", minWidth: 130, opacity: saving ? 0.6 : 1 }}
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw size={16} className="spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={16} />
                                        Tambahkan
                                    </>
                                )}
                            </button>
                        </div>
                        {availableStudents.length === 0 && (
                            <p className="kelas-detail-text empty" style={{ margin: 0 }}>
                                Semua siswa sudah berada di kelas ini.
                            </p>
                        )}
                    </div>

                    {/* Members list */}
                    <div className="kelas-members-card">
                        <div className="kelas-card-body">
                            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Users size={18} className="text-danger" />
                                Daftar Siswa ({kelas.siswa?.length || 0})
                            </h4>
                        </div>

                        {kelas.siswa && kelas.siswa.length > 0 ? (
                            kelas.siswa.map((member) => (
                                <div key={member.id} className="kelas-member">
                                    {member.foto ? (
                                        <img
                                            src={member.foto}
                                            alt={member.nama}
                                            style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                                        />
                                    ) : (
                                        <div className="kelas-member-avatar">
                                            {member.nama?.charAt(0)?.toUpperCase() || "?"}
                                        </div>
                                    )}
                                    <div className="kelas-member-info">
                                        <div className="kelas-member-name">{member.nama}</div>
                                        <div className="kelas-member-meta">{member.email}</div>
                                        {member.nisn && (
                                            <span className="kelas-member-nisn">NISN: {member.nisn}</span>
                                        )}
                                    </div>
                                    <button
                                        className="btn-remove-member"
                                        onClick={() => handleRemoveStudent(member)}
                                        disabled={removingId === member.id}
                                    >
                                        {removingId === member.id ? (
                                            <RefreshCw size={14} className="spin" />
                                        ) : (
                                            <Trash2 size={14} />
                                        )}
                                        Keluarkan
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="kelas-members-empty">
                                <BookOpen size={44} />
                                <p>Belum ada siswa di kelas ini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default KelasDetail;