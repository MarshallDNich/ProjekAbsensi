import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAllKelas, deleteKelas } from "../../services/kelasService";
import { getAllGuru } from "../../services/guruService";
import {
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    AlertCircle,
    GraduationCap,
    UserCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import KelasForm from "./KelasForm";
import KelasDetail from "./KelasDetail";
import "./Kelas.css";

function Kelas() {
    const { token } = useAuth();

    const [kelas, setKelas] = useState([]);
    const [guruList, setGuruList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [mode, setMode] = useState("create");
    const [selectedKelas, setSelectedKelas] = useState(null);

    const [showDetail, setShowDetail] = useState(false);

    const fetchKelas = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAllKelas(token, { per_page: 100 });
            setKelas(response.data.data || []);
        } catch (error) {
            console.error("Error fetching kelas:", error);
            Swal.fire("Error", "Gagal mengambil data kelas", "error");
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchGuru = useCallback(async () => {
        try {
            const response = await getAllGuru(token, { per_page: 100 });
            setGuruList(response.data.data || []);
        } catch (error) {
            console.error("Error fetching guru:", error);
        }
    }, [token]);

    useEffect(() => {
        fetchKelas();
        fetchGuru();
    }, [fetchKelas, fetchGuru]);

    useEffect(() => {
        const q = search.toLowerCase().trim();
        if (!q) {
            setFiltered(kelas);
            return;
        }
        setFiltered(
            kelas.filter(
                (k) =>
                    (k.nama_kelas || "").toLowerCase().includes(q) ||
                    (k.jurusan || "").toLowerCase().includes(q) ||
                    (k.tingkat || "").toLowerCase().includes(q)
            )
        );
    }, [search, kelas]);

    const handleOpenAdd = () => {
        setMode("create");
        setSelectedKelas(null);
        setShowForm(true);
    };

    const handleOpenEdit = (k) => {
        setMode("edit");
        setSelectedKelas(k);
        setShowForm(true);
    };

    const handleOpenDetail = (k) => {
        setSelectedKelas(k);
        setShowDetail(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setSelectedKelas(null);
    };

    const handleSuccess = () => {
        fetchKelas();
        handleCloseForm();
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
        setSelectedKelas(null);
    };

    const handleDelete = async (k) => {
        const result = await Swal.fire({
            title: "Konfirmasi Hapus",
            html: `Apakah Anda yakin ingin menghapus kelas <strong>${k.nama_kelas}</strong>?<br/><small>Data wali kelas dan penempatan siswa pada kelas ini akan terpengaruh.</small>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
            try {
                await deleteKelas(token, k.id);
                Swal.fire("Berhasil", `Kelas ${k.nama_kelas} berhasil dihapus`, "success");
                fetchKelas();
            } catch (error) {
                console.error("Error deleting kelas:", error);
                Swal.fire("Error", error.response?.data?.message || "Gagal menghapus kelas", "error");
            }
        }
    };

    if (showDetail) {
        return (
            <KelasDetail
                kelasId={selectedKelas.id}
                onClose={handleCloseDetail}
                onUpdated={fetchKelas}
            />
        );
    }

    return (
        <div className="kelas-page">
            <div className="page-header-bar">
                <div className="page-header-left">
                    <h2>Data Kelas</h2>
                    <p>Kelola kelas, wali kelas, dan penempatan siswa</p>
                </div>
                <button className="btn-add" onClick={handleOpenAdd}>
                    <Plus size={16} />
                    Tambah Kelas
                </button>
            </div>

            <div className="search-card">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Cari nama kelas, tingkat, atau jurusan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <AlertCircle size={48} />
                    <p>
                        {search
                            ? "Tidak ada kelas yang sesuai dengan pencarian."
                            : "Belum ada data kelas. Silakan tambahkan kelas terlebih dahulu."}
                    </p>
                </div>
            ) : (
                <div className="kelas-cards-grid">
                    {filtered.map((k) => {
                        const waliNama =
                            k.wali_kelas_guru?.user?.nama ||
                            k.wali_kelas_guru?.nama ||
                            null;
                        return (
                            <div key={k.id} className={`kelas-card ${!waliNama ? "incomplete" : ""}`}>
                                <div className="kelas-card-body">
                                    <div className="kelas-banner">
                                        <span className="tingkat-badge">{k.tingkat}</span>
                                        <div>
                                            <div className="kelas-banner-name">{k.nama_kelas}</div>
                                            <div className="kelas-banner-sub">{k.jurusan}</div>
                                        </div>
                                    </div>

                                    <div className="kelas-info">
                                        <div className="kelas-detail-item">
                                            <GraduationCap size={16} className="kelas-detail-icon" />
                                            {waliNama ? (
                                                <span className="kelas-detail-text">
                                                    Wali Kelas: <strong>{waliNama}</strong>
                                                </span>
                                            ) : (
                                                <span className="kelas-detail-text empty">
                                                    Belum ada wali kelas
                                                </span>
                                            )}
                                        </div>
                                        <div className="kelas-detail-item">
                                            <UserCircle size={16} className="kelas-detail-icon" />
                                            <span className="kelas-detail-text">
                                                Jurusan: <strong>{k.jurusan}</strong>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="kelas-stats">
                                        <div className="kelas-stat-box">
                                            <div className="kelas-stat-value">{k.total_siswa || 0}</div>
                                            <div className="kelas-stat-label">Siswa</div>
                                        </div>
                                        <div className="kelas-stat-box" style={{ background: "#fef3c7", borderColor: "#fde68a" }}>
                                            <div className="kelas-stat-value" style={{ color: "#92400e" }}>
                                                {k.tingkat}
                                            </div>
                                            <div className="kelas-stat-label" style={{ color: "#b45309" }}>
                                                Tingkat
                                            </div>
                                        </div>
                                    </div>

                                    <div className="kelas-actions">
                                        <button className="btn-action btn-detail" onClick={() => handleOpenDetail(k)}>
                                            <Eye size={16} />
                                            Detail
                                        </button>
                                        <button className="btn-action btn-edit" onClick={() => handleOpenEdit(k)}>
                                            <Edit size={16} />
                                            Edit
                                        </button>
                                        <button className="btn-action btn-delete" onClick={() => handleDelete(k)}>
                                            <Trash2 size={16} />
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showForm && (
                <KelasForm
                    mode={mode}
                    kelas={selectedKelas}
                    guruList={guruList}
                    onClose={handleCloseForm}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}

export default Kelas;