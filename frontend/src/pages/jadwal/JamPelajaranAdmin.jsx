import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    getJamPelajaran,
    createJamPelajaran,
    updateJamPelajaran,
    deleteJamPelajaran,
    reorderJamPelajaran,
} from "../../services/jadwalService";
import {
    Clock,
    GripVertical,
    Plus,
    Pencil,
    Trash2,
    ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../../pages/absensi/Absensi.css";
import "../../pages/users/Users.css";
import "./Jadwal.css";

const emptyForm = { nama: "", jam_mulai: "07:00", jam_selesai: "07:40", urutan: 1, tipe: "lesson" };

function JamPelajaranAdmin() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [dragIdx, setDragIdx] = useState(null);
    const [overIdx, setOverIdx] = useState(null);

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const res = await getJamPelajaran(token);
            setSlots(res.data?.data || []);
        } catch {
            Swal.fire("Error", "Gagal memuat jam pelajaran.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSlots(); }, []);

    const openAdd = () => {
        setEditing(null);
        setForm({ ...emptyForm, urutan: slots.length + 1 });
        setModalOpen(true);
    };

    const openEdit = (slot) => {
        setEditing(slot);
        setForm({ nama: slot.nama, jam_mulai: slot.jam_mulai, jam_selesai: slot.jam_selesai, urutan: slot.urutan, tipe: slot.tipe });
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await updateJamPelajaran(token, editing.id, form);
                Swal.fire("Berhasil", "Slot jam diperbarui.", "success");
            } else {
                await createJamPelajaran(token, form);
                Swal.fire("Berhasil", "Slot jam baru ditambahkan.", "success");
            }
            setModalOpen(false);
            fetchSlots();
        } catch (err) {
            const msg = err?.response?.data?.message || Object.values(err?.response?.data?.errors || {}).flat().join(" ") || "Gagal menyimpan.";
            Swal.fire("Gagal", msg, "error");
        }
    };

    const handleDelete = async (slot) => {
        const { isConfirmed } = await Swal.fire({
            title: `Hapus "${slot.nama}"?`,
            text: "Slot jam akan dihapus permanen.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
        });
        if (!isConfirmed) return;
        try {
            await deleteJamPelajaran(token, slot.id);
            Swal.fire("Terhapus", "Slot jam berhasil dihapus.", "success");
            fetchSlots();
        } catch (err) {
            Swal.fire("Gagal", err?.response?.data?.message || "Gagal menghapus.", "error");
        }
    };

    // ===== Drag & Drop Reorder =====
    const handleDragStart = (e, idx) => {
        setDragIdx(idx);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, idx) => {
        e.preventDefault();
        setOverIdx(idx);
    };

    const handleDrop = async (e, idx) => {
        e.preventDefault();
        if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setOverIdx(null); return; }
        const updated = [...slots];
        const [moved] = updated.splice(dragIdx, 1);
        updated.splice(idx, 0, moved);
        setSlots(updated);
        setDragIdx(null);
        setOverIdx(null);
        // Save new order
        try {
            await reorderJamPelajaran(token, updated.map((s) => s.id));
        } catch {
            fetchSlots(); // Revert on failure
        }
    };

    return (
        <div className="jadwal-page">
            {/* Header */}
            <div className="absen-header-hero">
                <div>
                    <h1 className="absen-header-title">
                        <span className="title-icon"><Clock size={20} /></span>
                        Jam Pelajaran
                    </h1>
                    <p className="absen-header-subtitle">
                        Kelola slot jam belajar dan istirahat. Urutkan dengan drag & drop.
                    </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn-print-report" onClick={() => navigate("/jadwal")}>
                        <ArrowLeft size={15} /> Kembali
                    </button>
                    <button className="btn-export-excel" onClick={openAdd}>
                        <Plus size={16} /> Tambah Slot
                    </button>
                </div>
            </div>

            {/* Slot List */}
            {loading ? (
                <div className="loading-state"><div className="spinner" /><p style={{ marginTop: "1rem", color: "#64748b", fontWeight: 600 }}>Memuat...</p></div>
            ) : slots.length === 0 ? (
                <div className="empty-state"><Clock size={44} /><p>Belum ada slot jam. Klik "Tambah Slot" untuk membuat baru.</p></div>
            ) : (
                <div className="slot-list">
                    {slots.map((slot, idx) => (
                        <div
                            key={slot.id}
                            className={`slot-card ${dragIdx === idx ? "dragging" : ""} ${overIdx === idx && dragIdx !== null ? "drag-over" : ""}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDrop={(e) => handleDrop(e, idx)}
                            onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
                        >
                            <div className="slot-handle"><GripVertical size={16} /></div>
                            <div className={`slot-num ${slot.tipe}`}>{idx + 1}</div>
                            <div className="slot-info">
                                <div className="slot-name">{slot.nama}</div>
                                <div className="slot-time">{slot.jam_mulai} – {slot.jam_selesai}</div>
                            </div>
                            <span className={`slot-type-badge ${slot.tipe}`}>
                                {slot.tipe === "lesson" ? "Pelajaran" : "Istirahat"}
                            </span>
                            <div className="slot-actions">
                                <button className="slot-action-btn edit" onClick={() => openEdit(slot)} title="Edit"><Pencil size={14} /></button>
                                <button className="slot-action-btn delete" onClick={() => handleDelete(slot)} title="Hapus"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Add/Edit */}
            {modalOpen && (
                <div className="u-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="u-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="u-modal-header">
                            <div className="u-modal-header-info">
                                <h3>{editing ? "Edit Slot Jam" : "Tambah Slot Jam Baru"}</h3>
                                <p>{editing ? `Mengedit "${editing.nama}"` : "Isi data slot jam pelajaran baru."}</p>
                            </div>
                            <button className="u-modal-close" onClick={() => setModalOpen(false)}><span style={{ fontSize: "1.1rem" }}>×</span></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="u-modal-body">
                                <div className="u-form-group">
                                    <label className="u-form-label">Nama Slot <span className="req">*</span></label>
                                    <input className="u-form-control" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Contoh: Jam 1, Istirahat 1" required />
                                </div>
                                <div className="u-form-row">
                                    <div className="u-form-group flex-1">
                                        <label className="u-form-label">Jam Mulai <span className="req">*</span></label>
                                        <input type="time" className="u-form-control" value={form.jam_mulai} onChange={(e) => setForm({ ...form, jam_mulai: e.target.value })} required />
                                    </div>
                                    <div className="u-form-group flex-1">
                                        <label className="u-form-label">Jam Selesai <span className="req">*</span></label>
                                        <input type="time" className="u-form-control" value={form.jam_selesai} onChange={(e) => setForm({ ...form, jam_selesai: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="u-form-group">
                                    <label className="u-form-label">Tipe <span className="req">*</span></label>
                                    <div style={{ display: "flex", gap: "0.6rem" }}>
                                        {[{ val: "lesson", label: "Pelajaran" }, { val: "break", label: "Istirahat" }].map((o) => (
                                            <button key={o.val} type="button" onClick={() => setForm({ ...form, tipe: o.val })} style={{
                                                flex: 1, padding: "0.6rem", borderRadius: "10px", border: `1.5px solid ${form.tipe === o.val ? "#dc2626" : "#e2e8f0"}`,
                                                background: form.tipe === o.val ? "#fef2f2" : "#fff", color: form.tipe === o.val ? "#dc2626" : "#64748b",
                                                fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                                            }}>
                                                {o.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="u-modal-footer">
                                <button type="button" className="u-btn-cancel" onClick={() => setModalOpen(false)}>Batal</button>
                                <button type="submit" className="u-btn-save">{editing ? "Simpan Perubahan" : "Tambah Slot"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JamPelajaranAdmin;
