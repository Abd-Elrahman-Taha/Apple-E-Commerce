import { Link, useLocation } from 'react-router-dom';

const navItems = [
    { path: '/admin', icon: 'fa-gauge-high', label: 'Dashboard', exact: true },
    { path: '/admin/products', icon: 'fa-box', label: 'Products' },
    { path: '/admin/orders', icon: 'fa-receipt', label: 'Orders' },
    { path: '/admin/add-product', icon: 'fa-plus', label: 'Add' },
];

const AdminMobileNav = () => {
    const location = useLocation();

    const isActive = (item) => {
        if (item.exact) return location.pathname === item.path;
        return location.pathname.startsWith(item.path);
    };

    return (
        <nav className="admin-mobile-nav">
            {navItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`admin-mobile-nav-item ${isActive(item) ? 'active' : ''}`}
                >
                    <i className={`fa-solid ${item.icon}`} />
                    <span>{item.label}</span>
                </Link>
            ))}
        </nav>
    );
};

export default AdminMobileNav;
