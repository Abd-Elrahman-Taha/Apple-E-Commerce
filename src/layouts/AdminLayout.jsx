import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../admin/components/AdminSidebar';
import AdminMobileNav from '../admin/components/AdminMobileNav';
import useAdminStore from '../admin/store/useAdminStore';
import '../admin/admin.css';

const pageTitles = {
    '/admin': 'Dashboard',
    '/admin/products': 'Products',
    '/admin/orders': 'Orders',
    '/admin/add-product': 'Add Product',
};

const AdminLayout = () => {
    const location = useLocation();

    useEffect(() => {
        useAdminStore.getState().fetchOrders();
    }, [location.pathname]);

    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === 'visible') {
                useAdminStore.getState().fetchOrders();
            }
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
    }, []);

    const getTitle = () => {
        if (location.pathname.startsWith('/admin/edit-product')) return 'Edit Product';
        return pageTitles[location.pathname] || 'Admin';
    };
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-main">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h1 className="admin-page-title">{getTitle()}</h1>
                        <p className="admin-page-sub">Apple Store — Admin Panel</p>
                    </div>
                    <div className="admin-header-right">
                        <div className="admin-header-badge">
                            <i className="fa-solid fa-shield-halved" />
                            Admin
                        </div>
                    </div>
                </header>
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
            <AdminMobileNav />
        </div>
    );
};

export default AdminLayout;
