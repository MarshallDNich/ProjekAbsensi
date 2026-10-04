import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { 
  Users, 
  GraduationCap, 
  School, 
  ClipboardCheck,
  Clock,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ScanFace,
  Camera,
  Send,
  CalendarCheck,
  User,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const STATUS_ICONS = {
  Hadir: <CheckCircle size={18} className="text-success" />,
  Terlambat: <AlertCircle size={18} className="text-warning" />,
  Sakit: <Info size={18} className="text-info" />,
  Izin: <Info size={18} className="text-primary" />,
  Alpa: <XCircle size={18} className="text-danger" />,
};

// ===================== DASHBOARD ADMIN =====================
const AdminDashboard = ({ token }) => {
  const [stats, setStats] = useState({
    summary: { total_guru: 0, total_siswa: 0, total_kelas: 0, total_absensi_hari_ini: 0, siswa_belum_absen: 0, persentase_kehadiran_hari_ini: 0 },
    distribusi_status: { hadir: 0, terlambat: 0, sakit: 0, izin: 0, alpa: 0, belum_absen: 0, persentase: { hadir: 0, sakit: 0, izin: 0, alpa: 0 } },
    rekap_mingguan: [],
    aktivitas_terkini: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/admin-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.success && response.data?.data) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  const dist = stats.distribusi_status;
  const totalStatus = dist.hadir + dist.terlambat + dist.sakit + dist.izin + dist.alpa || 1;

  if (loading) {
    return <div className="loading-state"><div className="spinner" /><p>Memuat dashboard...</p></div>;
  }

  return (
    <>
      <div className="dash-stats-grid">
        <div className="dash-stat-card theme-blue">
          <div className="stat-icon-wrapper"><Users size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Total Siswa</p>
            <h3 className="stat-value">{stats.summary.total_siswa.toLocaleString('id-ID')}</h3>
          </div>
        </div>
        <div className="dash-stat-card theme-emerald">
          <div className="stat-icon-wrapper"><GraduationCap size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Total Guru</p>
            <h3 className="stat-value">{stats.summary.total_guru.toLocaleString('id-ID')}</h3>
          </div>
        </div>
        <div className="dash-stat-card theme-amber">
          <div className="stat-icon-wrapper"><School size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Total Kelas</p>
            <h3 className="stat-value">{stats.summary.total_kelas.toLocaleString('id-ID')}</h3>
          </div>
        </div>
        <div className="dash-stat-card theme-red">
          <div className="stat-icon-wrapper"><ClipboardCheck size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Kehadiran Hari Ini</p>
            <h3 className="stat-value">{stats.summary.persentase_kehadiran_hari_ini}%</h3>
            <p className="stat-trend"><BarChart3 size={14} /><span>{stats.summary.total_absensi_hari_ini}</span> siswa absen</p>
          </div>
        </div>
      </div>

      <div className="dash-charts-section">
        <div className="dash-card dash-chart-card chart-large">
          <div className="card-header"><h3 className="card-title">Rekap Kehadiran Mingguan</h3></div>
          <div className="card-body">
            <div className="css-bar-chart">
              {stats.rekap_mingguan.map((item, index) => (
                <div key={index} className="bar-wrapper">
                  <div className="bar-value-label">{item.percentage}%</div>
                  <div className="bar-track"><div className="bar-fill" style={{ height: `${item.percentage}%` }}></div></div>
                  <div className="bar-label">{item.day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="dash-card dash-chart-card chart-small">
          <div className="card-header"><h3 className="card-title">Distribusi Status Hari Ini</h3></div>
          <div className="card-body donut-chart-container">
            <div className="css-donut-chart">
              <div className="donut-hole">
                <span className="donut-total">{stats.summary.total_siswa.toLocaleString('id-ID')}</span>
                <span className="donut-label">Siswa</span>
              </div>
            </div>
            <div className="donut-legend">
              {[
                { label: 'Hadir', value: dist.hadir, pct: dist.persentase.hadir, color: '#059669' },
                { label: 'Terlambat', value: dist.terlambat, color: '#f59e0b' },
                { label: 'Sakit', value: dist.sakit, pct: dist.persentase.sakit, color: '#3b82f6' },
                { label: 'Izin', value: dist.izin, pct: dist.persentase.izin, color: '#8b5cf6' },
                { label: 'Alpa', value: dist.alpa, pct: dist.persentase.alpa, color: '#ef4444' },
                { label: 'Belum Absen', value: dist.belum_absen, color: '#94a3b8' },
              ].map((item) => (
                <div key={item.label} className="legend-item">
                  <span className="legend-dot" style={{ background: item.color }}></span>
                  <span className="legend-label">{item.label}</span>
                  <span className="legend-value">{item.pct !== undefined ? `${item.pct}% (${item.value})` : item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dash-info-grid">
        <div className="dash-card dash-activity-card">
          <div className="card-header"><h3 className="card-title">Aktivitas Terkini</h3></div>
          <div className="card-body">
            {stats.aktivitas_terkini.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Belum ada aktivitas</p>
            ) : (
              <div className="activity-list">
                {stats.aktivitas_terkini.map((activity) => (
                  <div key={activity.id} className="dash-activity-item">
                    <div className="activity-icon">{STATUS_ICONS[activity.status] || <CheckCircle size={18} />}</div>
                    <div className="activity-content">
                      <h4 className="activity-title">{activity.siswa_nama} ({activity.kelas})</h4>
                      <p className="activity-desc">Status: <strong>{activity.status}</strong> • Masuk: {activity.jam_masuk}</p>
                    </div>
                    <div className="activity-time"><Clock size={12} /><span>{activity.waktu_relatif}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="dash-card dash-schedule-card">
          <div className="card-header"><h3 className="card-title">Ringkasan Hari Ini</h3></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Hadir', value: dist.hadir, color: '#059669' },
                { label: 'Terlambat', value: dist.terlambat, color: '#f59e0b' },
                { label: 'Sakit', value: dist.sakit, color: '#3b82f6' },
                { label: 'Izin', value: dist.izin, color: '#8b5cf6' },
                { label: 'Alpa', value: dist.alpa, color: '#ef4444' },
                { label: 'Belum Absen', value: dist.belum_absen, color: '#94a3b8' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: item.color }}></div>
                  <span style={{ flex: 1, fontSize: '0.85rem', color: '#475569' }}>{item.label}</span>
                  <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{item.value}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', minWidth: '35px', textAlign: 'right' }}>
                    {totalStatus > 0 ? Math.round((item.value / totalStatus) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dash-quick-actions">
        <a href="/absensi" className="btn btn-primary action-btn"><ClipboardCheck size={18} /><span>Lihat Absensi</span></a>
        <a href="/siswa" className="btn btn-secondary action-btn"><Users size={18} /><span>Kelola Siswa</span></a>
        <a href="/laporan" className="btn btn-outline action-btn"><FileText size={18} /><span>Lihat Laporan</span></a>
      </div>
    </>
  );
};

// ===================== DASHBOARD SISWA =====================
const SiswaDashboard = ({ token, user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/siswa-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.success && response.data?.data) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error("Gagal memuat data dashboard siswa:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return <div className="loading-state"><div className="spinner" /><p>Memuat dashboard...</p></div>;
  }

  if (!stats) {
    return (
      <div className="empty-state">
        <AlertCircle size={44} />
        <p>Gagal memuat data. Silakan refresh halaman.</p>
      </div>
    );
  }

  const rekap = stats.rekap_bulanan;
  const hariIni = stats.hari_ini;
  const siswaInfo = stats.siswa;

  return (
    <>
      {/* Info Siswa */}
      <div className="dash-card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden',
            background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid #dc2626', flexShrink: 0
          }}>
            {siswaInfo.foto ? (
              <img src={siswaInfo.foto} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={32} color="#dc2626" />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>{siswaInfo.nama}</h3>
            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              NISN: <strong>{siswaInfo.nisn}</strong> • Kelas: <strong>{siswaInfo.kelas}</strong> • {siswaInfo.jurusan}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            {!siswaInfo.has_face_profile ? (
              <button className="btn-absen primary" onClick={() => navigate('/absensi/siswa/ambil')}>
                <ScanFace size={18} /> Daftarkan Wajah
              </button>
            ) : hariIni.sudah_absen ? (
              <div style={{ background: '#ecfdf5', border: '2px solid #a7f3d0', borderRadius: '12px', padding: '0.75rem 1.25rem' }}>
                <CheckCircle size={22} color="#059669" />
                <p style={{ margin: '0.25rem 0 0', fontWeight: 700, color: '#059669', fontSize: '0.85rem' }}>Sudah Absen</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{hariIni.status} • {hariIni.jam_masuk} WIB</p>
              </div>
            ) : (
              <button className="btn-absen primary" onClick={() => navigate('/absensi/siswa/ambil')}>
                <Camera size={18} /> Ambil Presensi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dash-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="dash-stat-card theme-blue">
          <div className="stat-icon-wrapper"><CheckCircle size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Total Hadir</p>
            <h3 className="stat-value">{rekap.total_hadir}</h3>
          </div>
        </div>
        <div className="dash-stat-card theme-amber">
          <div className="stat-icon-wrapper"><AlertCircle size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Terlambat</p>
            <h3 className="stat-value">{rekap.total_terlambat}</h3>
          </div>
        </div>
        <div className="dash-stat-card theme-blue-light">
          <div className="stat-icon-wrapper"><Info size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Sakit / Izin</p>
            <h3 className="stat-value">{rekap.total_sakit + rekap.total_izin}</h3>
          </div>
        </div>
        <div className="dash-stat-card theme-red">
          <div className="stat-icon-wrapper"><XCircle size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Alpa</p>
            <h3 className="stat-value">{rekap.total_alpa}</h3>
          </div>
        </div>
      </div>

      {/* Persentase Kehadiran */}
      <div className="dash-card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">Persentase Kehadiran - {rekap.bulan}</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '120px', height: '120px', borderRadius: '50%',
                background: `conic-gradient(#059669 ${rekap.persentase_kehadiran * 3.6}deg, #e2e8f0 0deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto'
              }}>
                <div style={{
                  width: '90px', height: '90px', borderRadius: '50%', background: '#fff',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ fontWeight: 800, fontSize: '1.5rem', color: '#059669' }}>{rekap.persentase_kehadiran}%</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Kehadiran</span>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: 'Total Absen', value: rekap.total_absen, color: '#0f172a' },
                  { label: 'Hari Sekolah', value: rekap.hari_sekolah, color: '#64748b' },
                  { label: 'Hadir', value: rekap.total_hadir, color: '#059669' },
                  { label: 'Terlambat', value: rekap.total_terlambat, color: '#f59e0b' },
                  { label: 'Sakit', value: rekap.total_sakit, color: '#3b82f6' },
                  { label: 'Izin', value: rekap.total_izin, color: '#8b5cf6' },
                ].map((item) => (
                  <div key={item.label} style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{item.label}</p>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Riwayat Terakhir */}
      <div className="dash-info-grid" style={{ marginTop: '1.5rem' }}>
        <div className="dash-card dash-activity-card">
          <div className="card-header">
            <h3 className="card-title">Riwayat Absensi Terakhir</h3>
            <a href="/absensi/siswa" className="btn-link">Lihat Semua</a>
          </div>
          <div className="card-body">
            {stats.absensi_terakhir.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Belum ada riwayat absensi</p>
            ) : (
              <div className="activity-list">
                {stats.absensi_terakhir.map((item, idx) => (
                  <div key={idx} className="dash-activity-item">
                    <div className="activity-icon">{STATUS_ICONS[item.status] || <CheckCircle size={18} />}</div>
                    <div className="activity-content">
                      <h4 className="activity-title">{item.tanggal}</h4>
                      <p className="activity-desc">
                        Status: <strong>{item.status}</strong>
                        {item.jam_masuk ? ` • Masuk: ${item.jam_masuk}` : ''}
                        {item.keterangan ? ` • ${item.keterangan}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dash-card">
          <div className="card-header">
            <h3 className="card-title">Pengajuan Izin</h3>
            <a href="/absensi/siswa" className="btn-link">Ajukan</a>
          </div>
          <div className="card-body" style={{ textAlign: 'center', padding: '2rem' }}>
            <FileText size={48} color="#94a3b8" />
            <p style={{ fontWeight: 800, fontSize: '2rem', margin: '0.5rem 0 0', color: '#0f172a' }}>
              {stats.pengajuan_izin_count}
            </p>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Total pengajuan izin</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dash-quick-actions">
        <button className="btn btn-primary action-btn" onClick={() => navigate('/absensi/siswa/ambil')}>
          <Camera size={18} /><span>Ambil Presensi</span>
        </button>
        <button className="btn btn-secondary action-btn" onClick={() => navigate('/absensi/siswa')}>
          <ClipboardCheck size={18} /><span>Riwayat Absensi</span>
        </button>
        <button className="btn btn-outline action-btn" onClick={() => navigate('/absensi/siswa')}>
          <Send size={18} /><span>Ajukan Izin</span>
        </button>
      </div>
    </>
  );
};

// ===================== MAIN DASHBOARD =====================
const Dashboard = () => {
  const { user, token } = useAuth();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('id-ID', options));
  }, []);

  const isSiswa = user?.role === "Siswa";

  return (
    <div className="dashboard-container">
      <div className="dash-page-header">
        <div className="header-info">
          <h1 className="header-greeting">
            Selamat Datang, {user?.nama || (isSiswa ? "Siswa" : "Admin")}!
          </h1>
          <p className="header-date"><Calendar size={16} />{currentDate}</p>
        </div>
        <div className="header-badge">
          <span className={`role-badge role-${user?.role?.toLowerCase() || 'admin'}`}>
            {user?.role || "Admin"}
          </span>
        </div>
      </div>

      {isSiswa ? <SiswaDashboard token={token} user={user} /> : <AdminDashboard token={token} />}
    </div>
  );
};

export default Dashboard;
