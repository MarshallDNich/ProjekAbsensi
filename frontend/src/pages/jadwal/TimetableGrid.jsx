import { useMemo } from "react";
import { Clock, Check } from "lucide-react";

// Generate consistent color from string (kode mapel)
function strToColor(str) {
    const colors = [
        { bg: "#eff6ff", fg: "#2563eb", border: "#bfdbfe" },
        { bg: "#fef2f2", fg: "#dc2626", border: "#fecaca" },
        { bg: "#ecfdf5", fg: "#059669", border: "#a7f3d0" },
        { bg: "#fef3c7", fg: "#d97706", border: "#fde68a" },
        { bg: "#f3e8ff", fg: "#7c3aed", border: "#ddd6fe" },
        { bg: "#fce7f3", fg: "#db2777", border: "#fbcfe8" },
        { bg: "#ecfeff", fg: "#0891b2", border: "#a5f3fc" },
        { bg: "#f0fdf4", fg: "#15803d", border: "#bbf7d0" },
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function JadwalCell({ jadwal, onClick, readOnly }) {
    if (!jadwal) {
        if (readOnly) {
            return (
                <td>
                    <div className="jadwal-cell" style={{ background: "#fafbfd", minHeight: "56px" }} />
                </td>
            );
        }
        return (
            <td>
                <div
                    className="jadwal-cell jadwal-cell-empty"
                    onClick={onClick}
                    title="Klik untuk tambah jadwal"
                />
            </td>
        );
    }

    const color = strToColor(jadwal.mata_pelajaran?.kode || "");
    return (
        <td>
            <div
                className={`jadwal-cell jadwal-cell-filled ${readOnly ? "" : "clickable"}`}
                style={{ borderLeftColor: color.fg, cursor: readOnly ? "default" : "pointer" }}
                onClick={onClick}
                title={`${jadwal.mata_pelajaran?.nama} — ${jadwal.guru?.nama}`}
            >
                <span className="jadwal-cell-kode" style={{ color: color.fg }}>
                    {jadwal.mata_pelajaran?.kode || "?"}
                </span>
                <span className="jadwal-cell-guru">{jadwal.guru?.nama || "—"}</span>
            </div>
        </td>
    );
}

export default function TimetableGrid({
    timetable,   // { hari, kelas, jam_pelajaran, jadwal }
    activeHari,
    readOnly = false,
    onCellClick,
    filterKelasId,
}) {
    const { kelas, jamPelajaran, jadwalData } = useMemo(() => {
        const k = timetable?.kelas || [];
        const jp = timetable?.jam_pelajaran || [];
        const jd = timetable?.jadwal?.[activeHari] || {};
        return { kelas: k, jamPelajaran: jp, jadwalData: jd };
    }, [timetable, activeHari]);

    const filteredKelas = useMemo(() => {
        if (!filterKelasId) return kelas;
        return kelas.filter((k) => String(k.id) === String(filterKelasId));
    }, [kelas, filterKelasId]);

    // Build unique mapel legend from current jadwal data
    const legend = useMemo(() => {
        const map = {};
        for (const kid of Object.keys(jadwalData)) {
            for (const jid of Object.keys(jadwalData[kid])) {
                const j = jadwalData[kid][jid];
                const kode = j.mata_pelajaran?.kode;
                if (kode && !map[kode]) {
                    map[kode] = { kode, nama: j.mata_pelajaran?.nama, color: strToColor(kode) };
                }
            }
        }
        return Object.values(map).sort((a, b) => a.kode.localeCompare(b.kode));
    }, [jadwalData]);

    if (!timetable) return null;

    return (
        <div>
            <div className="jadwal-grid-wrap">
                <table className="jadwal-grid">
                    <thead>
                        <tr>
                            <th>Jam</th>
                            {filteredKelas.map((k) => (
                                <th key={k.id}>{k.nama_kelas}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {jamPelajaran.map((jp) => {
                            if (jp.tipe === "break") {
                                return (
                                    <tr key={jp.id} className="jadwal-break-row">
                                        <td colSpan={filteredKelas.length + 1}>
                                            <div className="jadwal-break-label">
                                                ☕ {jp.nama} ({jp.jam_mulai} – {jp.jam_selesai})
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }

                            return (
                                <tr key={jp.id}>
                                    <td>
                                        <div style={{ fontFamily: "ui-monospace, Consolas, monospace", fontWeight: 700, fontSize: "0.78rem", color: "#0f172a" }}>
                                            {jp.jam_mulai}–{jp.jam_selesai}
                                        </div>
                                        <div className="jadwal-time-name">{jp.nama}</div>
                                    </td>
                                    {filteredKelas.map((k) => (
                                        <JadwalCell
                                            key={`${jp.id}-${k.id}`}
                                            jadwal={jadwalData?.[k.id]?.[jp.id]}
                                            readOnly={readOnly}
                                            onClick={() => {
                                                if (!readOnly) onCellClick?.(jp, k, jadwalData?.[k.id]?.[jp.id] || null);
                                            }}
                                        />
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            {legend.length > 0 && (
                <div className="jadwal-legend">
                    {legend.map((l) => (
                        <span key={l.kode} className="jadwal-legend-item">
                            <span className="jadwal-legend-dot" style={{ background: l.color.fg }} />
                            <strong>{l.kode}</strong> {l.nama}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
