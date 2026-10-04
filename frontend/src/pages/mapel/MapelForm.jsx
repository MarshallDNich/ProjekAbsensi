import { useState, useEffect } from "react";
import { X, BookOpen, Hash, FileText, Power, CheckCircle, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { createMataPelajaran, updateMataPelajaran } from "../../services/mataPelajaranService";
import { useAuth } from "../../context/AuthContext";

const STATUSES = ["Aktif", "Tidak Aktif"];

function MapelForm({ mode, mapel, onClose, onSuccess }) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const [formData, setFormData] = useState({
        nama: "",
        kode: "",
        deskripsi: "",
        status: "Aktif",
    });

    useEffect(() => {
        if (mapel) {
            setFormData({
                nama: mapel.nama || "",
                kode: mapel.kode || "",
                deskripsi: mapel.deskripsi || "",
                status: mapel.status || "Aktif",
            });
        }
    }, [mapel]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const validate = () => {
        const errs = {};
        if (!formData.nama.trim()) {
            errs.nama = "Nama mata pelajaran wajib diisi.";
        }
        if (!formData.kode.trim()) {
            errs.kode = "Kode mata pelajaran wajib diisi.";
        } else if (!/^[a-zA-Z0-9-]+$/.test(formData.kode.trim())) {
            errs.kode = "Kode hanya boleh huruf, angka, dan tanda strip (-).";
        }
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            return;
        }

        setLoading(true);
        try {
            const payload = {
                nama: formData.nama.trim(),
                kode: formData.kode.trim(),
                deskripsi: formData.deskripsi.trim() || null,
                status: formData.status,
            };

            if (mode === "edit") {
                await updateMataPelajaran(token, mapel.id, payload);
                Swal.fire("Berhasil", "Data mata pelajaran berhasil diperbarui", "success");
            } else {
                await createMataPelajaran(token, payload);
                Swal.fire("Berhasil", "Data mata pelajaran berhasil ditambahkan", "success");
            }

            onSuccess();
        } catch (error) {
            console.error("Error saving mapel:", error);
            const backendErrors = error.response?.data?.errors;
            if (backendErrors) {
                const mapped = {};
                Object.keys(backendErrors).forEach((key) => {
                    mapped[key] = backendErrors[key][0];
                });
                setFieldErrors(mapped);
            }
            Swal.fire("Error", error.response?.data?.message || "Gagal menyimpan data mata pelajaran", "error");
        } finally {
            setLoading(false);
        }
    };

    const isEdit = mode === "edit";

    return (
        <div className="u-modal-overlay">
            <div className="u-modal-box">
                <div className="u-modal-header">
                    <div className="u-modal-header-info">
                        <h3>{isEdit ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}</h3>
                        <p>{isEdit ? "Perbarui informasi master data mata pelajaran." : "Isikan identitas mata pelajaran yang baru."}</p>
                    </div>
                    <button className="u-modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="u-modal-body">
                        <div className="u-section-title">
                            <BookOpen size={15} />
                            <span>Identitas Mata Pelajaran</span>
                        </div>

                        <div className="u-form-group">
                            <label className="u-form-label">
                                Nama Mata Pelajaran <span className="req">*</span>
                            </label>
                            <div className="u-input-wrapper">
                                <BookOpen size={16} className="u-input-icon" />
                                <input
                                    type="text"
                                    className={`u-form-control ${fieldErrors.nama ? "is-invalid" : ""}`}
                                    placeholder="Contoh: Matematika"
                                    value={formData.nama}
                                    onChange={(e) => handleChange("nama", e.target.value)}
                                    autoFocus
                                />
                            </div>
                            {fieldErrors.nama && (
                                <p className="u-form-error">{fieldErrors.nama}</p>
                            )}
                        </div>

                        <div className="u-form-row">
                            <div className="u-form-group flex-1">
                                <label className="u-form-label">
                                    Kode <span className="req">*</span>
                                </label>
                                <div className="u-input-wrapper">
                                    <Hash size={16} className="u-input-icon" />
                                    <input
                                        type="text"
                                        className={`u-form-control ${fieldErrors.kode ? "is-invalid" : ""}`}
                                        placeholder="Contoh: MTK"
                                        value={formData.kode}
                                        onChange={(e) => handleChange("kode", e.target.value)}
                                    />
                                </div>
                                {fieldErrors.kode && (
                                    <p className="u-form-error">{fieldErrors.kode}</p>
                                )}
                            </div>

                            <div className="u-form-group flex-1">
                                <label className="u-form-label">
                                    Status <span className="req">*</span>
                                </label>
                                <div className="u-input-wrapper">
                                    <Power size={16} className="u-input-icon" />
                                    <select
                                        className={`u-form-control u-select ${fieldErrors.status ? "is-invalid" : ""}`}
                                        value={formData.status}
                                        onChange={(e) => handleChange("status", e.target.value)}
                                    >
                                        {STATUSES.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="u-form-group">
                            <label className="u-form-label">Deskripsi</label>
                            <div className="u-input-wrapper">
                                <FileText size={16} className="u-input-icon" />
                                <textarea
                                    className={`u-form-control ${fieldErrors.deskripsi ? "is-invalid" : ""}`}
                                    placeholder="Deskripsi singkat mata pelajaran (opsional)"
                                    value={formData.deskripsi}
                                    onChange={(e) => handleChange("deskripsi", e.target.value)}
                                    rows={3}
                                    style={{ resize: "vertical", minHeight: 84 }}
                                />
                            </div>
                            {fieldErrors.deskripsi && (
                                <p className="u-form-error">{fieldErrors.deskripsi}</p>
                            )}
                        </div>

                        <p className="u-form-hint">
                            💡 Guru pengampu dan kelas akan dihubungkan melalui penugasan Guru, sehingga tidak perlu diisi di form ini.
                        </p>
                    </div>

                    <div className="u-modal-footer">
                        <button type="button" className="u-btn-cancel" onClick={onClose} disabled={loading}>
                            Batal
                        </button>
                        <button type="submit" className="u-btn-save" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={16} />
                                    <span>{isEdit ? "Perbarui Mapel" : "Simpan Mapel"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MapelForm;