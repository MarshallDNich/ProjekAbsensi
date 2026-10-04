import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * PrivateRoute — Proteksi halaman admin
 *
 * Jika user BELUM login (tidak ada token),
 * redirect ke halaman /login.
 * Saat sedang verifikasi token, tampilkan loading.
 */
function PrivateRoute({ children }) {
    const { token, loading } = useAuth();
    const location = useLocation();

    // Tampilkan loading spinner saat verifikasi token
    if (loading) {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                background: "#f1f5f9",
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
            }}>
                <div style={{ textAlign: "center" }}>
                    <div
                        className="spinner-border"
                        role="status"
                        style={{
                            width: "2.5rem",
                            height: "2.5rem",
                            color: "#dc2626",
                            borderWidth: "0.2em"
                        }}
                    >
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p style={{
                        marginTop: "1rem",
                        color: "#64748b",
                        fontSize: "0.9rem",
                        fontWeight: 500
                    }}>
                        Memverifikasi sesi...
                    </p>
                </div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

export default PrivateRoute;
