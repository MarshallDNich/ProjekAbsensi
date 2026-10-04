import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAllSiswa, deleteSiswa } from "../../services/siswaService";
import { getAllKelas } from "../../services/kelasService";
import { User, GraduationCap, Search, Eye, Trash2, AlertCircle, School } from "lucide-react";
import Swal from "sweetalert2";
import SiswaForm from "./SiswaForm";
import SiswaDetail from "./SiswaDetail";
import "./Siswa.css";

function Siswa() {
    const { token } = useAuth();
    const [siswa, setSiswa] = useState([]);
    const [kelas, setKelas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [mode, setMode] = useState("create");

    useEffect(() => {
        fetchSiswa();
        fetchKelas();
    }, []);

    const fetchSiswa = async () => {
        try {
            setLoading(true);
            const response = await getAllSiswa(token, { per_page: 100 });
            setSiswa(response.data.data);
        } catch (error) {
            console.error("Error fetching siswa:", error);
            Swal.fire("Error", "Gagal mengambil data siswa", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchKelas = async () => {
        try {
            const response = await getAllKelas(token, { per_page: 100 });
            setKelas(response.data.data);
        } catch (error) {
            console.error("Error fetching kelas:", error);
        }
    };

    const handleDelete = async (siswaId, nama) => {
        const result = await Swal.fire({
            title: "Konfirmasi Hapus",
            html: `Apakah Anda yakin ingin menghapus penempatan kelas <strong>${nama}</strong>?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
            try {
                await deleteSiswa(token, siswaId);
                Swal.fire("Berhasil", "Penempatan kelas berhasil dihapus", "success");
                fetchSiswa();
            } catch (error) {
                console.error("Error deleting siswa:", error);
                Swal.fire("Error", "Gagal menghapus penempatan kelas", "error");
            }
        }
    };

    const handleAturKelas = (user) => {
        setMode("create");
        setSelectedUser(user);
        setShowForm(true);
    };

    const handleEdit = (user) => {
        setMode("edit");
        setSelectedUser(user);
        setShowForm(true);
    };

    const handleDetail = (user) => {
        setSelectedUser(user);
        setShowDetail(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setSelectedUser(null);
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
        setSelectedUser(null);
    };

    const handleSuccess = () => {
        fetchSiswa();
        handleCloseForm();
    };

    const filteredSiswa = siswa.filter((s) =>
        s.nama.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    if (showForm) {
        return (
            <SiswaForm
                mode={mode}
                user={selectedUser}
                kelas={kelas}
                onClose={handleCloseForm}
                onSuccess={handleSuccess}
            />
        );
    }

    if (showDetail) {
        return (
            <SiswaDetail
                user={selectedUser}
                kelas={kelas}
                onClose={handleCloseDetail}
                onEdit={handleEdit}
            />
        );
    }

    return (
        <div className="guru-page">
            <div className="page-header-bar">
                <div className="page-header-left">
                    <h2>Data Siswa</h2>
                    <p>Kelola penempatan kelas siswa</p>
                </div>
            </div>

            <div className="search-card">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Cari nama atau email siswa..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="guru-cards-grid">
                    {filteredSiswa.length === 0 ? (
                        <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                            <AlertCircle size={48} />
                            <p>Tidak ada user dengan role Siswa. Silakan buat user dengan role Siswa di menu User Management terlebih dahulu.</p>
                        </div>
                    ) : (
                        filteredSiswa.map((s) => (
                            <div key={s.id} className={`guru-card ${!s.siswa ? 'incomplete' : ''}`}>
                                <div className="guru-card-body">
                                    {!s.siswa && (
                                        <div className="warning-badge">
                                            <AlertCircle size={16} />
                                            <span>Belum ditempatkan</span>
                                        </div>
                                    )}

                                    <div className="guru-avatar-section">
                                        {s.foto ? (
                                            <img
                                                src={s.foto}
                                                alt={s.nama}
                                                className="guru-avatar"
                                            />
                                        ) : (
                                            <div className="guru-avatar-placeholder" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                                                <User size={50} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="guru-info">
                                        <h3 className="guru-name">{s.nama}</h3>
                                        <p className="guru-email">{s.email}</p>
                                    </div>

                                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                        <span className={`status-badge ${s.status === 'Aktif' ? 'aktif' : 'nonaktif'}`}>
                                            {s.status}
                                        </span>
                                    </div>

                                    {s.siswa ? (
                                        <>
                                            <div className="guru-details">
                                                <div className="guru-detail-item">
                                                    <GraduationCap size={16} className="guru-detail-icon" />
                                                    <span className="guru-detail-text">
                                                        {s.siswa.kelas ? s.siswa.kelas.nama_kelas : "Belum ditempatkan"}
                                                    </span>
                                                </div>
                                                {s.siswa.kelas && (
                                                    <div className="guru-detail-item">
                                                        <School size={16} className="guru-detail-icon" />
                                                        <span className="guru-detail-text">
                                                            {s.siswa.kelas.jurusan} - Tk. {s.siswa.kelas.tingkat}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="guru-actions">
                                                <button className="btn-action btn-detail" onClick={() => handleDetail(s)}>
                                                    <Eye size={16} />
                                                    Detail
                                                </button>
                                                <button className="btn-action btn-edit" onClick={() => handleEdit(s)}>
                                                    <GraduationCap size={16} />
                                                    Pindah Kelas
                                                </button>
                                                <button className="btn-action btn-delete" onClick={() => handleDelete(s.siswa.id, s.nama)}>
                                                    <Trash2 size={16} />
                                                    Hapus
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="guru-details">
                                                <div className="guru-detail-item">
                                                    <GraduationCap size={16} className="guru-detail-icon" />
                                                    <span className="guru-detail-text empty">Belum ditempatkan</span>
                                                </div>
                                            </div>

                                            <button className="btn-action btn-primary" onClick={() => handleAturKelas(s)}>
                                                <GraduationCap size={16} />
                                                Tempatkan ke Kelas
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default Siswa;