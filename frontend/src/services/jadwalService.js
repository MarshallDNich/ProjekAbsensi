import api from "./api";

const authHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` },
});

// ===== Timetable =====
export const getTimetable = (token, params = {}) =>
    api.get("/jadwal-pelajaran/timetable", { ...authHeaders(token), params });

// ===== Jadwal Pelajaran =====
export const getJadwalList = (token, params = {}) =>
    api.get("/jadwal-pelajaran", { ...authHeaders(token), params });

export const getJadwalById = (token, id) =>
    api.get(`/jadwal-pelajaran/${id}`, authHeaders(token));

export const createJadwal = (token, data) =>
    api.post("/jadwal-pelajaran", data, authHeaders(token));

export const updateJadwal = (token, id, data) =>
    api.put(`/jadwal-pelajaran/${id}`, data, authHeaders(token));

export const deleteJadwal = (token, id) =>
    api.delete(`/jadwal-pelajaran/${id}`, authHeaders(token));

// ===== Jam Pelajaran =====
export const getJamPelajaran = (token) =>
    api.get("/jam-pelajaran", authHeaders(token));

export const createJamPelajaran = (token, data) =>
    api.post("/jam-pelajaran", data, authHeaders(token));

export const updateJamPelajaran = (token, id, data) =>
    api.put(`/jam-pelajaran/${id}`, data, authHeaders(token));

export const deleteJamPelajaran = (token, id) =>
    api.delete(`/jam-pelajaran/${id}`, authHeaders(token));

export const reorderJamPelajaran = (token, ids) =>
    api.post("/jam-pelajaran/reorder", { ids }, authHeaders(token));
