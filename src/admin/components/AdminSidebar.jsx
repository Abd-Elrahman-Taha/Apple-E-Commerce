import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const navItems = [
    { path: '/admin', icon: 'fa-gauge-high', label: 'Dashboard', exact: true },
    { path: '/admin/products', icon: 'fa-box', label: 'Products' },
    { path: '/admin/orders', icon: 'fa-receipt', label: 'Orders' },
    { path: '/admin/add-product', icon: 'fa-plus', label: 'Add Product' },
];

const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const isActive = (item) => {
        if (item.exact) return location.pathname === item.path;
        return location.pathname.startsWith(item.path);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getInitials = (name) => {
        if (!name) return 'A';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-logo">
                <Link to="/" className="admin-logo-link">
                    <i className="fa-brands fa-apple" />
                </Link>
                <div className="admin-logo-text">
                    <span className="admin-logo-title">Admin</span>
                    <span className="admin-logo-sub">Control Panel</span>
                </div>
            </div>

            <nav className="admin-sidebar-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`admin-nav-item ${isActive(item) ? 'active' : ''}`}
                    >
                        <i className={`fa-solid ${item.icon}`} />
                        <span>{item.label}</span>
                        {isActive(item) && <div className="admin-nav-indicator" />}
                    </Link>
                ))}
            </nav>

            <div className="admin-sidebar-footer">
                <div className="admin-sidebar-user">
                    <div className="admin-sidebar-avatar">
                        {getInitials(user?.name)}
                    </div>
                    <div className="admin-sidebar-user-info">
                        <p className="admin-sidebar-name">{user?.name || 'Admin'}</p>
                        <p className="admin-sidebar-role">Administrator</p>
                    </div>
                </div>

                <div className="admin-sidebar-actions">
                    <Link to="/" className="admin-sidebar-action-btn" title="Go to Store">
                        <i className="fa-solid fa-store" />
                    </Link>
                    <button
                        className="admin-sidebar-action-btn logout"
                        onClick={handleLogout}
                        title="Sign Out"
                    >
                        <i className="fa-solid fa-right-from-bracket" />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
