import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getTimetable } from "../../services/jadwalService";
import TimetableGrid from "./TimetableGrid";
import { CalendarDays } from "lucide-react";
import "../../pages/absensi/Absensi.css";
import "../../pages/users/Users.css";
import "./Jadwal.css";

const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

function getHariIndex() {
    const d = new Date().getDay();
    return d >= 1 && d <= 5 ? d - 1 : 0;
}

function JadwalReadonly() {
    const { user } = useAuth();
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeHari, setActiveHari] = useState(HARI_LIST[getHariIndex()]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { getToken } = await import("../../context/AuthContext");
                // token from context
            } catch { /* skip */ }
        };
        fetch();
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Token diambil dari localStorage (sudah tersedia di context)
                const token = localStorage.getItem("token");
                const { default: api } = await import("../../services/api");
                const res = await api.get("/jadwal-pelajaran/timetable", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTimetable(res.data?.data || null);
            } catch {
                // abaikan
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const isGuru = user?.role === "Guru";
    const title = isGuru ? "Jadwal Mengajar Saya" : "Jadwal Kelas";
    const subtitle = isGuru
        ? "Jadwal mengajar yang ditugaskan untuk Anda."
        : "Jadwal belajar mengajar untuk kelas Anda.";

    return (
        <div className="jadwal-page">
            {/* Header */}
            <div className="absen-header-hero">
                <div>
                    <h1 className="absen-header-title">
                        <span className="title-icon"><CalendarDays size={20} /></span>
                        {title}
                    </h1>
                    <p className="absen-header-subtitle">{subtitle}</p>
                </div>
            </div>

            {/* Day Tabs */}
            <div className="jadwal-day-tabs">
                {HARI_LIST.map((h) => (
                    <button
                        key={h}
                        className={`jadwal-day-tab ${activeHari === h ? "active" : ""}`}
                        onClick={() => setActiveHari(h)}
                    >
                        {h}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner" />
                    <p style={{ marginTop: "1rem", color: "#64748b", fontWeight: 600 }}>Memuat jadwal...</p>
                </div>
            ) : !timetable?.jam_pelajaran?.length ? (
                <div className="empty-state">
                    <CalendarDays size={44} />
                    <p>Belum ada jadwal pelajaran yang tersedia.</p>
                </div>
            ) : (
                <TimetableGrid
                    timetable={timetable}
                    activeHari={activeHari}
                    readOnly={true}
                />
            )}
        </div>
    );
}

export default JadwalReadonly;
