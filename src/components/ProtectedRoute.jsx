import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const ProtectedRoute = () => {
    const location = useLocation();
    const token = useAuthStore((state) => state.token);
    const isTokenExpired = useAuthStore((state) => state.isTokenExpired);
    const logout = useAuthStore((state) => state.logout);

    if (!token) {
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
    }

    if (isTokenExpired()) {
        logout();
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
