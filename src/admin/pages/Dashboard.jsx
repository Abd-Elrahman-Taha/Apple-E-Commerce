import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../services/adminApi';

const STATUS_COLORS = {
    Pending: '#ffd60a',
    Processing: '#0a84ff',
    OnDelivery: '#bf5af2',
    Delivered: '#30d158',
};

const STATUS_ICONS = {
    Pending: 'fa-clock',
    Processing: 'fa-gear',
    OnDelivery: 'fa-truck',
    Delivered: 'fa-circle-check',
};

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, ordRes] = await Promise.all([
                    adminApi.getProducts(1, 100),
                    adminApi.getOrders(),
                ]);
                setProducts(prodRes.data?.data || prodRes.data || []);
                setOrders(Array.isArray(ordRes.data) ? ordRes.data : []);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const statusCounts = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {});

    const latestOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    const recentProducts = [...products].slice(0, 6);

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-spinner" />
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-stats-grid">
                <div className="admin-stat-card stat-products">
                    <div className="stat-icon">
                        <i className="fa-solid fa-box" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{products.length}</span>
                        <span className="stat-label">Total Products</span>
                    </div>
                </div>

                <div className="admin-stat-card stat-orders">
                    <div className="stat-icon">
                        <i className="fa-solid fa-receipt" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{orders.length}</span>
                        <span className="stat-label">Total Orders</span>
                    </div>
                </div>

                <div className="admin-stat-card stat-revenue">
                    <div className="stat-icon">
                        <i className="fa-solid fa-dollar-sign" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        <span className="stat-label">Total Revenue</span>
                    </div>
                </div>

                <div className="admin-stat-card stat-delivered">
                    <div className="stat-icon">
                        <i className="fa-solid fa-circle-check" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{statusCounts.Delivered || 0}</span>
                        <span className="stat-label">Delivered</span>
                    </div>
                </div>
            </div>

            <div className="admin-dashboard-row">
                <div className="admin-card admin-order-status-card">
                    <div className="admin-card-header">
                        <h3>Order Status</h3>
                        <Link to="/admin/orders" className="admin-card-action">View All</Link>
                    </div>
                    <div className="order-status-grid">
                        {['Pending', 'Processing', 'OnDelivery', 'Delivered'].map((status) => (
                            <div key={status} className="order-status-item">
                                <div className="order-status-icon" style={{ background: `${STATUS_COLORS[status]}18`, color: STATUS_COLORS[status] }}>
                                    <i className={`fa-solid ${STATUS_ICONS[status]}`} />
                                </div>
                                <span className="order-status-count">{statusCounts[status] || 0}</span>
                                <span className="order-status-name">{status === 'OnDelivery' ? 'On Delivery' : status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="admin-card admin-revenue-card">
                    <div className="admin-card-header">
                        <h3>Revenue Summary</h3>
                    </div>
                    <div className="revenue-summary">
                        <div className="revenue-main">
                            <span className="revenue-amount">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            <span className="revenue-sub">Lifetime Revenue</span>
                        </div>
                        <div className="revenue-stats">
                            <div className="revenue-stat-item">
                                <span className="revenue-stat-label">Average Order</span>
                                <span className="revenue-stat-value">
                                    ${orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}
                                </span>
                            </div>
                            <div className="revenue-stat-item">
                                <span className="revenue-stat-label">Pending Orders</span>
                                <span className="revenue-stat-value">{statusCounts.Pending || 0}</span>
                            </div>
                            <div className="revenue-stat-item">
                                <span className="revenue-stat-label">Processing</span>
                                <span className="revenue-stat-value">{statusCounts.Processing || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-dashboard-row">
                <div className="admin-card admin-latest-orders">
                    <div className="admin-card-header">
                        <h3>Latest Orders</h3>
                        <Link to="/admin/orders" className="admin-card-action">View All</Link>
                    </div>
                    {latestOrders.length === 0 ? (
                        <div className="admin-empty">
                            <i className="fa-solid fa-inbox" />
                            <p>No orders yet</p>
                        </div>
                    ) : (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Order</th>
                                        <th>Customer</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="order-number-cell">#{order.orderNumber || order.id}</td>
                                            <td>{order.deliveryInfo?.fullName || '—'}</td>
                                            <td className="order-total-cell">${order.total?.toFixed(2)}</td>
                                            <td>
                                                <span className="admin-status-badge" style={{ background: `${STATUS_COLORS[order.status]}18`, color: STATUS_COLORS[order.status] }}>
                                                    {order.status === 'OnDelivery' ? 'On Delivery' : order.status}
                                                </span>
                                            </td>
                                            <td className="order-date-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <div className="admin-dashboard-row">
                <div className="admin-card admin-recent-products">
                    <div className="admin-card-header">
                        <h3>Recent Products</h3>
                        <Link to="/admin/products" className="admin-card-action">View All</Link>
                    </div>
                    {recentProducts.length === 0 ? (
                        <div className="admin-empty">
                            <i className="fa-solid fa-box-open" />
                            <p>No products yet</p>
                        </div>
                    ) : (
                        <div className="admin-products-mini-grid">
                            {recentProducts.map((product) => (
                                <div key={product.id} className="admin-product-mini-card">
                                    <div className="product-mini-img">
                                        <img src={product.pictureUrl || product.image} alt={product.name} />
                                    </div>
                                    <div className="product-mini-info">
                                        <span className="product-mini-name">{product.name}</span>
                                        <span className="product-mini-price">${product.price?.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
