import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAbsensiList } from "../../services/absensiService";
import { getAllKelas } from "../../services/kelasService";
import {
    Search,
    Users,
    AlertCircle,
    CalendarDays,
    Filter,
    CheckCircle2,
    Clock,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Layers,
    GraduationCap,
    FileSpreadsheet,
    Printer,
    Download,
} from "lucide-react";
import Swal from "sweetalert2";
import "./Absensi.css";

function todayStr() {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d - tzOffset).toISOString().slice(0, 10);
}

const STATUS_MAP = {
    Hadir: "badge-hadir",
    Terlambat: "badge-terlambat",
    Izin: "badge-izin",
    Sakit: "badge-sakit",
    Alpha: "badge-alpha",
};

function StatusBadge({ status }) {
    return (
        <span className={`absen-badge ${STATUS_MAP[status] || "badge-secondary"}`}>
            {status === "Hadir" && <CheckCircle2 size={12} />}
            {status === "Terlambat" && <Clock size={12} />}
            {status === "Izin" && <Sparkles size={12} />}
            {status}
        </span>
    );
}

function AbsensiAdmin() {
    const { token } = useAuth();

    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({});
    const [kelas, setKelas] = useState([]);

    const [loading, setLoading] = useState(true);
    const [tanggal, setTanggal] = useState(todayStr());
    const [kelasId, setKelasId] = useState("");
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");

    const fetchKelas = async () => {
        try {
            const res = await getAllKelas(token, { per_page: 100 });
            setKelas(res.data.data || []);
        } catch (err) {
            // abaikan
        }
    };

    const fetchAbsensi = async (params = {}) => {
        setLoading(true);
        try {
            const res = await getAbsensiList(token, {
                tanggal,
                kelas_id: kelasId || undefined,
                status: status || undefined,
                search: search || undefined,
                per_page: 25,
                ...params,
            });
            setData(res.data.data || []);
            setMeta(res.data.meta || {});
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Gagal mengambil data absensi", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKelas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchAbsensi({ page: 1 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tanggal, kelasId, status]);

    const handleSearchSubmit = (e) => {
        e?.preventDefault();
        fetchAbsensi({ page: 1 });
    };

    const changeDateBy = (days) => {
        const d = new Date(tanggal);
        d.setDate(d.getDate() + days);
        const tzOffset = d.getTimezoneOffset() * 60000;
        setTanggal(new Date(d - tzOffset).toISOString().slice(0, 10));
    };

    // Export to Excel / CSV
    const handleExportExcel = () => {
        if (data.length === 0) {
            Swal.fire("Info", "Tidak ada data absensi untuk diekspor pada tanggal ini.", "info");
            return;
        }

        const headers = [
            "No",
            "Nama Siswa",
            "NISN",
            "Kelas",
            "Tanggal",
            "Jam Masuk",
            "Jam Keluar",
            "Status",
            "Keterangan",
        ];

        const rows = data.map((item, idx) => [
            idx + 1,
            `"${item.siswa?.user?.nama || "-"}"`,
            `"${item.siswa?.nisn || "-"}"`,
            `"${item.siswa?.kelas?.nama_kelas || "-"}"`,
            `"${item.tanggal || "-"}"`,
            `"${item.jam_masuk || "-"}"`,
            `"${item.jam_keluar || "-"}"`,
            `"${item.status || "-"}"`,
            `"${(item.keterangan || "-").replace(/"/g, '""')}"`,
        ]);

        const csvContent =
            "\uFEFF" + // UTF-8 BOM for Microsoft Excel compatibility
            [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);

        const currentKelasObj = kelas.find((k) => String(k.id) === String(kelasId));
        const kelasLabel = currentKelasObj ? `-${currentKelasObj.nama_kelas}` : "";
        link.setAttribute("download", `rekap-absensi-${tanggal}${kelasLabel}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Swal.fire({
            icon: "success",
            title: "Export Berhasil",
            text: `File rekap absensi tanggal ${tanggal} berhasil diunduh.`,
            timer: 2000,
            showConfirmButton: false,
        });
    };

    // Print Report
    const handlePrint = () => {
        if (data.length === 0) {
            Swal.fire("Info", "Tidak ada data untuk dicetak.", "info");
            return;
        }
        window.print();
    };

    // Calculate quick metrics for current view
    const hadirCount = data.filter((d) => d.status === "Hadir").length;
    const terlambatCount = data.filter((d) => d.status === "Terlambat").length;
    const izinSakitCount = data.filter(
        (d) => d.status === "Izin" || d.status === "Sakit"
    ).length;

    const currentKelasObj = kelas.find((k) => String(k.id) === String(kelasId));

    return (
        <div className="absen-page-container">
            {/* Formal Print-Only Header */}
            <div className="print-only-header">
                <h1 className="print-school-title">SISTEM INFORMASI ABSENSI SEKOLAH</h1>
                <p className="print-school-sub">
                    Laporan Rekapitulasi Presensi Kehadiran Siswa
                </p>
                <div className="print-doc-title">
                    Tanggal: {tanggal} {currentKelasObj ? `• Kelas: ${currentKelasObj.nama_kelas}` : "• Semua Kelas"}
                </div>
            </div>

            {/* Header Hero */}
            <div className="absen-header-hero">
                <div>
                    <h1 className="absen-header-title">
                        <span className="title-icon">
                            <Users size={20} />
                        </span>
                        Rekap Presensi Siswa
                    </h1>
                    <p className="absen-header-subtitle">
                        Monitoring data kehadiran seluruh siswa berdasarkan tanggal, kelas, dan status presensi.
                    </p>
                </div>
                <div className="absen-header-right">
                    <button
                        type="button"
                        className="btn-export-excel"
                        onClick={handleExportExcel}
                        title="Ekspor ke format Excel / CSV"
                    >
                        <FileSpreadsheet size={16} />
                        Export Excel
                    </button>

                    <button
                        type="button"
                        className="btn-print-report"
                        onClick={handlePrint}
                        title="Cetak Laporan Presensi"
                    >
                        <Printer size={16} />
                        Cetak Laporan
                    </button>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginLeft: "0.5rem" }}>
                        <button
                            type="button"
                            className="page-nav-btn"
                            onClick={() => changeDateBy(-1)}
                            title="Hari Sebelumnya"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            type="button"
                            className={`page-nav-btn ${tanggal === todayStr() ? "active" : ""}`}
                            onClick={() => setTanggal(todayStr())}
                            style={{
                                background: tanggal === todayStr() ? "#dc2626" : "#ffffff",
                                color: tanggal === todayStr() ? "#ffffff" : "#334155",
                                borderColor: tanggal === todayStr() ? "#dc2626" : "#e2e8f0",
                            }}
                        >
                            Hari Ini
                        </button>
                        <button
                            type="button"
                            className="page-nav-btn"
                            onClick={() => changeDateBy(1)}
                            title="Hari Berikutnya"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="absen-stats-grid">
                <div className="absen-stat-card stat-hadir">
                    <div className="absen-stat-icon">
                        <CheckCircle2 size={22} />
                    </div>
                    <div className="absen-stat-info">
                        <div className="absen-stat-label">Hadir Tepat Waktu</div>
                        <div className="absen-stat-value">{hadirCount}</div>
                    </div>
                </div>

                <div className="absen-stat-card stat-terlambat">
                    <div className="absen-stat-icon">
                        <Clock size={22} />
                    </div>
                    <div className="absen-stat-info">
                        <div className="absen-stat-label">Terlambat Masuk</div>
                        <div className="absen-stat-value">{terlambatCount}</div>
                    </div>
                </div>

                <div className="absen-stat-card stat-izin">
                    <div className="absen-stat-icon">
                        <Sparkles size={22} />
                    </div>
                    <div className="absen-stat-info">
                        <div className="absen-stat-label">Izin / Sakit</div>
                        <div className="absen-stat-value">{izinSakitCount}</div>
                    </div>
                </div>

                <div className="absen-stat-card stat-alpha">
                    <div className="absen-stat-icon">
                        <Layers size={22} />
                    </div>
                    <div className="absen-stat-info">
                        <div className="absen-stat-label">Total Absen Tanggal Ini</div>
                        <div className="absen-stat-value">{meta.total ?? data.length}</div>
                    </div>
                </div>
            </div>

            {/* Filter Card */}
            <div className="absen-filter-card">
                <form onSubmit={handleSearchSubmit} className="filter-grid-row">
                    <div className="filter-col">
                        <label>
                            <CalendarDays size={13} /> Tanggal Presensi
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            value={tanggal}
                            onChange={(e) => setTanggal(e.target.value)}
                        />
                    </div>

                    <div className="filter-col">
                        <label>
                            <GraduationCap size={13} /> Kelas
                        </label>
                        <select
                            className="form-control"
                            value={kelasId}
                            onChange={(e) => setKelasId(e.target.value)}
                        >
                            <option value="">Semua Kelas</option>
                            {kelas.map((k) => (
                                <option key={k.id} value={k.id}>
                                    {k.nama_kelas} - {k.jurusan} (Tk. {k.tingkat})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-col flex-grow">
                        <label>
                            <Search size={13} /> Cari Siswa
                        </label>
                        <div className="search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Ketik nama atau NISN..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-col">
                        <label>&nbsp;</label>
                        <button type="submit" className="btn-action btn-primary" style={{ padding: "0.55rem 1.25rem" }}>
                            <Filter size={15} /> Terapkan Filter
                        </button>
                    </div>
                </form>

                {/* Status Tabs */}
                <div className="status-tabs-row">
                    {[
                        { val: "", label: "Semua Status" },
                        { val: "Hadir", label: "Hadir" },
                        { val: "Terlambat", label: "Terlambat" },
                        { val: "Izin", label: "Izin" },
                        { val: "Sakit", label: "Sakit" },
                        { val: "Alpha", label: "Alpha" },
                    ].map((tab) => (
                        <button
                            key={tab.val}
                            type="button"
                            className={`status-tab-btn ${
                                status === tab.val ? "active" : ""
                            }`}
                            onClick={() => setStatus(tab.val)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p style={{ marginTop: "1rem", color: "#64748b", fontWeight: 600 }}>
                        Memuat data presensi siswa...
                    </p>
                </div>
            ) : data.length === 0 ? (
                <div className="empty-state">
                    <AlertCircle size={44} />
                    <p>
                        Belum ada siswa yang tercatat melakukan presensi pada tanggal{" "}
                        <b>{tanggal}</b>.
                    </p>
                </div>
            ) : (
                <div className="absen-table-container">
                    <div className="table-top-bar">
                        <div className="table-count-text">
                            Daftar Presensi Siswa ({tanggal})
                            <span className="count-pill">
                                {meta.total ?? data.length} siswa
                            </span>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="modern-absen-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "45px" }}>#</th>
                                    <th>Siswa</th>
                                    <th>Kelas</th>
                                    <th>Waktu Masuk</th>
                                    <th>Status</th>
                                    <th>Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: 700, color: "#94a3b8" }}>
                                            {(meta.current_page
                                                ? (meta.current_page - 1) *
                                                  meta.per_page
                                                : 0) + idx + 1}
                                        </td>
                                        <td>
                                            <div className="student-meta-cell">
                                                <div className="student-meta-avatar">
                                                    {item.siswa?.user?.nama
                                                        ?.charAt(0)
                                                        .toUpperCase() || "S"}
                                                </div>
                                                <div>
                                                    <div className="student-meta-name">
                                                        {item.siswa?.user?.nama || "—"}
                                                    </div>
                                                    <div className="student-meta-sub">
                                                        NISN: {item.siswa?.nisn || "—"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {item.siswa?.kelas?.nama_kelas ? (
                                                <span
                                                    style={{
                                                        background: "#eff6ff",
                                                        color: "#2563eb",
                                                        border: "1px solid #bfdbfe",
                                                        padding: "0.25rem 0.65rem",
                                                        borderRadius: "50px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {item.siswa.kelas.nama_kelas}
                                                </span>
                                            ) : (
                                                <span style={{ color: "#94a3b8" }}>—</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="time-cell-badge">
                                                <Clock size={13} color="#64748b" />
                                                {item.jam_masuk || "—"}
                                            </span>
                                        </td>
                                        <td>
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td>
                                            <span style={{ color: item.keterangan ? "#334155" : "#94a3b8", fontSize: "0.825rem" }}>
                                                {item.keterangan || "—"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {meta.last_page > 1 && (
                        <div className="absen-pagination-bar">
                            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                                Halaman <b>{meta.current_page}</b> dari <b>{meta.last_page}</b>
                            </span>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                    className="page-nav-btn"
                                    disabled={meta.current_page <= 1}
                                    onClick={() => fetchAbsensi({ page: meta.current_page - 1 })}
                                >
                                    <ChevronLeft size={16} /> Sebelumnya
                                </button>
                                <button
                                    className="page-nav-btn"
                                    disabled={meta.current_page >= meta.last_page}
                                    onClick={() => fetchAbsensi({ page: meta.current_page + 1 })}
                                >
                                    Berikutnya <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Print-Only Signature Footer */}
            <div className="print-only-footer">
                <div className="print-sign-box">
                    <div>Mengetahui,</div>
                    <div>Kepala Sekolah</div>
                    <div className="print-sign-space"></div>
                    <div className="print-sign-name">( ............................................ )</div>
                    <div style={{ fontSize: "9pt", color: "#666" }}>NIP. ........................................</div>
                </div>

                <div className="print-sign-box">
                    <div>Dicetak pada: {new Date().toLocaleDateString("id-ID")}</div>
                    <div>Petugas / Wali Kelas</div>
                    <div className="print-sign-space"></div>
                    <div className="print-sign-name">( ............................................ )</div>
                    <div style={{ fontSize: "9pt", color: "#666" }}>NIP. ........................................</div>
                </div>
            </div>
        </div>
    );
}

export default AbsensiAdmin;
