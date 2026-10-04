import api from "./api";

export const getAllKelas = async (token, params = {}) => {
    return await api.get("/kelas", {
        headers: { Authorization: `Bearer ${token}` },
        params,
    });
};

export const getKelasById = async (token, id) => {
    return await api.get(`/kelas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const createKelas = async (token, data) => {
    return await api.post("/kelas", data, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const updateKelas = async (token, id, data) => {
    return await api.put(`/kelas/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const deleteKelas = async (token, id) => {
    return await api.delete(`/kelas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};
