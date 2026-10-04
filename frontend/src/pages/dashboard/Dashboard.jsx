import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { 
  Users, 
  GraduationCap, 
  School, 
  ClipboardCheck,
  TrendingUp,
  Clock,
  Calendar,
  ChevronRight,
  FileText,
  UserPlus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from "lucide-react";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, token } = useAuth();
  const [currentDate, setCurrentDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Dynamic API State
  const [stats, setStats] = useState({
    summary: {
      total_guru: 86,
      total_siswa: 1247,
      total_kelas: 42,
      total_absensi_hari_ini: 1175,
      siswa_belum_absen: 72,
      persentase_kehadiran_hari_ini: 94.2
    },
    distribusi_status: {
      hadir: 1022,
      sakit: 100,
      izin: 75,
      alpa: 50,
      persentase: { hadir: 82, sakit: 8, izin: 6, alpa: 4 }
    },
    rekap_mingguan: [
      { day: "Sen", percentage: 92 },
      { day: "Sel", percentage: 95 },
      { day: "Rab", percentage: 89 },
      { day: "Kam", percentage: 94 },
      { day: "Jum", percentage: 96 },
      { day: "Sab", percentage: 45 },
      { day: "Min", percentage: 0 }
    ],
    aktivitas_terkini: []
  });

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('id-ID', options);
    setCurrentDate(dateStr);

    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/admin-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.success && response.data?.data) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.log("Menggunakan data visual awal (Backend dev fallback)");
    } finally {
      setLoading(false);
    }
  };

  const defaultActivities = [
    { id: 1, icon: <CheckCircle size={18} className="text-success" />, title: "Absensi Kelas 10A Selesai", time: "2 menit lalu", desc: "Wali Kelas: Budi Santoso" },
    { id: 2, icon: <UserPlus size={18} className="text-primary" />, title: "Siswa Baru Terdaftar", time: "15 menit lalu", desc: "Nama: Ahmad Fauzi (10B)" },
    { id: 3, icon: <AlertCircle size={18} className="text-warning" />, title: "Izin Sakit Diajukan", time: "1 jam lalu", desc: "Siti Aminah (11A) melampirkan surat sakit" },
    { id: 4, icon: <XCircle size={18} className="text-danger" />, title: "Siswa Alpa", time: "2 jam lalu", desc: "Doni Pratama (12C) absen tanpa keterangan" },
    { id: 5, icon: <Info size={18} className="text-info" />, title: "Pembaruan Sistem", time: "5 jam lalu", desc: "Jadwal semester baru telah diunggah" },
  ];

  const todaySchedule = [
    { id: 1, time: "07:00 - 07:45", title: "Upacara Bendera", location: "Lapangan Utama" },
    { id: 2, time: "08:00 - 09:30", title: "Rapat Guru", location: "Ruang Guru" },
    { id: 3, time: "10:00 - 11:30", title: "Inspeksi Kelas", location: "Blok A & B" },
    { id: 4, time: "13:00 - 14:00", title: "Evaluasi Mingguan", location: "Ruang Rapat" },
  ];

  const displayActivities = stats.aktivitas_terkini?.length > 0 
    ? stats.aktivitas_terkini.map((act, idx) => ({
        id: act.id || idx,
        icon: <CheckCircle size={18} className="text-success" />,
        title: `${act.siswa_nama} (${act.kelas})`,
        time: act.waktu_relatif,
        desc: `Status: ${act.status} • Masuk: ${act.jam_masuk}`
      }))
    : defaultActivities;

  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <div className="dash-page-header">
        <div className="header-info">
          <h1 className="header-greeting">
            Selamat Datang, {user?.nama || "Admin"}!
          </h1>
          <p className="header-date">
            <Calendar size={16} />
            {currentDate}
          </p>
        </div>
        <div className="header-badge">
          <span className={`role-badge role-${user?.role?.toLowerCase() || 'admin'}`}>
            {user?.role || "Admin"}
          </span>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card theme-blue">
          <div className="stat-icon-wrapper">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Siswa</p>
            <h3 className="stat-value">{stats.summary.total_siswa.toLocaleString('id-ID')}</h3>
            <p className="stat-trend trend-up">
              <TrendingUp size={14} />
              <span>+12%</span> bulan ini
            </p>
          </div>
        </div>

        <div className="dash-stat-card theme-emerald">
          <div className="stat-icon-wrapper">
            <GraduationCap size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Guru</p>
            <h3 className="stat-value">{stats.summary.total_guru.toLocaleString('id-ID')}</h3>
            <p className="stat-trend trend-up">
              <TrendingUp size={14} />
              <span>+3%</span> bulan ini
            </p>
          </div>
        </div>

        <div className="dash-stat-card theme-amber">
          <div className="stat-icon-wrapper">
            <School size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Kelas</p>
            <h3 className="stat-value">{stats.summary.total_kelas.toLocaleString('id-ID')}</h3>
            <p className="stat-trend trend-up">
              <TrendingUp size={14} />
              <span>+5%</span> bulan ini
            </p>
          </div>
        </div>

        <div className="dash-stat-card theme-red">
          <div className="stat-icon-wrapper">
            <ClipboardCheck size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Kehadiran Hari Ini</p>
            <h3 className="stat-value">{stats.summary.persentase_kehadiran_hari_ini}%</h3>
            <p className="stat-trend trend-up">
              <TrendingUp size={14} />
              <span>{stats.summary.total_absensi_hari_ini}</span> siswa absen
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="dash-charts-section">
        <div className="dash-card dash-chart-card chart-large">
          <div className="card-header">
            <h3 className="card-title">Rekap Kehadiran Mingguan</h3>
          </div>
          <div className="card-body">
            <div className="css-bar-chart">
              {stats.rekap_mingguan.map((item, index) => (
                <div key={index} className="bar-wrapper">
                  <div className="bar-value-label">{item.percentage}%</div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ height: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="bar-label">{item.day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-card dash-chart-card chart-small">
          <div className="card-header">
            <h3 className="card-title">Distribusi Status Hari Ini</h3>
          </div>
          <div className="card-body donut-chart-container">
            <div className="css-donut-chart">
              <div className="donut-hole">
                <span className="donut-total">{stats.summary.total_siswa.toLocaleString('id-ID')}</span>
                <span className="donut-label">Siswa</span>
              </div>
            </div>
            <div className="donut-legend">
              <div className="legend-item">
                <span className="legend-dot dot-hadir"></span>
                <span className="legend-label">Hadir</span>
                <span className="legend-value">{stats.distribusi_status.persentase.hadir}%</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot dot-sakit"></span>
                <span className="legend-label">Sakit</span>
                <span className="legend-value">{stats.distribusi_status.persentase.sakit}%</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot dot-izin"></span>
                <span className="legend-label">Izin</span>
                <span className="legend-value">{stats.distribusi_status.persentase.izin}%</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot dot-alpa"></span>
                <span className="legend-label">Alpa</span>
                <span className="legend-value">{stats.distribusi_status.persentase.alpa}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="dash-info-grid">
        <div className="dash-card dash-activity-card">
          <div className="card-header">
            <h3 className="card-title">Aktivitas Terkini</h3>
            <button className="btn-link">Lihat Semua</button>
          </div>
          <div className="card-body">
            <div className="activity-list">
              {displayActivities.map((activity) => (
                <div key={activity.id} className="dash-activity-item">
                  <div className="activity-icon">{activity.icon}</div>
                  <div className="activity-content">
                    <h4 className="activity-title">{activity.title}</h4>
                    <p className="activity-desc">{activity.desc}</p>
                  </div>
                  <div className="activity-time">
                    <Clock size={12} />
                    <span>{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-card dash-schedule-card">
          <div className="card-header">
            <h3 className="card-title">Jadwal Hari Ini</h3>
            <button className="btn-link">Lihat Semua</button>
          </div>
          <div className="card-body">
            <div className="schedule-list">
              {todaySchedule.map((schedule) => (
                <div key={schedule.id} className="schedule-item">
                  <div className="schedule-time">{schedule.time}</div>
                  <div className="schedule-info">
                    <h4 className="schedule-title">{schedule.title}</h4>
                    <p className="schedule-location">{schedule.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dash-quick-actions">
        <button className="btn btn-primary action-btn">
          <ClipboardCheck size={18} />
          <span>Absensi Sekarang</span>
        </button>
        <button className="btn btn-secondary action-btn">
          <UserPlus size={18} />
          <span>Tambah Siswa</span>
        </button>
        <button className="btn btn-outline action-btn">
          <FileText size={18} />
          <span>Lihat Laporan</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;