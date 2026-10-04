import api from "./api";

export const storeAbsensi = (token, data) =>
    api.post("/absensi", data, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const getAbsensiList = (token, params = {}) =>
    api.get("/absensi", {
        headers: { Authorization: `Bearer ${token}` },
        params,
    });

export const getRiwayatSaya = (token, params = {}) =>
    api.get("/absensi/riwayat-saya", {
        headers: { Authorization: `Bearer ${token}` },
        params,
    });

export const getAbsensiDetail = (token, id) =>
    api.get(`/absensi/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
