import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    getAllMataPelajaran,
    deleteMataPelajaran,
} from "../../services/mataPelajaranService";
import {
    Plus,
    Search,
    Eye,
    Pencil,
    Trash2,
    AlertCircle,
    GraduationCap,
    School,
} from "lucide-react";
import Swal from "sweetalert2";
import MapelForm from "./MapelForm";
import MapelDetail from "./MapelDetail";
import "./Mapel.css";

const STATUSES = ["Aktif", "Tidak Aktif"];

function Mapel() {
    const { token } = useAuth();

    const [mapel, setMapel] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [mode, setMode] = useState("create");
    const [selected, setSelected] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    const fetchMapel = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAllMataPelajaran(token, { per_page: 100 });
            setMapel(response.data.data || []);
        } catch (error) {
            console.error("Error fetching mapel:", error);
            Swal.fire("Error", "Gagal mengambil data mata pelajaran", "error");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchMapel();
    }, [fetchMapel]);

    const filtered = mapel.filter((m) => {
        const q = search.toLowerCase().trim();
        const matchSearch =
            !q ||
            (m.nama || "").toLowerCase().includes(q) ||
            (m.kode || "").toLowerCase().includes(q) ||
            (m.deskripsi || "").toLowerCase().includes(q);
        const matchStatus = !statusFilter || m.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const handleOpenAdd = () => {
        setMode("create");
        setSelected(null);
        setShowForm(true);
    };

    const handleOpenEdit = (m) => {
        setMode("edit");
        setSelected(m);
        setShowForm(true);
    };

    const handleOpenDetail = (m) => {
        setSelected(m);
        setShowDetail(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setSelected(null);
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
        setSelected(null);
    };

    const handleSuccess = () => {
        fetchMapel();
        handleCloseForm();
    };

    const handleDelete = async (m) => {
        const result = await Swal.fire({
            title: "Konfirmasi Hapus",
            html: `Apakah Anda yakin ingin menghapus mata pelajaran <strong>${m.nama}</strong>?<br/><small>Penugasan Guru yang terkait tidak ikut terhapus.</small>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
            try {
                await deleteMataPelajaran(token, m.id);
                Swal.fire("Berhasil", `Mata pelajaran ${m.nama} berhasil dihapus`, "success");
                fetchMapel();
            } catch (error) {
                console.error("Error deleting mapel:", error);
                Swal.fire("Error", error.response?.data?.message || "Gagal menghapus mata pelajaran", "error");
            }
        }
    };

    if (showDetail) {
        return (
            <MapelDetail
                mapelId={selected.id}
                onClose={handleCloseDetail}
            />
        );
    }

    return (
        <div className="mapel-page">
            <div className="page-header-bar">
                <div className="page-header-left">
                    <h2>Mata Pelajaran</h2>
                    <p>Master data mata pelajaran yang dipakai pada penugasan Guru, Jadwal, dan Absensi</p>
                </div>
                <button className="btn-add" onClick={handleOpenAdd}>
                    <Plus size={16} />
                    Tambah Mapel
                </button>
            </div>

            <div className="table-toolbar">
                <div className="search-box">
                    <Search size={15} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Cari kode atau nama mata pelajaran..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Semua Status</option>
                    {STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>

                <div className="toolbar-right">
                    <span className="mapel-total">{mapel.length} mapel</span>
                </div>
            </div>

            <div className="table-card">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Kode</th>
                                <th>Mata Pelajaran</th>
                                <th>Guru Pengampu</th>
                                <th>Kelas</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i}>
                                        <td><div className="skeleton-bar" style={{ width: 42 }} /></td>
                                        <td><div className="skeleton-bar" style={{ width: 160 }} /></td>
                                        <td><div className="skeleton-bar" style={{ width: 70 }} /></td>
                                        <td><div className="skeleton-bar" style={{ width: 60 }} /></td>
                                        <td><div className="skeleton-bar" style={{ width: 50 }} /></td>
                                        <td><div className="skeleton-bar" style={{ width: 80 }} /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="empty-state">
                                            <AlertCircle size={40} />
                                            <p>
                                                {search || statusFilter
                                                    ? "Tidak ada mata pelajaran yang sesuai pencarian/filter."
                                                    : "Belum ada data mata pelajaran. Silakan tambahkan terlebih dahulu."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((m) => (
                                    <tr key={m.id}>
                                        <td>
                                            <span className="mapel-kode">{m.kode}</span>
                                        </td>
                                        <td>
                                            <div className="mapel-name">{m.nama}</div>
                                            {m.deskripsi && (
                                                <div className="mapel-desc">{m.deskripsi}</div>
                                            )}
                                        </td>
                                        <td>
                                            <span className="mapel-count-chip">
                                                <GraduationCap size={14} />
                                                {m.guru_count || 0} Guru
                                            </span>
                                        </td>
                                        <td>
                                            <span className="mapel-count-chip">
                                                <School size={14} />
                                                {m.kelas_count || 0} Kelas
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${m.status === "Aktif" ? "aktif" : "nonaktif"}`}>
                                                <span className="dot" />
                                                {m.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon detail"
                                                    title="Lihat Detail"
                                                    onClick={() => handleOpenDetail(m)}
                                                >
                                                    <Eye size={13} />
                                                </button>
                                                <button
                                                    className="btn-icon edit"
                                                    title="Edit Mapel"
                                                    onClick={() => handleOpenEdit(m)}
                                                >
                                                    <Pencil size={13} />
                                                </button>
                                                <button
                                                    className="btn-icon delete"
                                                    title="Hapus Mapel"
                                                    onClick={() => handleDelete(m)}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <MapelForm
                    mode={mode}
                    mapel={selected}
                    onClose={handleCloseForm}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}

export default Mapel;
