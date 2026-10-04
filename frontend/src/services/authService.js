import api from "./api";

export const login = (data) => api.post("/login", data);

export const register = (data) => api.post("/register", data);

export const logout = (token) =>
    api.post(
        "/logout",
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

export const me = (token) =>
    api.get("/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

export const registerWajah = (token, data) =>
    api.post("/me/register-wajah", data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });