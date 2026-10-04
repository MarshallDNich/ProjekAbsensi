import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout as logoutApi } from "../services/authService";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    School,
    BookOpen,
    ClipboardList,
    FileText,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Bell,
    Search,
    Settings,
    ShieldCheck,
    Sparkles,
    CalendarDays
} from "lucide-react";
import { useState } from "react";
import logo from "../assets/images/logo-sekolah.png";
import "../App.css";

function AdminLayout() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logoutApi(token);
        } catch (e) {
            // ignore
        }
        logout();
        navigate("/login");
    };

    const isSiswa = user?.role === "Siswa";

    const menuItems = [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/users", label: "Manajemen User", icon: Users, adminOnly: true },
        { path: "/guru", label: "Data Guru", icon: GraduationCap, adminOnly: true },
        { path: "/kelas", label: "Data Kelas", icon: School, adminOnly: true },
        { path: "/mapel", label: "Mata Pelajaran", icon: BookOpen, adminOnly: true },
        { path: "/siswa", label: "Data Siswa", icon: Users, adminOnly: true },
        {
            path: isSiswa ? "/absensi/siswa" : "/absensi",
            label: "Absensi",
            icon: ClipboardList,
        },
        {
            path: "/pengajuan-izin/verifikasi",
            label: "Verifikasi Izin",
            icon: FileText,
            adminOnly: true,
        },
        {
            path: "/jadwal",
            label: "Jadwal",
            icon: CalendarDays,
        },
        { path: "/laporan", label: "Laporan", icon: FileText, adminOnly: true },
    ].filter((item) => !item.adminOnly || !isSiswa);

    const currentDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="admin-layout">
            {/* Backdrop overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
                {/* Sidebar Brand Header */}
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <div className="sidebar-logo-ring">
                            <img
                                src={logo}
                                alt="Logo"
                                style={{ width: "30px", height: "30px", objectFit: "contain" }}
                            />
                        </div>
                        <div className="sidebar-brand-text">
                            <span className="sidebar-brand-title">Absensi</span>
                            <span className="sidebar-brand-sub">Portal Sekolah</span>
                        </div>
                    </div>
                    <button
                        className="sidebar-close d-lg-none"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <div className="sidebar-nav-label">Menu Utama</div>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="sidebar-link-icon">
                                <item.icon size={19} />
                            </span>
                            <span className="sidebar-link-text">{item.label}</span>
                            {location.pathname === item.path && (
                                <ChevronRight size={15} className="sidebar-link-arrow" />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="sidebar-footer">
                    <div className="sidebar-user-card">
                        <div className="sidebar-user-avatar">
                            {user?.nama ? user.nama.charAt(0).toUpperCase() : "A"}
                        </div>
                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">{user?.nama || "Admin"}</span>
                            <span className="sidebar-user-role">{user?.role || "Administrator"}</span>
                        </div>
                    </div>
                    <button className="sidebar-link logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="admin-main">
                {/* Top Header Bar */}
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <button
                            className="topbar-toggle d-lg-none"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={22} />
                        </button>
                        <div className="topbar-search">
                            <Search size={17} className="topbar-search-icon" />
                            <input
                                type="text"
                                className="topbar-search-input"
                                placeholder="Cari menu, data..."
                            />
                        </div>
                    </div>

                    <div className="topbar-right">
                        <span className="topbar-date d-none d-md-flex">
                            {currentDate}
                        </span>
                        <button className="topbar-icon-btn" title="Notifikasi">
                            <Bell size={19} />
                            <span className="topbar-notif-dot"></span>
                        </button>
                        <button className="topbar-icon-btn" title="Pengaturan">
                            <Settings size={19} />
                        </button>
                        <div className="topbar-user-pill">
                            <div className="topbar-user-avatar">
                                {user?.nama ? user.nama.charAt(0).toUpperCase() : "A"}
                            </div>
                            <span className="topbar-user-name d-none d-md-inline">
                                {user?.nama || "Admin"}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;
