import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import Users from "../pages/users/Users";
import Guru from "../pages/guru/Guru";
import Siswa from "../pages/siswa/Siswa";
import Kelas from "../pages/kelas/Kelas";
import Mapel from "../pages/mapel/Mapel";
import AbsensiAdmin from "../pages/absensi/AbsensiAdmin";
import AbsensiSiswa from "../pages/absensi/AbsensiSiswa";
import AbsensiAmbil from "../pages/absensi/AbsensiAmbil";
import PengajuanVerifikasi from "../pages/pengajuan-izin/PengajuanVerifikasi";
import JadwalAdmin from "../pages/jadwal/JadwalAdmin";
import JadwalReadonly from "../pages/jadwal/JadwalReadonly";
import JamPelajaranAdmin from "../pages/jadwal/JamPelajaranAdmin";
import Laporan from "../pages/laporan/Laporan";
import { useAuth } from "../context/AuthContext";

function JadwalPage() {
    const { user } = useAuth();
    return user?.role === "Admin" ? <JadwalAdmin /> : <JadwalReadonly />;
}

import PrivateRoute from "../components/auth/PrivateRoute";
import GuestRoute from "../components/auth/GuestRoute";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Navigate to="/login" />}
                />

                {/* Guest Routes — hanya bisa diakses jika BELUM login */}
                <Route
                    path="/login"
                    element={
                        <GuestRoute>
                            <Login />
                        </GuestRoute>
                    }
                />

                <Route
                    path="/register"
                    element={
                        <GuestRoute>
                            <Register />
                        </GuestRoute>
                    }
                />

                {/* Protected Routes — hanya bisa diakses jika SUDAH login */}
                <Route
                    element={
                        <PrivateRoute>
                            <AdminLayout />
                        </PrivateRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/guru" element={<Guru />} />
                    <Route path="/siswa" element={<Siswa />} />
                    <Route path="/kelas" element={<Kelas />} />
                    <Route path="/mapel" element={<Mapel />} />
                    <Route path="/absensi" element={<AbsensiAdmin />} />
                    <Route path="/absensi/siswa" element={<AbsensiSiswa />} />
                    <Route path="/absensi/siswa/ambil" element={<AbsensiAmbil />} />
                    <Route path="/pengajuan-izin/verifikasi" element={<PengajuanVerifikasi />} />
                    <Route path="/jadwal" element={<JadwalPage />} />
                    <Route path="/jadwal/jam-pelajaran" element={<JamPelajaranAdmin />} />
                    <Route path="/laporan" element={<Laporan />} />
                </Route>

                {/* Catch-all: redirect ke login */}
                <Route path="*" element={<Navigate to="/login" replace />} />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
