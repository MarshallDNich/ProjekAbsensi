import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  Users as UsersIcon,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  GraduationCap,
  UserCircle,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Lock,
  KeyRound,
  BadgeInfo,
  Power,
  Calendar,
  Phone,
  MapPin,
  School,
  IdCard,
  Building2,
  Check,
} from "lucide-react";
import "./Users.css";

const ROLES = ["Admin", "Guru", "Siswa"];
const STATUSES = ["Aktif", "Nonaktif"];

const getRoleClass = (role) => {
  if (role === "Admin") return "admin";
  if (role === "Guru") return "guru";
  return "siswa";
};

const getRoleIcon = (role) => {
  if (role === "Admin") return <ShieldCheck size={11} />;
  if (role === "Guru") return <GraduationCap size={11} />;
  return <UserCircle size={11} />;
};

const getAvatarClass = (role) => {
  if (role === "Admin") return "avatar-admin";
  if (role === "Guru") return "avatar-guru";
  return "avatar-siswa";
};

/* ─── Toast Component ─── */
const Toast = ({ toasts }) => (
  <div className="toast-container">
    {toasts.map((t) => (
      <div key={t.id} className={`toast ${t.type}`}>
        <span className="toast-icon">
          {t.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
        </span>
        <span className="toast-text">{t.message}</span>
      </div>
    ))}
  </div>
);

/* ─── Confirm Dialog ─── */
const ConfirmDialog = ({ visible, onConfirm, onCancel, name, loading }) => {
  if (!visible) return null;
  return createPortal(
    <div className="u-confirm-overlay">
      <div className="u-confirm-box">
        <div className="u-confirm-icon">
          <Trash2 size={26} />
        </div>
        <h4>Hapus User?</h4>
        <p>
          Yakin ingin menghapus <strong>{name}</strong>? Data akun dan profil terkait akan dihapus.
        </p>
        <div className="u-confirm-actions">
          <button className="u-btn-cancel" onClick={onCancel} disabled={loading}>
            Batal
          </button>
          <button className="u-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 size={15} className="spin" /> : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ─── Modal Form Component ─── */
const UserModal = ({
  visible,
  mode,
  formData,
  errors,
  loading,
  kelasList,
  onChange,
  onSubmit,
  onClose,
}) => {
  if (!visible) return null;
  const isEdit = mode === "edit";

  return createPortal(
    <div className="u-modal-overlay" onClick={onClose}>
      <form className="u-modal-box" onClick={(e) => e.stopPropagation()} onSubmit={onSubmit} noValidate>
        {/* Modal Header */}
        <div className="u-modal-header">
          <div className="u-modal-header-info">
            <h3>{isEdit ? "Edit Data User" : "Tambah User Baru"}</h3>
            <p>{isEdit ? "Perbarui kredensial akun & profil terkait." : "Isikan formulir akun dan profil (User ≠ Siswa/Guru)."}</p>
          </div>
          <button type="button" className="u-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <div className="u-modal-body">
          {/* SECTION 1: DATA AKUN UTAMA */}
          <div className="u-section-title">
            <UserCircle size={15} />
            <span>1. Data Akun Utama (User)</span>
          </div>

          {/* Nama Lengkap */}
          <div className="u-form-group">
            <label className="u-form-label">
              Nama Lengkap <span className="req">*</span>
            </label>
            <div className="u-input-wrapper">
              <User size={16} className="u-input-icon" />
              <input
                type="text"
                className={`u-form-control ${errors.nama ? "is-invalid" : ""}`}
                placeholder="Contoh: Ahmad Fauzi"
                value={formData.nama}
                onChange={(e) => onChange("nama", e.target.value)}
                autoFocus
              />
            </div>
            {errors.nama && <p className="u-form-error">{errors.nama}</p>}
          </div>

          {/* Email & Role Grid */}
          <div className="u-form-row">
            <div className="u-form-group flex-1">
              <label className="u-form-label">
                Alamat Email <span className="req">*</span>
              </label>
              <div className="u-input-wrapper">
                <Mail size={16} className="u-input-icon" />
                <input
                  type="email"
                  className={`u-form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="nama@domain.com"
                  value={formData.email}
                  onChange={(e) => onChange("email", e.target.value)}
                />
              </div>
              {errors.email && <p className="u-form-error">{errors.email}</p>}
            </div>

            <div className="u-form-group flex-1">
              <label className="u-form-label">
                Role / Hak Akses <span className="req">*</span>
              </label>
              <div className="u-input-wrapper">
                <BadgeInfo size={16} className="u-input-icon" />
                <select
                  className={`u-form-control u-select ${errors.role ? "is-invalid" : ""}`}
                  value={formData.role}
                  onChange={(e) => onChange("role", e.target.value)}
                >
                  <option value="">-- Pilih Role --</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              {errors.role && <p className="u-form-error">{errors.role}</p>}
            </div>
          </div>

          {/* Status & Password Grid */}
          <div className="u-form-row">
            <div className="u-form-group flex-1">
              <label className="u-form-label">
                Status Akun <span className="req">*</span>
              </label>
              <div className="u-input-wrapper">
                <Power size={16} className="u-input-icon" />
                <select
                  className="u-form-control u-select"
                  value={formData.status}
                  onChange={(e) => onChange("status", e.target.value)}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="u-form-group flex-1">
              <label className="u-form-label">
                Password {!isEdit && <span className="req">*</span>}
              </label>
              <div className="u-input-wrapper">
                <Lock size={16} className="u-input-icon" />
                <input
                  type="password"
                  className={`u-form-control ${errors.password ? "is-invalid" : ""}`}
                  placeholder={isEdit ? "Kosongkan jika tetap" : "Min. 8 karakter"}
                  value={formData.password}
                  onChange={(e) => onChange("password", e.target.value)}
                />
              </div>
              {errors.password && <p className="u-form-error">{errors.password}</p>}
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div className="u-form-group">
            <label className="u-form-label">
              Konfirmasi Password {!isEdit && <span className="req">*</span>}
            </label>
            <div className="u-input-wrapper">
              <KeyRound size={16} className="u-input-icon" />
              <input
                type="password"
                className={`u-form-control ${errors.password_confirmation ? "is-invalid" : ""}`}
                placeholder="Ulangi password"
                value={formData.password_confirmation}
                onChange={(e) => onChange("password_confirmation", e.target.value)}
              />
            </div>
            {errors.password_confirmation && (
              <p className="u-form-error">{errors.password_confirmation}</p>
            )}
          </div>

          {/* SECTION 2: KONDISIONAL PROFIL (SISWA) */}
          {formData.role === "Siswa" && (
            <div className="u-profile-box siswa">
              <div className="u-section-title">
                <UserCircle size={15} />
                <span>2. Profil Siswa Terkait</span>
              </div>

              <div className="u-form-row">
                <div className="u-form-group flex-1">
                  <label className="u-form-label">NISN (10 Digit)</label>
                  <div className="u-input-wrapper">
                    <IdCard size={16} className="u-input-icon" />
                    <input
                      type="text"
                      className={`u-form-control ${errors.nisn ? "is-invalid" : ""}`}
                      placeholder="Contoh: 0051234567"
                      value={formData.nisn}
                      onChange={(e) => onChange("nisn", e.target.value)}
                    />
                  </div>
                  {errors.nisn && <p className="u-form-error">{errors.nisn}</p>}
                </div>

                <div className="u-form-group flex-1">
                  <label className="u-form-label">Kelas</label>
                  <div className="u-input-wrapper">
                    <School size={16} className="u-input-icon" />
                    <select
                      className={`u-form-control u-select ${errors.kelas_id ? "is-invalid" : ""}`}
                      value={formData.kelas_id}
                      onChange={(e) => onChange("kelas_id", e.target.value)}
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {kelasList.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.nama_kelas} ({k.jurusan})
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.kelas_id && <p className="u-form-error">{errors.kelas_id}</p>}
                </div>
              </div>

              <div className="u-form-row">
                <div className="u-form-group flex-1">
                  <label className="u-form-label">Jenis Kelamin</label>
                  <select
                    className="u-form-control u-select"
                    value={formData.jenis_kelamin}
                    onChange={(e) => onChange("jenis_kelamin", e.target.value)}
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div className="u-form-group flex-1">
                  <label className="u-form-label">Tanggal Lahir</label>
                  <div className="u-input-wrapper">
                    <Calendar size={16} className="u-input-icon" />
                    <input
                      type="date"
                      className={`u-form-control ${errors.tanggal_lahir ? "is-invalid" : ""}`}
                      value={formData.tanggal_lahir}
                      onChange={(e) => onChange("tanggal_lahir", e.target.value)}
                    />
                  </div>
                  {errors.tanggal_lahir && <p className="u-form-error">{errors.tanggal_lahir}</p>}
                </div>
              </div>

              <div className="u-form-group">
                <label className="u-form-label">Nomor Telepon</label>
                <div className="u-input-wrapper">
                  <Phone size={16} className="u-input-icon" />
                  <input
                    type="text"
                    className="u-form-control"
                    placeholder="081234567890"
                    value={formData.nomor_telepon}
                    onChange={(e) => onChange("nomor_telepon", e.target.value)}
                  />
                </div>
              </div>

              <div className="u-form-group">
                <label className="u-form-label">Alamat</label>
                <div className="u-input-wrapper">
                  <MapPin size={16} className="u-input-icon" />
                  <input
                    type="text"
                    className="u-form-control"
                    placeholder="Jl. Merdeka No. 10"
                    value={formData.alamat}
                    onChange={(e) => onChange("alamat", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: KONDISIONAL PROFIL (GURU) */}
          {formData.role === "Guru" && (
            <div className="u-profile-box guru">
              <div className="u-section-title">
                <GraduationCap size={15} />
                <span>2. Profil Guru Terkait</span>
              </div>

              <div className="u-form-row">
                <div className="u-form-group flex-1">
                  <label className="u-form-label">NIP</label>
                  <div className="u-input-wrapper">
                    <IdCard size={16} className="u-input-icon" />
                    <input
                      type="text"
                      className={`u-form-control ${errors.nip ? "is-invalid" : ""}`}
                      placeholder="Contoh: 198501012010011001"
                      value={formData.nip}
                      onChange={(e) => onChange("nip", e.target.value)}
                    />
                  </div>
                  {errors.nip && <p className="u-form-error">{errors.nip}</p>}
                </div>

                <div className="u-form-group flex-1">
                  <label className="u-form-label">Jenis Kelamin</label>
                  <select
                    className="u-form-control u-select"
                    value={formData.jenis_kelamin}
                    onChange={(e) => onChange("jenis_kelamin", e.target.value)}
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="u-form-group">
                <label className="u-form-label">Nomor Telepon</label>
                <div className="u-input-wrapper">
                  <Phone size={16} className="u-input-icon" />
                  <input
                    type="text"
                    className="u-form-control"
                    placeholder="081234567890"
                    value={formData.nomor_telepon}
                    onChange={(e) => onChange("nomor_telepon", e.target.value)}
                  />
                </div>
              </div>

              <div className="u-form-group">
                <label className="u-form-label">Alamat</label>
                <div className="u-input-wrapper">
                  <MapPin size={16} className="u-input-icon" />
                  <input
                    type="text"
                    className="u-form-control"
                    placeholder="Jl. Pendidikan No. 5"
                    value={formData.alamat}
                    onChange={(e) => onChange("alamat", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* HINT KHUSUS ADMIN */}
          {formData.role === "Admin" && (
            <p className="u-form-hint">
              🛡️ <em>Role Admin hanya mengelola hak akses sistem (tidak memerlukan profil akademik Siswa/Guru).</em>
            </p>
          )}

          {isEdit && (
            <p className="u-form-hint">
              💡 <em>Kosongkan kolom password & konfirmasi jika tidak ingin mengubah password akun.</em>
            </p>
          )}
        </div>

        {/* Modal Footer Buttons */}
        <div className="u-modal-footer">
          <button type="button" className="u-btn-cancel" onClick={onClose} disabled={loading}>
            Batal
          </button>
          <button type="submit" className="u-btn-save" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                <span>{isEdit ? "Perbarui User" : "Simpan User"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};

/* ═══════════════════════════════════════
   MAIN USERS PAGE COMPONENT
═══════════════════════════════════════ */
const EMPTY_FORM = {
  nama: "",
  email: "",
  role: "Siswa",
  status: "Aktif",
  password: "",
  password_confirmation: "",
  // Siswa fields
  nisn: "",
  kelas_id: "",
  jenis_kelamin: "Laki-laki",
  tanggal_lahir: "",
  nomor_telepon: "",
  alamat: "",
  // Guru fields
  nip: "",
};

const Users = () => {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  /* ─── State ─── */
  const [users, setUsers] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [savingForm, setSavingForm] = useState(false);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  /* ─── Fetch Kelas Dropdown ─── */
  const fetchKelas = useCallback(async () => {
    try {
      const res = await api.get("/kelas?per_page=100", { headers });
      if (res.data?.success) {
        setKelasList(res.data.data || []);
      }
    } catch {
      // quiet catch
    }
  }, [token]);

  /* ─── Fetch Users ─── */
  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = {
          page,
          per_page: perPage,
          ...(search && { search }),
          ...(roleFilter && { role: roleFilter }),
          ...(statusFilter && { status: statusFilter }),
        };
        const res = await api.get("/users", { headers, params });
        if (res.data?.success) {
          setUsers(res.data.data);
          setPagination(
            res.data.meta || {
              current_page: 1,
              last_page: 1,
              total: 0,
              per_page: perPage,
            }
          );
        }
      } catch (err) {
        addToast("Gagal memuat data user.", "error");
      } finally {
        setLoading(false);
      }
    },
    [search, roleFilter, statusFilter, perPage, token]
  );

  useEffect(() => {
    fetchKelas();
  }, [fetchKelas]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(1), 350);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter, perPage]);

  /* ─── Form Handlers ─── */
  const handleOpenAdd = () => {
    setModalMode("add");
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setSelectedUser(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (user) => {
    setModalMode("edit");
    setSelectedUser(user);
    setFormData({
      nama: user.nama || "",
      email: user.email || "",
      role: user.role || "Admin",
      status: user.status || "Aktif",
      password: "",
      password_confirmation: "",
      // Siswa
      nisn: user.siswa?.nisn || "",
      kelas_id: user.siswa?.kelas_id || "",
      jenis_kelamin: user.siswa?.jenis_kelamin || user.guru?.jenis_kelamin || "Laki-laki",
      tanggal_lahir: user.siswa?.tanggal_lahir || "",
      nomor_telepon: user.siswa?.nomor_telepon || user.guru?.nomor_telepon || "",
      alamat: user.siswa?.alamat || user.guru?.alamat || "",
      // Guru
      nip: user.guru?.nip || "",
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setFormErrors({});
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.nama.trim()) errs.nama = "Nama lengkap wajib diisi.";
    if (!formData.email.trim()) errs.email = "Alamat email wajib diisi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = "Format email tidak valid.";
    if (!formData.role) errs.role = "Role wajib dipilih.";

    if (modalMode === "add") {
      if (!formData.password) errs.password = "Password wajib diisi.";
      else if (formData.password.length < 8) errs.password = "Password minimal 8 karakter.";
      if (formData.password !== formData.password_confirmation)
        errs.password_confirmation = "Konfirmasi password tidak cocok.";
    } else {
      if (formData.password && formData.password.length < 8)
        errs.password = "Password minimal 8 karakter.";
      if (formData.password && formData.password !== formData.password_confirmation)
        errs.password_confirmation = "Konfirmasi password tidak cocok.";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      addToast("Mohon perbaiki isian form yang belum sesuai.", "error");
      return;
    }

    setSavingForm(true);
    try {
      const payload = { ...formData };
      if (modalMode === "edit" && !payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }

      // Convert empty strings to null for backend compatibility
      Object.keys(payload).forEach((key) => {
        if (payload[key] === "") {
          payload[key] = null;
        }
      });

      if (modalMode === "add") {
        await api.post("/users", payload, { headers });
        addToast("User baru berhasil ditambahkan! ✓");
      } else {
        await api.put(`/users/${selectedUser.id}`, payload, { headers });
        addToast("Data user berhasil diperbarui! ✓");
      }

      handleCloseModal();
      fetchUsers(pagination.current_page);
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      if (backendErrors) {
        const mapped = {};
        Object.entries(backendErrors).forEach(([key, val]) => {
          mapped[key] = Array.isArray(val) ? val[0] : val;
        });
        setFormErrors(mapped);
        addToast("Terjadi kesalahan validasi data.", "error");
      } else {
        addToast(err.response?.data?.message || "Gagal menyimpan user.", "error");
      }
    } finally {
      setSavingForm(false);
    }
  };

  /* ─── Toggle Status Quick Action ─── */
  const handleToggleStatus = async (user) => {
    try {
      const res = await api.patch(`/users/${user.id}/toggle-status`, {}, { headers });
      if (res.data?.success) {
        const newStatus = res.data.data.status;
        addToast(`Status ${user.nama} diubah menjadi ${newStatus}.`);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
        );
      }
    } catch {
      addToast("Gagal mengubah status user.", "error");
    }
  };

  const handleOpenDelete = (user) => {
    setDeletingUser(user);
    setConfirmVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setDeletingLoading(true);
    try {
      await api.delete(`/users/${deletingUser.id}`, { headers });
      addToast("User berhasil dihapus.");
      setConfirmVisible(false);
      setDeletingUser(null);
      const newPage =
        users.length === 1 && pagination.current_page > 1
          ? pagination.current_page - 1
          : pagination.current_page;
      fetchUsers(newPage);
    } catch {
      addToast("Gagal menghapus user.", "error");
    } finally {
      setDeletingLoading(false);
    }
  };

  const renderPageButtons = () => {
    const { current_page, last_page } = pagination;
    const pages = [];

    pages.push(
      <button
        key="prev"
        className="page-btn"
        disabled={current_page <= 1}
        onClick={() => fetchUsers(current_page - 1)}
      >
        <ChevronLeft size={14} />
      </button>
    );

    for (let i = 1; i <= last_page; i++) {
      if (
        i === 1 ||
        i === last_page ||
        (i >= current_page - 1 && i <= current_page + 1)
      ) {
        pages.push(
          <button
            key={i}
            className={`page-btn ${i === current_page ? "active" : ""}`}
            onClick={() => fetchUsers(i)}
          >
            {i}
          </button>
        );
      } else if (
        (i === current_page - 2 && current_page > 3) ||
        (i === current_page + 2 && current_page < last_page - 2)
      ) {
        pages.push(
          <button key={`dots-${i}`} className="page-btn" disabled>
            …
          </button>
        );
      }
    }

    pages.push(
      <button
        key="next"
        className="page-btn"
        disabled={current_page >= last_page}
        onClick={() => fetchUsers(current_page + 1)}
      >
        <ChevronRight size={14} />
      </button>
    );

    return pages;
  };

  const from = (pagination.current_page - 1) * pagination.per_page + 1;
  const to = Math.min(pagination.current_page * pagination.per_page, pagination.total);

  return (
    <div className="users-page">
      <Toast toasts={toasts} />

      {/* Page Header */}
      <div className="page-header-bar">
        <div className="page-header-left">
          <h2>Manajemen User</h2>
          <p>Kelola seluruh akun pengguna dan keterkaitan data profil Siswa/Guru (User ≠ Profil).</p>
        </div>
        <button className="btn-add" onClick={handleOpenAdd}>
          <Plus size={16} />
          Tambah User
        </button>
      </div>

      {/* Toolbar */}
      <div className="table-toolbar">
        <div className="search-box">
          <Search size={15} />
          <input
            type="text"
            className="search-input"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Role Filter */}
        <select
          className="filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Semua Role</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {/* Status Filter */}
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
          <span className="per-page-label">Tampilkan:</span>
          <select
            className="filter-select"
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
            }}
          >
            {[10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Profil Terkait</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td><div className="skeleton-bar" style={{ width: 24 }} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div className="skeleton-bar" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
                        <div className="skeleton-bar" style={{ width: 120 }} />
                      </div>
                    </td>
                    <td><div className="skeleton-bar" style={{ width: 130 }} /></td>
                    <td><div className="skeleton-bar" style={{ width: 60 }} /></td>
                    <td><div className="skeleton-bar" style={{ width: 50 }} /></td>
                    <td><div className="skeleton-bar" style={{ width: 110 }} /></td>
                    <td><div className="skeleton-bar" style={{ width: 80 }} /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <UsersIcon size={40} />
                      <p>
                        {search || roleFilter || statusFilter
                          ? "Tidak ada user yang sesuai kriteria pencarian/filter."
                          : "Belum ada data user."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr key={user.id}>
                    <td style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                      {from + idx}
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className={`user-avatar ${getAvatarClass(user.role)}`}>
                          {user.nama?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="user-cell-info">
                          <div className="user-name">{user.nama}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "#475569" }}>{user.email}</td>
                    <td>
                      <span className={`role-pill ${getRoleClass(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`status-pill ${user.status === "Nonaktif" ? "nonaktif" : "aktif"}`}
                        title="Klik untuk ubah status"
                        onClick={() => handleToggleStatus(user)}
                      >
                        <span className="dot" />
                        {user.status || "Aktif"}
                      </button>
                    </td>
                    <td>
                      {user.role === "Siswa" ? (
                        user.siswa ? (
                          <div className="profile-link-info siswa">
                            <span className="profile-tag">NISN: {user.siswa.nisn}</span>
                            {user.siswa.kelas && (
                              <span className="profile-sub">{user.siswa.kelas.nama_kelas}</span>
                            )}
                          </div>
                        ) : (
                          <span className="profile-empty">Belum diisi</span>
                        )
                      ) : user.role === "Guru" ? (
                        user.guru ? (
                          <div className="profile-link-info guru">
                            <span className="profile-tag">NIP: {user.guru.nip}</span>
                          </div>
                        ) : (
                          <span className="profile-empty">Belum diisi</span>
                        )
                      ) : (
                        <span className="profile-system">Akun System</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon toggle"
                          title={`Ubah Status to ${user.status === "Aktif" ? "Nonaktif" : "Aktif"}`}
                          onClick={() => handleToggleStatus(user)}
                        >
                          <Power size={13} />
                        </button>
                        <button
                          className="btn-icon edit"
                          title="Edit User"
                          onClick={() => handleOpenEdit(user)}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className="btn-icon delete"
                          title="Hapus User"
                          onClick={() => handleOpenDelete(user)}
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

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="pagination-bar">
            <span className="pagination-info">
              Menampilkan {from}–{to} dari {pagination.total} user
            </span>
            <div className="pagination-controls">{renderPageButtons()}</div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <UserModal
        visible={modalVisible}
        mode={modalMode}
        formData={formData}
        errors={formErrors}
        loading={savingForm}
        kelasList={kelasList}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        visible={confirmVisible}
        name={deletingUser?.nama}
        loading={deletingLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </div>
  );
};

export default Users;