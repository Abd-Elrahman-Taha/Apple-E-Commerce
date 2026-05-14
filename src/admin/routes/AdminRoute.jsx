import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const AdminRoute = () => {
    const token = useAuthStore((state) => state.token);
    const role = useAuthStore((state) => state.role);
    const isTokenExpired = useAuthStore((state) => state.isTokenExpired);
    const logout = useAuthStore((state) => state.logout);

    if (!token) return <Navigate to="/login" replace />;

    if (isTokenExpired()) {
        logout();
        return <Navigate to="/login" replace />;
    }

    if (role !== 'Admin') return <Navigate to="/" replace />;

    return <Outlet />;
};

export default AdminRoute;
