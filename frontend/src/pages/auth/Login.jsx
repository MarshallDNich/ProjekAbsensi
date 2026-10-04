import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    ArrowRight, 
    ShieldCheck, 
    Users, 
    Clock, 
    BarChart3, 
    AlertCircle, 
    CheckCircle2, 
    School,
    Sparkles
} from "lucide-react";

import { login as loginApi } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/logo-sekolah.png";
import "./Auth.css";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Current Date formatted in Indonesian
    const currentDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            setError("Email dan password tidak boleh kosong.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await loginApi(form);
            login(
                response.data.data,
                response.data.token
            );
            navigate("/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Login gagal. Periksa kembali email dan password Anda."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            {/* LEFT HERO PANEL (Desktop Showcase) */}
            <div className="col-lg-7 auth-hero-panel d-none d-lg-flex">
                <div className="auth-brand-wrapper">
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <div className="auth-logo-ring">
                            <img 
                                src={logo} 
                                alt="Logo Sekolah" 
                                style={{ width: "46px", height: "46px", objectFit: "contain" }}
                            />
                        </div>
                        <div>
                            <span className="auth-hero-badge">
                                <Sparkles size={13} className="text-warning" />
                                Portal Akademik & Absensi
                            </span>
                        </div>
                    </div>

                    <h1 className="auth-hero-title">
                        Sistem Informasi <br />
                        <span>Absensi Sekolah</span>
                    </h1>

                    <p className="auth-hero-subtitle">
                        Solusi digital modern untuk mencatat, mengelola, dan memantau kehadiran siswa serta tenaga pengajar secara presisi, real-time, dan terintegrasi.
                    </p>

                    {/* Features Grid */}
                    <div className="auth-features-grid">
                        <div className="auth-feature-card">
                            <div className="auth-feature-icon">
                                <Clock size={22} />
                            </div>
                            <h4>Absensi Real-time</h4>
                            <p>Monitoring kehadiran presisi secara langsung setiap harinya.</p>
                        </div>

                        <div className="auth-feature-card">
                            <div className="auth-feature-icon">
                                <Users size={22} />
                            </div>
                            <h4>Manajemen User</h4>
                            <p>Kelola data siswa, guru, dan kelas dalam satu panel terpusat.</p>
                        </div>

                        <div className="auth-feature-card">
                            <div className="auth-feature-icon">
                                <BarChart3 size={22} />
                            </div>
                            <h4>Rekap & Laporan</h4>
                            <p>Generate laporan kehadiran otomatis dalam berbagai format.</p>
                        </div>

                        <div className="auth-feature-card">
                            <div className="auth-feature-icon">
                                <ShieldCheck size={22} />
                            </div>
                            <h4>Akses Keamanan</h4>
                            <p>Perlindungan data tingkat tinggi berbasis enkripsi mutakhir.</p>
                        </div>
                    </div>
                </div>

                {/* Footer panel info */}
                <div className="auth-hero-footer">
                    <div className="d-flex align-items-center">
                        <span className="status-dot"></span>
                        <span>Sistem Aktif • {currentDate}</span>
                    </div>
                </div>
            </div>

            {/* RIGHT FORM PANEL */}
            <div className="col-12 col-lg-5 auth-form-panel">
                <div className="auth-card">
                    {/* Top gradient red accent line */}
                    <div className="auth-card-top-bar"></div>

                    <div className="auth-card-body">
                        {/* Header */}
                        <div className="auth-header">
                            <div className="auth-mobile-logo">
                                <img src={logo} alt="Logo Sekolah" />
                            </div>

                            <h2 className="auth-title">Selamat Datang 👋</h2>
                            <p className="auth-subtitle">
                                Masukkan email dan password Anda untuk masuk ke dalam portal
                            </p>
                        </div>

                        {/* Alert Error */}
                        {error && (
                            <div className="auth-alert-error" role="alert">
                                <AlertCircle size={18} />
                                <div>{error}</div>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} noValidate>
                            {/* Email Field */}
                            <div className="auth-form-group">
                                <label className="auth-label" htmlFor="email-input">
                                    Alamat Email
                                </label>
                                <div className="auth-input-wrapper">
                                    <span className="auth-input-icon">
                                        <Mail size={18} />
                                    </span>
                                    <input
                                        id="email-input"
                                        type="email"
                                        name="email"
                                        className="auth-input"
                                        placeholder="nama@sekolah.sch.id"
                                        value={form.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="auth-form-group">
                                <label className="auth-label" htmlFor="password-input">
                                    Kata Sandi
                                </label>
                                <div className="auth-input-wrapper">
                                    <span className="auth-input-icon">
                                        <Lock size={18} />
                                    </span>
                                    <input
                                        id="password-input"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="auth-input"
                                        placeholder="••••••••••••"
                                        value={form.password}
                                        onChange={handleChange}
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="auth-password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                                        tabIndex="-1"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Checkbox & Forgot Password */}
                            <div className="auth-options">
                                <label className="auth-checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        className="auth-checkbox" 
                                    />
                                    Ingat saya
                                </label>

                                <Link to="#" className="auth-forgot-link">
                                    Lupa password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="auth-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Masuk ke Sistem</span>
                                        <ArrowRight size={19} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Card Footer Links */}
                        <div className="auth-card-footer">
                            <p className="mb-0">
                                Belum memiliki akun?
                                <Link to="/register" className="auth-register-link">
                                    Daftar Sekarang
                                </Link>
                            </p>

                            <div>
                                <span className="auth-security-tag">
                                    <ShieldCheck size={14} className="text-danger" />
                                    Sistem Absensi Terenkripsi &amp; Aman
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;