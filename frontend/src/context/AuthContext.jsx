import { createContext, useContext, useState, useEffect } from "react";
import { me as meApi } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [token, setToken] = useState(
        localStorage.getItem("token") || ""
    );

    const [loading, setLoading] = useState(true);

    /**
     * Saat aplikasi pertama kali dimuat dan token ada,
     * verifikasi token ke backend dengan endpoint /me.
     * Jika token expired / invalid, auto-logout.
     */
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await meApi(token);
                const userData = response.data.data;
                setUser(userData);
                localStorage.setItem("user", JSON.stringify(userData));
            } catch (err) {
                // Token invalid atau expired, bersihkan session
                console.warn("Token tidak valid, logout otomatis.");
                setUser(null);
                setToken("");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, []);

    const login = (userData, accessToken) => {
        setUser(userData);
        setToken(accessToken);
        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken("");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}