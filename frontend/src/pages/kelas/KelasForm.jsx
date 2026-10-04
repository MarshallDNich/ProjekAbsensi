import { useState, useEffect } from "react";
import { X, School, UserCircle, BookOpen, CheckCircle, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { createKelas, updateKelas } from "../../services/kelasService";
import { useAuth } from "../../context/AuthContext";

const TINGKAT = ["X", "XI", "XII"];

function KelasForm({ mode, kelas, guruList, onClose, onSuccess }) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const [formData, setFormData] = useState({
        nama_kelas: "",
        tingkat: "",
        jurusan: "",
        wali_kelas: "",
    });

    useEffect(() => {
        if (kelas) {
            setFormData({
                nama_kelas: kelas.nama_kelas || "",
                tingkat: kelas.tingkat || "",
                jurusan: kelas.jurusan || "",
                wali_kelas: kelas.wali_kelas ? String(kelas.wali_kelas) : "",
            });
        }
    }, [kelas]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const validate = () => {
        const errs = {};
        if (!formData.nama_kelas.trim()) {
            errs.nama_kelas = "Nama kelas wajib diisi.";
        }
        if (!formData.tingkat) {
            errs.tingkat = "Tingkat wajib dipilih.";
        }
        if (!formData.jurusan.trim()) {
            errs.jurusan = "Jurusan wajib diisi.";
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
                nama_kelas: formData.nama_kelas.trim(),
                tingkat: formData.tingkat,
                jurusan: formData.jurusan.trim(),
                wali_kelas: formData.wali_kelas || null,
            };

            if (mode === "edit") {
                await updateKelas(token, kelas.id, payload);
                Swal.fire("Berhasil", "Data kelas berhasil diperbarui", "success");
            } else {
                await createKelas(token, payload);
                Swal.fire("Berhasil", "Data kelas berhasil ditambahkan", "success");
            }

            onSuccess();
        } catch (error) {
            console.error("Error saving kelas:", error);
            const backendErrors = error.response?.data?.errors;
            if (backendErrors) {
                const mapped = {};
                Object.keys(backendErrors).forEach((key) => {
                    mapped[key] = backendErrors[key][0];
                });
                setFieldErrors(mapped);
            }
            Swal.fire("Error", error.response?.data?.message || "Gagal menyimpan data kelas", "error");
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
                        <h3>{isEdit ? "Edit Data Kelas" : "Tambah Kelas Baru"}</h3>
                        <p>{isEdit ? "Perbarui informasi kelas dan wali kelas." : "Isikan identitas kelas yang baru."}</p>
                    </div>
                    <button className="u-modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="u-modal-body">
                        <div className="u-section-title">
                            <School size={15} />
                            <span>Identitas Kelas</span>
                        </div>

                        <div className="u-form-group">
                            <label className="u-form-label">
                                Nama Kelas <span className="req">*</span>
                            </label>
                            <div className="u-input-wrapper">
                                <School size={16} className="u-input-icon" />
                                <input
                                    type="text"
                                    className={`u-form-control ${fieldErrors.nama_kelas ? "is-invalid" : ""}`}
                                    placeholder="Contoh: X RPL 1"
                                    value={formData.nama_kelas}
                                    onChange={(e) => handleChange("nama_kelas", e.target.value)}
                                    autoFocus
                                />
                            </div>
                            {fieldErrors.nama_kelas && (
                                <p className="u-form-error">{fieldErrors.nama_kelas}</p>
                            )}
                        </div>

                        <div className="u-form-row">
                            <div className="u-form-group flex-1">
                                <label className="u-form-label">
                                    Tingkat <span className="req">*</span>
                                </label>
                                <div className="u-input-wrapper">
                                    <BookOpen size={16} className="u-input-icon" />
                                    <select
                                        className={`u-form-control u-select ${fieldErrors.tingkat ? "is-invalid" : ""}`}
                                        value={formData.tingkat}
                                        onChange={(e) => handleChange("tingkat", e.target.value)}
                                    >
                                        <option value="">-- Pilih --</option>
                                        {TINGKAT.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {fieldErrors.tingkat && (
                                    <p className="u-form-error">{fieldErrors.tingkat}</p>
                                )}
                            </div>

                            <div className="u-form-group flex-1">
                                <label className="u-form-label">
                                    Jurusan <span className="req">*</span>
                                </label>
                                <div className="u-input-wrapper">
                                    <BookOpen size={16} className="u-input-icon" />
                                    <input
                                        type="text"
                                        className={`u-form-control ${fieldErrors.jurusan ? "is-invalid" : ""}`}
                                        placeholder="Contoh: RPL"
                                        value={formData.jurusan}
                                        onChange={(e) => handleChange("jurusan", e.target.value)}
                                    />
                                </div>
                                {fieldErrors.jurusan && (
                                    <p className="u-form-error">{fieldErrors.jurusan}</p>
                                )}
                            </div>
                        </div>

                        <div className="u-section-title" style={{ marginTop: "0.5rem" }}>
                            <UserCircle size={15} />
                            <span>Wali Kelas</span>
                        </div>

                        <div className="u-form-group">
                            <label className="u-form-label">Pilih Guru</label>
                            <div className="u-input-wrapper">
                                <UserCircle size={16} className="u-input-icon" />
                                <select
                                    className={`u-form-control u-select ${fieldErrors.wali_kelas ? "is-invalid" : ""}`}
                                    value={formData.wali_kelas}
                                    onChange={(e) => handleChange("wali_kelas", e.target.value)}
                                >
                                    <option value="">-- Tidak ada / Kosong --</option>
                                    {guruList
                                        ?.filter((g) => g.guru)
                                        .map((g) => (
                                            <option key={g.guru.id} value={g.guru.id}>
                                                {g.nama}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            {fieldErrors.wali_kelas && (
                                <p className="u-form-error">{fieldErrors.wali_kelas}</p>
                            )}
                            <p className="u-form-hint">
                                Wali kelas dapat diubah kembali kapan saja melalui menu ini.
                            </p>
                        </div>
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
                                    <span>{isEdit ? "Perbarui Kelas" : "Simpan Kelas"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default KelasForm;