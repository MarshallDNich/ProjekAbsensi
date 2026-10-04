import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { createSiswa, updateSiswa } from "../../services/siswaService";
import { X, Save } from "lucide-react";
import Swal from "sweetalert2";

function SiswaForm({ mode, user, kelas, onClose, onSuccess }) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        user_id: "",
        kelas_id: "",
    });

    useEffect(() => {
        if (user) {
            if (mode === "create" && !user.siswa) {
                setFormData({
                    user_id: user.id,
                    kelas_id: "",
                });
            } else if (mode === "edit" && user.siswa) {
                setFormData({
                    user_id: user.id,
                    kelas_id: user.siswa.kelas_id || "",
                });
            }
        }
    }, [mode, user]);

    const handleKelasChange = (e) => {
        setFormData((prev) => ({ ...prev, kelas_id: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                user_id: formData.user_id,
                kelas_id: formData.kelas_id || null,
            };

            if (mode === "edit" && user.siswa) {
                await updateSiswa(token, user.siswa.id, data);
                Swal.fire("Berhasil", "Kelas siswa berhasil diperbarui", "success");
            } else {
                await createSiswa(token, data);
                Swal.fire("Berhasil", "Siswa berhasil ditempatkan ke kelas", "success");
            }

            onSuccess();
        } catch (error) {
            console.error("Error saving siswa:", error);
            const message = error.response?.data?.message || "Gagal menyimpan data siswa";
            Swal.fire("Error", message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="u-modal-overlay">
            <div className="u-modal-box">
                <div className="u-modal-header">
                    <div className="u-modal-header-info">
                        <h3>{mode === "edit" ? "Pindah Kelas Siswa" : "Tempatkan Siswa ke Kelas"}</h3>
                        <p>{user?.nama} - {user?.email}</p>
                    </div>
                    <button className="u-modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="u-modal-body">
                        {mode === "edit" && user?.siswa?.kelas && (
                            <div className="u-form-hint" style={{ marginBottom: '1rem' }}>
                                <strong>Kelas Saat Ini:</strong> {user.siswa.kelas.nama_kelas}
                            </div>
                        )}

                        <div className="u-section-title">
                            🎓 Pilih Kelas
                        </div>

                        <div className="u-form-group">
                            <select
                                className="u-form-control u-select"
                                value={formData.kelas_id}
                                onChange={handleKelasChange}
                                style={{ paddingLeft: '1rem' }}
                            >
                                <option value="">-- Pilih Kelas --</option>
                                {kelas.map((k) => (
                                    <option key={k.id} value={k.id}>
                                        {k.nama_kelas} - {k.jurusan}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="u-form-hint">
                            <strong>Catatan:</strong> Memindahkan siswa ke kelas baru akan mempengaruhi data absensi dan jadwal siswa.
                        </div>
                    </div>

                    <div className="u-modal-footer">
                        <button
                            type="button"
                            className="u-btn-cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button type="submit" className="u-btn-save" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm"></span>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Simpan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SiswaForm;
