import api from "./api";

export const getAllSiswa = async (token, params = {}) => {
    return await api.get("/siswa", {
        headers: { Authorization: `Bearer ${token}` },
        params,
    });
};

export const getSiswaById = async (token, id) => {
    return await api.get(`/siswa/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const createSiswa = async (token, data) => {
    return await api.post("/siswa", data, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const updateSiswa = async (token, id, data) => {
    return await api.put(`/siswa/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const deleteSiswa = async (token, id) => {
    return await api.delete(`/siswa/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};