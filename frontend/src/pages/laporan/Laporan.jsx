import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
    FileText,
    Calendar,
    Download,
    CheckCircle,
    AlertCircle,
    Clock,
    XCircle,
    Info,
    School,
    Users
} from "lucide-react";
import Swal from "sweetalert2";
import "../users/Users.css";
import "../absensi/Absensi.css";

function Laporan() {
    const { token } = useAuth();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterBulan, setFilterBulan] = useState(new Date().getMonth() + 1);
    const [filterTahun, setFilterTahun] = useState(new Date().getFullYear());
    const [filterKelas, setFilterKelas] = useState("");
    const [kelasList, setKelasList] = useState([]);

    // Stats
    const [stats, setStats] = useState({
        totalSiswa: 0,
        totalHadir: 0,
        totalTerlambat: 0,
        totalSakit: 0,
        totalIzin: 0,
        totalAlpa: 0,
        avgPersentase: 0,
    });

    const fetchKelas = useCallback(async () => {
        try {
            const res = await api.get("/kelas", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setKelasList(res.data?.data || []);
        } catch (err) {
            console.error("Gagal memuat kelas:", err);
        }
    }, [token]);

    const fetchLaporan = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                bulan: filterBulan,
                tahun: filterTahun,
            };
            if (filterKelas) params.kelas_id = filterKelas;

            const res = await api.get("/laporan/rekap", {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });

            const rekap = res.data?.data?.rekap || [];
            setData(rekap);

            // Hitung stats
            const totalSiswa = rekap.length;
            const totalHadir = rekap.reduce((sum, r) => sum + r.hadir, 0);
            const totalTerlambat = rekap.reduce((sum, r) => sum + r.terlambat, 0);
            const totalSakit = rekap.reduce((sum, r) => sum + r.sakit, 0);
            const totalIzin = rekap.reduce((sum, r) => sum + r.izin, 0);
            const totalAlpa = rekap.reduce((sum, r) => sum + r.alpa, 0);
            const avgPersentase = totalSiswa > 0
                ? Math.round(rekap.reduce((sum, r) => sum + r.persentase_kehadiran, 0) / totalSiswa)
                : 0;

            setStats({
                totalSiswa,
                totalHadir,
                totalTerlambat,
                totalSakit,
                totalIzin,
                totalAlpa,
                avgPersentase,
            });
        } catch (err) {
            Swal.fire("Error", "Gagal memuat laporan", "error");
        } finally {
            setLoading(false);
        }
    }, [token, filterBulan, filterTahun, filterKelas]);

    useEffect(() => {
        fetchKelas();
    }, [fetchKelas]);

    useEffect(() => {
        fetchLaporan();
    }, [fetchLaporan]);

    const handleExport = () => {
        // Build CSV
        const headers = ["NISN", "Nama", "Kelas", "Hadir", "Terlambat", "Sakit", "Izin", "Alpa", "Total", "Persentase"];
        const rows = data.map((r) => [
            r.nisn,
            r.nama,
            r.kelas,
            r.hadir,
            r.terlambat,
            r.sakit,
            r.izin,
            r.alpa,
            r.total,
            r.persentase_kehadiran + "%",
        ]);

        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `laporan-absensi-${filterBulan}-${filterTahun}.csv`;
        link.click();
    };

    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];

    return (
        <div className="absen-page-container">
            {/* Header */}
            <div className="absen-header-hero">
                <div>
                    <h1 className="absen-header-title">
                        <span className="title-icon"><FileText size={20} /></span>
                        Laporan Rekap Absensi
                    </h1>
                    <p className="absen-header-subtitle">
                        Rekap kehadiran siswa berdasarkan bulan dan kelas.
                    </p>
                </div>
                <div className="absen-header-right">
                    <button className="btn-absen primary" onClick={handleExport} disabled={loading || data.length === 0}>
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="absen-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                <div className="absen-stat-card stat-hadir">
                    <div className="absen-stat-icon"><CheckCircle size={22} /></div>
                    <div className="absen-stat-info">
                        <div className="absen-stat-label">Rata-rata Kehadiran</div>
                        <div className="absen-stat-value">{stats.avgPersentase}%</div>
                    </div>
                </div>
                <div className="absen-stat-card stat-hadir">
                    <div className="absen-stat-icon"><Users size={22} /></div>
                    <div className="absen-stat-info">
                        <div className="absen-stat-label">Total Siswa</div>
                        <div className="absen-stat-value">{stats.totalSiswa}</div>
                    </div>
                </div>
                <div className="absen-stat-card stat-terlambat">
                    <div className="absen-stat-icon"><Clock size={22} /></div>
                    <div className="absen-stat-info">
                        <div className="absen-stat-label">Terlambat</div>
                        <div className="absen-stat-value">{stats.totalTerlambat}</div>
                    </div>
                </div>
                <div className="absen-stat-card stat-izin">
                    <div className="absen-stat-icon"><Info size={22} /></div>
                    <div className="absen-stat-info">
                        <div className="absen-stat-label">Sakit / Izin</div>
                        <div className="absen-stat-value">{stats.totalSakit + stats.totalIzin}</div>
                    </div>
                </div>
                <div className="absen-stat-card stat-alpha">
                    <div className="absen-stat-icon"><XCircle size={22} /></div>
                    <div className="absen-stat-info">
                        <div className="absen-stat-label">Alpa</div>
                        <div className="absen-stat-value">{stats.totalAlpa}</div>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="absen-filter-card">
                <div className="filter-grid-row">
                    <div className="filter-col">
                        <label><Calendar size={13} /> Bulan</label>
                        <select
                            className="form-control"
                            value={filterBulan}
                            onChange={(e) => setFilterBulan(Number(e.target.value))}
                        >
                            {monthNames.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-col">
                        <label><Calendar size={13} /> Tahun</label>
                        <select
                            className="form-control"
                            value={filterTahun}
                            onChange={(e) => setFilterTahun(Number(e.target.value))}
                        >
                            {[2024, 2025, 2026, 2027].map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-col flex-grow">
                        <label><School size={13} /> Kelas</label>
                        <select
                            className="form-control"
                            value={filterKelas}
                            onChange={(e) => setFilterKelas(e.target.value)}
                        >
                            <option value="">Semua Kelas</option>
                            {kelasList.map((k) => (
                                <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner" />
                    <p style={{ marginTop: "1rem", color: "#64748b", fontWeight: 600 }}>Memuat laporan...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="empty-state">
                    <AlertCircle size={44} />
                    <p>Tidak ada data laporan untuk filter ini.</p>
                </div>
            ) : (
                <div className="absen-table-container">
                    <div className="table-top-bar">
                        <div className="table-count-text">
                            Laporan {monthNames[filterBulan - 1]} {filterTahun}
                            <span className="count-pill">{data.length} siswa</span>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="modern-absen-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "50px" }}>#</th>
                                    <th>NISN</th>
                                    <th>Nama</th>
                                    <th>Kelas</th>
                                    <th>Hadir</th>
                                    <th>Terlambat</th>
                                    <th>Sakit</th>
                                    <th>Izin</th>
                                    <th>Alpa</th>
                                    <th>Total</th>
                                    <th>Persentase</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, idx) => (
                                    <tr key={item.siswa_id}>
                                        <td style={{ fontWeight: 700, color: "#94a3b8" }}>{idx + 1}</td>
                                        <td style={{ fontFamily: "monospace", fontSize: "0.825rem" }}>{item.nisn}</td>
                                        <td style={{ fontWeight: 700, color: "#0f172a" }}>{item.nama}</td>
                                        <td>
                                            <span className="absen-badge badge-secondary" style={{ fontSize: "0.72rem" }}>
                                                {item.kelas}
                                            </span>
                                        </td>
                                        <td style={{ color: "#059669", fontWeight: 700 }}>{item.hadir}</td>
                                        <td style={{ color: "#f59e0b", fontWeight: 700 }}>{item.terlambat}</td>
                                        <td style={{ color: "#3b82f6", fontWeight: 700 }}>{item.sakit}</td>
                                        <td style={{ color: "#8b5cf6", fontWeight: 700 }}>{item.izin}</td>
                                        <td style={{ color: "#ef4444", fontWeight: 700 }}>{item.alpa}</td>
                                        <td style={{ fontWeight: 700 }}>{item.total}</td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <div style={{
                                                    width: "60px", height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden"
                                                }}>
                                                    <div style={{
                                                        width: `${item.persentase_kehadiran}%`,
                                                        height: "100%",
                                                        background: item.persentase_kehadiran >= 80 ? "#059669"
                                                            : item.persentase_kehadiran >= 60 ? "#f59e0b" : "#ef4444",
                                                        borderRadius: "4px",
                                                    }}></div>
                                                </div>
                                                <span style={{
                                                    fontWeight: 700,
                                                    color: item.persentase_kehadiran >= 80 ? "#059669"
                                                        : item.persentase_kehadiran >= 60 ? "#f59e0b" : "#ef4444",
                                                    fontSize: "0.825rem",
                                                }}>
                                                    {item.persentase_kehadiran}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Laporan;
