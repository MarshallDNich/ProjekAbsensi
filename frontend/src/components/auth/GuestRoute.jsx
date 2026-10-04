import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * GuestRoute — Proteksi halaman guest (Login / Register)
 *
 * Jika user SUDAH login (ada token),
 * redirect ke halaman /dashboard.
 */
function GuestRoute({ children }) {
    const { token } = useAuth();

    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default GuestRoute;
