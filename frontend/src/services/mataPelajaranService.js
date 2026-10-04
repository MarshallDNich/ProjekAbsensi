import api from "./api";

export const getAllMataPelajaran = async (token, params = {}) => {
    return await api.get("/mata-pelajaran", {
        headers: { Authorization: `Bearer ${token}` },
        params,
    });
};

export const getMataPelajaranById = async (token, id) => {
    return await api.get(`/mata-pelajaran/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const createMataPelajaran = async (token, data) => {
    return await api.post("/mata-pelajaran", data, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const updateMataPelajaran = async (token, id, data) => {
    return await api.put(`/mata-pelajaran/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const deleteMataPelajaran = async (token, id) => {
    return await api.delete(`/mata-pelajaran/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};
