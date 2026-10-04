import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
    User,
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
    Sparkles,
    ArrowLeft,
    UserPlus,
    Hash,
    Calendar,
    Phone,
    MapPin,
} from "lucide-react";

import { register as registerApi } from "../../services/authService";
import logo from "../../assets/images/logo-sekolah.png";
import "./Auth.css";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nama: "",
        email: "",
        nisn: "",
        jenis_kelamin: "",
        tanggal_lahir: "",
        nomor_telepon: "",
        alamat: "",
        password: "",
        password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");

    // Current Date formatted in Indonesian
    const currentDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
        }));

        if (error) setError("");
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!form.nama.trim()) {
            errors.nama = "Nama lengkap wajib diisi.";
        }

        if (!form.email.trim()) {
            errors.email = "Alamat email wajib diisi.";
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            errors.email = "Format email tidak valid.";
        }

        if (!form.nisn.trim()) {
            errors.nisn = "NISN wajib diisi.";
        } else if (!/^\d{10}$/.test(form.nisn)) {
            errors.nisn = "NISN harus 10 digit angka.";
        }

        if (!form.jenis_kelamin) {
            errors.jenis_kelamin = "Jenis kelamin wajib dipilih.";
        }

        if (!form.tanggal_lahir) {
            errors.tanggal_lahir = "Tanggal lahir wajib diisi.";
        }

        if (!form.nomor_telepon.trim()) {
            errors.nomor_telepon = "Nomor telepon wajib diisi.";
        } else if (!/^08\d{8,13}$/.test(form.nomor_telepon)) {
            errors.nomor_telepon = "Nomor telepon harus diawali 08 dan 10-15 digit.";
        }

        if (!form.alamat.trim()) {
            errors.alamat = "Alamat wajib diisi.";
        }

        if (!form.password) {
            errors.password = "Password wajib diisi.";
        } else if (form.password.length < 8) {
            errors.password = "Password minimal 8 karakter.";
        }

        if (!form.password_confirmation) {
            errors.password_confirmation = "Konfirmasi password wajib diisi.";
        } else if (form.password !== form.password_confirmation) {
            errors.password_confirmation = "Konfirmasi password tidak cocok.";
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage("");
        setError("");

        const clientErrors = validateForm();
        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setError("Mohon lengkapi dan periksa kembali data pendaftaran Anda.");
            return;
        }

        setLoading(true);
        setFieldErrors({});

        try {
            const response = await registerApi(form);
            if (response.data?.success || response.status === 201) {
                setSuccessMessage("Registrasi akun siswa berhasil! Mengalihkan ke halaman login...");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                const backendErrors = {};
                Object.keys(err.response.data.errors).forEach((key) => {
                    backendErrors[key] = err.response.data.errors[key][0];
                });
                setFieldErrors(backendErrors);
                setError(err.response.data.message || "Registrasi gagal. Silakan periksa kolom input bertanda merah.");
            } else {
                setError(
                    err.response?.data?.message ||
                    "Terjadi kesalahan saat pendaftaran. Silakan coba beberapa saat lagi."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            {/* LEFT HERO PANEL (Desktop Showcase) */}
            <div className="col-lg-6 col-xl-7 auth-hero-panel d-none d-lg-flex">
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
                                Registration Portal
                            </span>
                        </div>
                    </div>

                    <h1 className="auth-hero-title">
                        Bergabung dengan <br />
                        <span>Sistem Absensi Digital</span>
                    </h1>

                    <p className="auth-hero-subtitle">
                        Daftarkan akun siswa Anda untuk mengakses layanan pencatatan presensi, rekap kehadiran, serta informasi akademik secara praktis dan aman.
                    </p>

                    {/* Features Grid */}
                    <div className="auth-features-grid">
                        <div className="auth-feature-card">
                            <div className="auth-feature-icon">
                                <Clock size={22} />
                            </div>
                            <h4>Absensi Real-time</h4>
                            <p>Presensi cepat dengan validasi data terintegrasi secara langsung.</p>
                        </div>

                        <div className="auth-feature-card">
                            <div className="auth-feature-icon">
                                <Users size={22} />
                            </div>
                            <h4>Profil Terpusat</h4>
                            <p>Akses data pribadi dan rekap kehadiran siswa kapan saja.</p>
                        </div>

                        <div className="auth-feature-card">
                            <div className="auth-feature-icon">
                                <BarChart3 size={22} />
                            </div>
                            <h4>Laporan Transparan</h4>
                            <p>Pantau persentase kehadiran bulanan secara transparan.</p>
                        </div>

                        <div className="auth-feature-card">
                            <div className="auth-feature-icon">
                                <ShieldCheck size={22} />
                            </div>
                            <h4>Data Terlindungi</h4>
                            <p>Keamanan akun dan kerahasiaan identitas siswa terjamin.</p>
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
            <div className="col-12 col-lg-6 col-xl-5 auth-form-panel">
                <div className="auth-card auth-card-wide my-auto">
                    {/* Top gradient red accent line */}
                    <div className="auth-card-top-bar"></div>

                    <div className="auth-card-body">
                        {/* Header */}
                        <div className="auth-header">
                            <div className="auth-mobile-logo">
                                <img src={logo} alt="Logo Sekolah" />
                            </div>

                            <h2 className="auth-title">Pendaftaran Akun 📝</h2>
                            <p className="auth-subtitle">
                                Isi formulir di bawah ini dengan data diri siswa yang valid
                            </p>
                        </div>

                        {/* Alert Success */}
                        {successMessage && (
                            <div className="auth-alert-success" role="alert">
                                <CheckCircle2 size={18} />
                                <div>{successMessage}</div>
                            </div>
                        )}

                        {/* Alert Error */}
                        {error && (
                            <div className="auth-alert-error" role="alert">
                                <AlertCircle size={18} />
                                <div>{error}</div>
                            </div>
                        )}

                        {/* Register Form */}
                        <form onSubmit={handleSubmit} noValidate>
                            {/* Nama Lengkap */}
                            <div className="auth-form-group">
                                <label className="auth-label" htmlFor="nama-input">
                                    Nama Lengkap <span className="text-danger">*</span>
                                </label>
                                <div className="auth-input-wrapper">
                                    <span className="auth-input-icon">
                                        <User size={18} />
                                    </span>
                                    <input
                                        id="nama-input"
                                        type="text"
                                        name="nama"
                                        className={`auth-input ${fieldErrors.nama ? "border-danger" : ""}`}
                                        placeholder="Contoh: Ahmad Fauzi"
                                        value={form.nama}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                {fieldErrors.nama && (
                                    <div className="auth-field-error-text">
                                        <AlertCircle size={13} /> {fieldErrors.nama}
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div className="auth-form-group">
                                <label className="auth-label" htmlFor="email-input">
                                    Alamat Email <span className="text-danger">*</span>
                                </label>
                                <div className="auth-input-wrapper">
                                    <span className="auth-input-icon">
                                        <Mail size={18} />
                                    </span>
                                    <input
                                        id="email-input"
                                        type="email"
                                        name="email"
                                        className={`auth-input ${fieldErrors.email ? "border-danger" : ""}`}
                                        placeholder="nama@sekolah.sch.id"
                                        value={form.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                                {fieldErrors.email && (
                                    <div className="auth-field-error-text">
                                        <AlertCircle size={13} /> {fieldErrors.email}
                                    </div>
                                )}
                            </div>

                            {/* Two Columns Layout: NISN & Jenis Kelamin */}
                            <div className="auth-form-grid">
                                <div className="auth-form-group">
                                    <label className="auth-label" htmlFor="nisn-input">
                                        NISN (10 Digit) <span className="text-danger">*</span>
                                    </label>
                                    <div className="auth-input-wrapper">
                                        <span className="auth-input-icon">
                                            <Hash size={18} />
                                        </span>
                                        <input
                                            id="nisn-input"
                                            type="text"
                                            name="nisn"
                                            maxLength="10"
                                            className={`auth-input ${fieldErrors.nisn ? "border-danger" : ""}`}
                                            placeholder="0012345678"
                                            value={form.nisn}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    {fieldErrors.nisn && (
                                        <div className="auth-field-error-text">
                                            <AlertCircle size={13} /> {fieldErrors.nisn}
                                        </div>
                                    )}
                                </div>

                                <div className="auth-form-group">
                                    <label className="auth-label" htmlFor="jk-input">
                                        Jenis Kelamin <span className="text-danger">*</span>
                                    </label>
                                    <div className="auth-input-wrapper">
                                        <span className="auth-input-icon">
                                            <Users size={18} />
                                        </span>
                                        <select
                                            id="jk-input"
                                            name="jenis_kelamin"
                                            className={`auth-input auth-select ${fieldErrors.jenis_kelamin ? "border-danger" : ""}`}
                                            value={form.jenis_kelamin}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">-- Pilih --</option>
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                    </div>
                                    {fieldErrors.jenis_kelamin && (
                                        <div className="auth-field-error-text">
                                            <AlertCircle size={13} /> {fieldErrors.jenis_kelamin}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Two Columns Layout: Tanggal Lahir & Nomor Telepon */}
                            <div className="auth-form-grid">
                                <div className="auth-form-group">
                                    <label className="auth-label" htmlFor="tgl-input">
                                        Tanggal Lahir <span className="text-danger">*</span>
                                    </label>
                                    <div className="auth-input-wrapper">
                                        <span className="auth-input-icon">
                                            <Calendar size={18} />
                                        </span>
                                        <input
                                            id="tgl-input"
                                            type="date"
                                            name="tanggal_lahir"
                                            className={`auth-input ${fieldErrors.tanggal_lahir ? "border-danger" : ""}`}
                                            value={form.tanggal_lahir}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    {fieldErrors.tanggal_lahir && (
                                        <div className="auth-field-error-text">
                                            <AlertCircle size={13} /> {fieldErrors.tanggal_lahir}
                                        </div>
                                    )}
                                </div>

                                <div className="auth-form-group">
                                    <label className="auth-label" htmlFor="telp-input">
                                        Nomor Telepon <span className="text-danger">*</span>
                                    </label>
                                    <div className="auth-input-wrapper">
                                        <span className="auth-input-icon">
                                            <Phone size={18} />
                                        </span>
                                        <input
                                            id="telp-input"
                                            type="tel"
                                            name="nomor_telepon"
                                            className={`auth-input ${fieldErrors.nomor_telepon ? "border-danger" : ""}`}
                                            placeholder="081234567890"
                                            value={form.nomor_telepon}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    {fieldErrors.nomor_telepon && (
                                        <div className="auth-field-error-text">
                                            <AlertCircle size={13} /> {fieldErrors.nomor_telepon}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Alamat */}
                            <div className="auth-form-group">
                                <label className="auth-label" htmlFor="alamat-input">
                                    Alamat <span className="text-danger">*</span>
                                </label>
                                <div className="auth-input-wrapper">
                                    <span className="auth-input-icon auth-input-icon-top">
                                        <MapPin size={18} />
                                    </span>
                                    <textarea
                                        id="alamat-input"
                                        name="alamat"
                                        rows="2"
                                        className={`auth-input auth-textarea ${fieldErrors.alamat ? "border-danger" : ""}`}
                                        placeholder="Jl. Pendidikan No. 123..."
                                        value={form.alamat}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                {fieldErrors.alamat && (
                                    <div className="auth-field-error-text">
                                        <AlertCircle size={13} /> {fieldErrors.alamat}
                                    </div>
                                )}
                            </div>

                            {/* Two Columns Layout: Password & Confirm Password */}
                            <div className="auth-form-grid">
                                <div className="auth-form-group">
                                    <label className="auth-label" htmlFor="password-input">
                                        Kata Sandi <span className="text-danger">*</span>
                                    </label>
                                    <div className="auth-input-wrapper">
                                        <span className="auth-input-icon">
                                            <Lock size={18} />
                                        </span>
                                        <input
                                            id="password-input"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            className={`auth-input ${fieldErrors.password ? "border-danger" : ""}`}
                                            placeholder="Min. 8 karakter"
                                            value={form.password}
                                            onChange={handleChange}
                                            autoComplete="new-password"
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
                                    {fieldErrors.password && (
                                        <div className="auth-field-error-text">
                                            <AlertCircle size={13} /> {fieldErrors.password}
                                        </div>
                                    )}
                                </div>

                                <div className="auth-form-group">
                                    <label className="auth-label" htmlFor="password-confirm-input">
                                        Konfirmasi Sandi <span className="text-danger">*</span>
                                    </label>
                                    <div className="auth-input-wrapper">
                                        <span className="auth-input-icon">
                                            <Lock size={18} />
                                        </span>
                                        <input
                                            id="password-confirm-input"
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="password_confirmation"
                                            className={`auth-input ${fieldErrors.password_confirmation ? "border-danger" : ""}`}
                                            placeholder="Ulangi kata sandi"
                                            value={form.password_confirmation}
                                            onChange={handleChange}
                                            autoComplete="new-password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="auth-password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            title={showConfirmPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                                            tabIndex="-1"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {fieldErrors.password_confirmation && (
                                        <div className="auth-field-error-text">
                                            <AlertCircle size={13} /> {fieldErrors.password_confirmation}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="auth-submit-btn mt-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        <span>Daftar Akun Baru...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={19} />
                                        <span>Daftar Sekarang</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Card Footer Links */}
                        <div className="auth-card-footer">
                            <p className="mb-0">
                                Sudah memiliki akun?
                                <Link to="/login" className="auth-register-link">
                                    Masuk di sini
                                </Link>
                            </p>

                            <div>
                                <span className="auth-security-tag">
                                    <ShieldCheck size={14} className="text-danger" />
                                    Pendaftaran Terenkripsi &amp; Resmi
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;