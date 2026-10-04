import api from "./api";

const authHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` },
});

export const getPengajuanList = (token, params = {}) =>
    api.get("/pengajuan-izin", { ...authHeaders(token), params });

export const getPengajuanById = (token, id) =>
    api.get(`/pengajuan-izin/${id}`, authHeaders(token));

export const createPengajuan = async (token, data) => {
    const form = new FormData();
    form.append("tanggal_mulai", data.tanggal_mulai);
    form.append("tanggal_selesai", data.tanggal_selesai);
    form.append("jenis", data.jenis);
    form.append("alasan", data.alasan);
    form.append("bukti", data.bukti);

    return api.post("/pengajuan-izin", form, {
        // Content-Type = false supaya browser lepas boundary multipart
        headers: { Authorization: `Bearer ${token}`, "Content-Type": false },
    });
};

export const approvePengajuan = (token, id, catatan = null) =>
    api.patch(`/pengajuan-izin/${id}/approve`, { catatan }, authHeaders(token));

export const rejectPengajuan = (token, id, catatan = null) =>
    api.patch(`/pengajuan-izin/${id}/reject`, { catatan }, authHeaders(token));
