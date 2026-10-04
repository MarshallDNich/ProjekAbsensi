import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { createGuru, updateGuru } from "../../services/guruService";
import { getAllMataPelajaran } from "../../services/mataPelajaranService";
import { X, Save } from "lucide-react";
import Swal from "sweetalert2";

function GuruForm({ mode, user, kelas, onClose, onSuccess }) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [mataPelajaranOptions, setMataPelajaranOptions] = useState([]);

    const [formData, setFormData] = useState({
        user_id: "",
        mata_pelajaran: [""],
        kelas_ids: [],
    });

    useEffect(() => {
        const fetchMataPelajaran = async () => {
            try {
                const response = await getAllMataPelajaran(token, { per_page: 100 });
                setMataPelajaranOptions(response.data?.data || []);
            } catch (error) {
                console.error("Error fetching mata pelajaran:", error);
            }
        };

        fetchMataPelajaran();
    }, [token]);

    useEffect(() => {
        if (user) {
            if (mode === "create" && !user.guru) {
                setFormData({
                    user_id: user.id,
                    mata_pelajaran: [""],
                    kelas_ids: [],
                });
            } else if (mode === "edit" && user.guru) {
                setFormData({
                    user_id: user.id,
                    mata_pelajaran: user.guru.mata_pelajaran && user.guru.mata_pelajaran.length > 0
                        ? user.guru.mata_pelajaran
                        : [""],
                    kelas_ids: user.guru.kelas ? user.guru.kelas.map((k) => k.id) : [],
                });
            }
        }
    }, [mode, user]);

    const handleMataPelajaranChange = (index, value) => {
        const newMataPelajaran = [...formData.mata_pelajaran];
        newMataPelajaran[index] = value;
        setFormData((prev) => ({ ...prev, mata_pelajaran: newMataPelajaran }));
    };

    const handleAddMataPelajaran = () => {
        setFormData((prev) => ({
            ...prev,
            mata_pelajaran: [...prev.mata_pelajaran, ""],
        }));
    };

    const handleRemoveMataPelajaran = (index) => {
        const newMataPelajaran = formData.mata_pelajaran.filter((_, i) => i !== index);
        setFormData((prev) => ({
            ...prev,
            mata_pelajaran: newMataPelajaran.length > 0 ? newMataPelajaran : [""],
        }));
    };

    const handleKelasChange = (kelasId) => {
        setFormData((prev) => {
            const isSelected = prev.kelas_ids.includes(kelasId);
            return {
                ...prev,
                kelas_ids: isSelected
                    ? prev.kelas_ids.filter((id) => id !== kelasId)
                    : [...prev.kelas_ids, kelasId],
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                user_id: formData.user_id,
                mata_pelajaran: formData.mata_pelajaran.filter((mp) => mp.trim() !== ""),
                kelas_ids: formData.kelas_ids,
            };

            if (mode === "edit" && user.guru) {
                await updateGuru(token, user.guru.id, data);
                Swal.fire("Berhasil", "Penugasan guru berhasil diperbarui", "success");
            } else {
                await createGuru(token, data);
                Swal.fire("Berhasil", "Penugasan guru berhasil dibuat", "success");
            }

            onSuccess();
        } catch (error) {
            console.error("Error saving guru:", error);
            const message = error.response?.data?.message || "Gagal menyimpan penugasan guru";
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
                        <h3>{mode === "edit" ? "Edit Penugasan Guru" : "Atur Penugasan Guru"}</h3>
                        <p>{user?.nama} - {user?.email}</p>
                    </div>
                    <button className="u-modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="u-modal-body">
                        <div className="u-section-title">
                            📚 Mata Pelajaran yang Diampu
                        </div>

                        {mataPelajaranOptions.length === 0 ? (
                            <p className="text-muted small">
                                Belum ada data mata pelajaran. Silakan tambahkan di menu Mata Pelajaran terlebih dahulu.
                            </p>
                        ) : (
                            formData.mata_pelajaran.map((mp, index) => (
                                <div key={index} className="u-form-group">
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <select
                                            className="u-form-control"
                                            value={mp}
                                            onChange={(e) => handleMataPelajaranChange(index, e.target.value)}
                                            style={{ paddingLeft: '1rem' }}
                                        >
                                            <option value="">-- Pilih Mata Pelajaran --</option>
                                            {mp && !mataPelajaranOptions.some((option) => option.nama === mp) && (
                                                <option value={mp}>{mp}</option>
                                            )}
                                            {mataPelajaranOptions.map((option) => (
                                                <option key={option.id} value={option.nama}>
                                                    {option.nama}
                                                </option>
                                            ))}
                                        </select>
                                        {formData.mata_pelajaran.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn-icon delete"
                                                onClick={() => handleRemoveMataPelajaran(index)}
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {mataPelajaranOptions.length > 0 && (
                            <button
                                type="button"
                                className="btn-add"
                                onClick={handleAddMataPelajaran}
                                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                            >
                                + Tambah Mata Pelajaran
                            </button>
                        )}

                        <div className="u-section-title" style={{ marginTop: '1.5rem' }}>
                            🎓 Kelas yang Diampu
                        </div>

                        <div className="u-profile-box">
                            {kelas.length === 0 ? (
                                <p className="text-muted small mb-0">Belum ada data kelas.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {kelas.map((k) => (
                                        <label key={k.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.kelas_ids.includes(k.id)}
                                                onChange={() => handleKelasChange(k.id)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontSize: '0.875rem', color: '#334155' }}>{k.nama_kelas}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
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

export default GuruForm;
