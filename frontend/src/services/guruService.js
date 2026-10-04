import api from "./api";

export const getAllGuru = async (token, params = {}) => {
    return await api.get("/guru", {
        headers: { Authorization: `Bearer ${token}` },
        params,
    });
};

export const getGuruById = async (token, id) => {
    return await api.get(`/guru/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const createGuru = async (token, data) => {
    return await api.post("/guru", data, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const updateGuru = async (token, id, data) => {
    return await api.put(`/guru/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const deleteGuru = async (token, id) => {
    return await api.delete(`/guru/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};
