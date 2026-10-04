import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAllGuru, deleteGuru } from "../../services/guruService";
import { getAllKelas } from "../../services/kelasService";
import { User, BookOpen, GraduationCap, Plus, Search, Edit, Trash2, Eye, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import GuruForm from "./GuruForm";
import GuruDetail from "./GuruDetail";
import "./Guru.css";

function Guru() {
    const { token } = useAuth();
    const [guru, setGuru] = useState([]);
    const [kelas, setKelas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [mode, setMode] = useState("create");

    useEffect(() => {
        fetchGuru();
        fetchKelas();
    }, []);

    const fetchGuru = async () => {
        try {
            setLoading(true);
            const response = await getAllGuru(token, { per_page: 100 });
            setGuru(response.data.data);
        } catch (error) {
            console.error("Error fetching guru:", error);
            Swal.fire("Error", "Gagal mengambil data guru", "error");
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

    const handleDelete = async (guruId, nama) => {
        const result = await Swal.fire({
            title: "Konfirmasi Hapus",
            html: `Apakah Anda yakin ingin menghapus data guru <strong>${nama}</strong>?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
            try {
                await deleteGuru(token, guruId);
                Swal.fire("Berhasil", "Data guru berhasil dihapus", "success");
                fetchGuru();
            } catch (error) {
                console.error("Error deleting guru:", error);
                Swal.fire("Error", "Gagal menghapus data guru", "error");
            }
        }
    };

    const handleLengkapiData = (user) => {
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
        fetchGuru();
        handleCloseForm();
    };

    const filteredGuru = guru.filter((g) =>
        g.nama.toLowerCase().includes(search.toLowerCase()) ||
        g.email.toLowerCase().includes(search.toLowerCase()) ||
        (g.guru?.nip && g.guru.nip.toLowerCase().includes(search.toLowerCase()))
    );

    if (showForm) {
        return (
            <GuruForm
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
            <GuruDetail
                user={selectedUser}
                onClose={handleCloseDetail}
                onEdit={handleEdit}
            />
        );
    }

    return (
        <div className="guru-page">
            <div className="page-header-bar">
                <div className="page-header-left">
                    <h2>Data Guru</h2>
                    <p>Kelola profil guru yang sudah terdaftar</p>
                </div>
            </div>

            <div className="search-card">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Cari nama, email, atau NIP guru..."
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
                    {filteredGuru.length === 0 ? (
                        <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                            <AlertCircle size={48} />
                            <p>Tidak ada user dengan role Guru. Silakan buat user dengan role Guru di menu User Management terlebih dahulu.</p>
                        </div>
                    ) : (
                        filteredGuru.map((g) => (
                            <div key={g.id} className={`guru-card ${!g.guru ? 'incomplete' : ''}`}>
                                <div className="guru-card-body">
                                    {!g.guru && (
                                        <div className="warning-badge">
                                            <AlertCircle size={16} />
                                            <span>Data belum lengkap</span>
                                        </div>
                                    )}

                                    <div className="guru-avatar-section">
                                        {g.foto ? (
                                            <img
                                                src={g.foto}
                                                alt={g.nama}
                                                className="guru-avatar"
                                            />
                                        ) : (
                                            <div className="guru-avatar-placeholder">
                                                <User size={50} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="guru-info">
                                        <h3 className="guru-name">{g.nama}</h3>
                                        <p className="guru-email">{g.email}</p>
                                    </div>

                                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                        <span className={`status-badge ${g.status === 'Aktif' ? 'aktif' : 'nonaktif'}`}>
                                            {g.status}
                                        </span>
                                    </div>

                                    {g.guru ? (
                                        <>
                                            <div className="guru-details">
                                                <div className="guru-detail-item">
                                                    <BookOpen size={16} className="guru-detail-icon" />
                                                    <span className={`guru-detail-text ${!g.guru.mata_pelajaran || g.guru.mata_pelajaran.length === 0 ? 'empty' : ''}`}>
                                                        {g.guru.mata_pelajaran && g.guru.mata_pelajaran.length > 0
                                                            ? g.guru.mata_pelajaran.join(", ")
                                                            : "Belum ditentukan"}
                                                    </span>
                                                </div>

                                                <div className="guru-detail-item">
                                                    <GraduationCap size={16} className="guru-detail-icon" />
                                                    <span className={`guru-detail-text ${!g.guru.kelas || g.guru.kelas.length === 0 ? 'empty' : ''}`}>
                                                        {g.guru.kelas && g.guru.kelas.length > 0
                                                            ? g.guru.kelas.map((k) => k.nama_kelas).join(", ")
                                                            : "Belum ditentukan"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="guru-actions">
                                                <button className="btn-action btn-detail" onClick={() => handleDetail(g)}>
                                                    <Eye size={16} />
                                                    Detail
                                                </button>
                                                <button className="btn-action btn-edit" onClick={() => handleEdit(g)}>
                                                    <Edit size={16} />
                                                    Edit
                                                </button>
                                                <button className="btn-action btn-delete" onClick={() => handleDelete(g.guru.id, g.nama)}>
                                                    <Trash2 size={16} />
                                                    Hapus
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="guru-details">
                                                <div className="guru-detail-item">
                                                    <BookOpen size={16} className="guru-detail-icon" />
                                                    <span className="guru-detail-text empty">Belum ditentukan</span>
                                                </div>
                                                <div className="guru-detail-item">
                                                    <GraduationCap size={16} className="guru-detail-icon" />
                                                    <span className="guru-detail-text empty">Belum ditentukan</span>
                                                </div>
                                            </div>

                                            <button className="btn-action btn-primary" onClick={() => handleLengkapiData(g)}>
                                                <Plus size={16} />
                                                Lengkapi Data
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

export default Guru;
