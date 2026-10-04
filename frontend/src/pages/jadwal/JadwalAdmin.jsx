import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    getTimetable,
    createJadwal,
    updateJadwal,
    deleteJadwal,
    getJadwalList,
} from "../../services/jadwalService";
import { getAllGuru } from "../../services/guruService";
import { getAllMataPelajaran } from "../../services/mataPelajaranService";
import { getAllKelas } from "../../services/kelasService";
import TimetableGrid from "./TimetableGrid";
import {
    CalendarDays,
    Settings,
    Trash2,
    Pencil,
} from "lucide-react";
import Swal from "sweetalert2";
import "../../pages/absensi/Absensi.css";
import "../../pages/users/Users.css";
import "./Jadwal.css";

const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

function getHariIndex() {
    const d = new Date().getDay();
    return d >= 1 && d <= 5 ? d - 1 : 0;
}

function JadwalAdmin() {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeHari, setActiveHari] = useState(HARI_LIST[getHariIndex()]);

    // Filter
    const [filterKelasId, setFilterKelasId] = useState("");

    // Modal state
    const [modal, setModal] = useState(null); // { mode: 'create'|'edit'|'detail', jadwal: {...}, jamId, kelasId }
    const [guruList, setGuruList] = useState([]);
    const [mapelList, setMapelList] = useState([]);
    const [selectedGuruId, setSelectedGuruId] = useState("");
    const [selectedMapelId, setSelectedMapelId] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const kelasList = timetable?.kelas || [];
    const jamList = timetable?.jam_pelajaran || [];

    // Filtered guru: hanya yang ditugaskan mengajar di kelas ini
    const filteredGuruList = useMemo(() => {
        if (!modal?.kelas?.id) return guruList;
        return guruList.filter((g) =>
            g.guru?.kelas?.some((k) => String(k.id) === String(modal.kelas.id))
        );
    }, [guruList, modal?.kelas?.id]);

    // Filtered mapel berdasarkan guru yang dipilih
    // guruList items: { id (user_id), guru: { id (guru_id), mata_pelajaran: [...] } }
    const filteredMapel = useMemo(() => {
        if (!selectedGuruId) return mapelList;
        const guru = guruList.find((g) => String(g.guru?.id) === String(selectedGuruId));
        const guruMapelNames = guru?.guru?.mata_pelajaran || [];
        if (guruMapelNames.length === 0) return mapelList;
        return mapelList.filter((m) =>
            guruMapelNames.some((n) => n.toLowerCase().trim() === m.nama.toLowerCase().trim())
        );
    }, [selectedGuruId, guruList, mapelList]);

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const res = await getTimetable(token);
            setTimetable(res.data?.data || null);
        } catch {
            Swal.fire("Error", "Gagal memuat jadwal.", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchGuruMapel = async () => {
        try {
            const [gRes, mRes] = await Promise.all([
                getAllGuru(token, { per_page: 200 }),
                getAllMataPelajaran(token, { per_page: 200 }),
            ]);
            setGuruList(gRes.data?.data || []);
            setMapelList(mRes.data?.data || []);
        } catch { /* abaikan */ }
    };

    useEffect(() => {
        fetchTimetable();
        fetchGuruMapel();
    }, []);

    // Cell click → buka modal
    const handleCellClick = (jam, kelas, existingJadwal) => {
        if (existingJadwal) {
            setModal({ mode: "detail", jadwal: existingJadwal, jam, kelas });
        } else {
            setSelectedGuruId("");
            setSelectedMapelId("");
            setModal({ mode: "create", jadwal: null, jam, kelas });
        }
    };

    const openEdit = () => {
        if (!modal?.jadwal) return;
        setSelectedGuruId(String(modal.jadwal.guru?.id || ""));
        setSelectedMapelId(String(modal.jadwal.mata_pelajaran?.id || ""));
        setModal({ ...modal, mode: "edit" });
    };

    const handleCreate = async () => {
        if (!selectedGuruId || !selectedMapelId) {
            Swal.fire("Peringatan", "Pilih guru dan mata pelajaran.", "warning");
            return;
        }
        setSubmitting(true);
        try {
            await createJadwal(token, {
                hari: activeHari,
                jam_pelajaran_id: modal.jam.id,
                kelas_id: modal.kelas.id,
                guru_id: Number(selectedGuruId),
                mata_pelajaran_id: Number(selectedMapelId),
            });
            Swal.fire("Berhasil", "Jadwal berhasil dibuat.", "success");
            setModal(null);
            fetchTimetable();
        } catch (err) {
            Swal.fire("Gagal", err?.response?.data?.message || "Gagal membuat jadwal.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedGuruId || !selectedMapelId) {
            Swal.fire("Peringatan", "Pilih guru dan mata pelajaran.", "warning");
            return;
        }
        setSubmitting(true);
        try {
            await updateJadwal(token, modal.jadwal.id, {
                guru_id: Number(selectedGuruId),
                mata_pelajaran_id: Number(selectedMapelId),
            });
            Swal.fire("Berhasil", "Jadwal berhasil diperbarui.", "success");
            setModal(null);
            fetchTimetable();
        } catch (err) {
            Swal.fire("Gagal", err?.response?.data?.message || "Gagal mengupdate jadwal.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!modal?.jadwal) return;
        const { isConfirmed } = await Swal.fire({
            title: "Hapus jadwal ini?",
            text: `${modal.jam?.nama} — ${modal.kelas?.nama_kelas}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Ya, Hapus",
        });
        if (!isConfirmed) return;
        try {
            await deleteJadwal(token, modal.jadwal.id);
            Swal.fire("Terhapus", "Jadwal berhasil dihapus.", "success");
            setModal(null);
            fetchTimetable();
        } catch (err) {
            Swal.fire("Gagal", err?.response?.data?.message || "Gagal menghapus.", "error");
        }
    };

    return (
        <div className="jadwal-page">
            {/* Header */}
            <div className="absen-header-hero">
                <div>
                    <h1 className="absen-header-title">
                        <span className="title-icon"><CalendarDays size={20} /></span>
                        Jadwal Pelajaran
                    </h1>
                    <p className="absen-header-subtitle">
                        Kelola jadwal belajar mengajar per hari, kelas, dan jam pelajaran.
                    </p>
                </div>
                <button className="btn-export-excel" onClick={() => navigate("/jadwal/jam-pelajaran")}>
                    <Settings size={15} /> Kelola Jam
                </button>
            </div>

            {/* Filter */}
            <div className="absen-filter-card" style={{ marginBottom: "1rem" }}>
                <div className="filter-grid-row">
                    <div className="filter-col">
                        <label><CalendarDays size={13} /> Kelas</label>
                        <select className="form-control" value={filterKelasId} onChange={(e) => setFilterKelasId(e.target.value)}>
                            <option value="">Semua Kelas</option>
                            {kelasList.map((k) => (
                                <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Day Tabs */}
            <div className="jadwal-day-tabs">
                {HARI_LIST.map((h) => (
                    <button
                        key={h}
                        className={`jadwal-day-tab ${activeHari === h ? "active" : ""}`}
                        onClick={() => setActiveHari(h)}
                    >
                        {h}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="loading-state"><div className="spinner" /><p style={{ marginTop: "1rem", color: "#64748b", fontWeight: 600 }}>Memuat jadwal...</p></div>
            ) : jamList.length === 0 ? (
                <div className="empty-state">
                    <CalendarDays size={44} />
                    <p>Belum ada slot jam pelajaran. <button className="btn-action btn-primary" style={{ flex: "none", padding: "0.4rem 1rem", marginLeft: "0.5rem" }} onClick={() => navigate("/jadwal/jam-pelajaran")}>Buat Slot Jam</button></p>
                </div>
            ) : (
                <TimetableGrid
                    timetable={timetable}
                    activeHari={activeHari}
                    readOnly={false}
                    onCellClick={handleCellClick}
                    filterKelasId={filterKelasId || null}
                />
            )}

            {/* ===== Modal: Create / Edit / Detail ===== */}
            {modal && (
                <div className="u-modal-overlay" onClick={() => setModal(null)}>
                    <div className="u-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="u-modal-header">
                            <div className="u-modal-header-info">
                                <h3>
                                    {modal.mode === "create" && "Tambah Jadwal"}
                                    {modal.mode === "edit" && "Edit Jadwal"}
                                    {modal.mode === "detail" && "Detail Jadwal"}
                                </h3>
                                <p>{modal.jam?.nama} ({modal.jam?.jam_mulai} – {modal.jam?.jam_selesai}) • {modal.kelas?.nama_kelas}</p>
                            </div>
                            <button className="u-modal-close" onClick={() => setModal(null)}><span style={{ fontSize: "1.1rem" }}>×</span></button>
                        </div>

                        {modal.mode === "detail" ? (
                            <>
                                <div className="u-modal-body">
                                    <div className="u-form-group">
                                        <label className="u-form-label">Mata Pelajaran</label>
                                        <input className="u-form-control" value={`${modal.jadwal.mata_pelajaran?.kode || ""} — ${modal.jadwal.mata_pelajaran?.nama || ""}`} readOnly style={{ background: "#f8fafc" }} />
                                    </div>
                                    <div className="u-form-group">
                                        <label className="u-form-label">Guru</label>
                                        <input className="u-form-control" value={`${modal.jadwal.guru?.nip || ""} — ${modal.jadwal.guru?.nama || ""}`} readOnly style={{ background: "#f8fafc" }} />
                                    </div>
                                </div>
                                <div className="u-modal-footer">
                                    <button type="button" className="u-btn-cancel" onClick={() => setModal(null)}>Tutup</button>
                                    <button type="button" className="u-btn-danger" onClick={handleDelete} style={{ display: "inline-flex", gap: "0.3rem", alignItems: "center" }}>
                                        <Trash2 size={14} /> Hapus
                                    </button>
                                    <button type="button" className="u-btn-save" onClick={openEdit} style={{ display: "inline-flex", gap: "0.3rem", alignItems: "center" }}>
                                        <Pencil size={14} /> Edit
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="u-modal-body">
                                    <div className="u-form-group">
                                        <label className="u-form-label">Guru <span className="req">*</span></label>
                                        <select className="u-form-control u-select" value={selectedGuruId} onChange={(e) => { setSelectedGuruId(e.target.value); setSelectedMapelId(""); }} required disabled={filteredGuruList.length === 0}>
                                            <option value="">{filteredGuruList.length > 0 ? "Pilih Guru" : "Tidak ada guru ditugaskan di kelas ini"}</option>
                                            {filteredGuruList.map((g) => (
                                                <option key={g.id} value={g.guru?.id}>{g.guru?.nip || "—"} — {g.nama}</option>
                                            ))}
                                        </select>
                                        {filteredGuruList.length === 0 && (
                                            <span className="u-form-hint" style={{ marginTop: "0.4rem" }}>Atur penugasan guru ke kelas ini di menu <b>Data Guru</b>.</span>
                                        )}
                                    </div>
                                    <div className="u-form-group">
                                        <label className="u-form-label">Mata Pelajaran <span className="req">*</span></label>
                                        <select className="u-form-control u-select" value={selectedMapelId} onChange={(e) => setSelectedMapelId(e.target.value)} required disabled={!selectedGuruId}>
                                            <option value="">{selectedGuruId ? "Pilih Mata Pelajaran" : "Pilih Guru terlebih dahulu"}</option>
                                            {filteredMapel.map((m) => (
                                                <option key={m.id} value={m.id}>{m.kode} — {m.nama}</option>
                                            ))}
                                        </select>
                                        {selectedGuruId && filteredMapel.length === 0 && (
                                            <small style={{ color: "#d97706", fontSize: "0.75rem" }}>Guru ini tidak memiliki mata pelajaran yang cocok.</small>
                                        )}
                                    </div>
                                </div>
                                <div className="u-modal-footer">
                                    <button type="button" className="u-btn-cancel" onClick={() => setModal(null)} disabled={submitting}>Batal</button>
                                    <button type="button" className="u-btn-save" onClick={modal.mode === "create" ? handleCreate : handleUpdate} disabled={submitting}>
                                        {submitting ? "Menyimpan..." : modal.mode === "create" ? "Buat Jadwal" : "Simpan Perubahan"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default JadwalAdmin;
