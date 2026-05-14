import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useAdminStore from '../store/useAdminStore';
import { getOrderSortTimestamp, getOrderTotalNumber } from '../utils/adminOrdersUtils';

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

function buildCustomerRows(orders) {
    const map = new Map();

    for (const o of orders) {
        const emailRaw = (o.deliveryInfo?.email || '').trim();
        const emailKey = emailRaw.toLowerCase();
        const phone = (o.deliveryInfo?.phone || '').trim();
        const name = (o.deliveryInfo?.fullName || '').trim() || 'Unknown customer';
        const key = emailKey || phone || name;
        const ts = getOrderSortTimestamp(o);

        if (!map.has(key)) {
            map.set(key, {
                name,
                email: emailRaw || '—',
                phone: phone || '—',
                orderCount: 0,
                lastTs: 0,
                lastDateLabel: '—',
            });
        }
        const row = map.get(key);
        row.orderCount += 1;
        if (ts >= row.lastTs) {
            row.lastTs = ts;
            row.lastDateLabel = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—';
        }
    }

    return [...map.values()].sort((a, b) => b.lastTs - a.lastTs);
}

const Dashboard = () => {
    const {
        orders,
        products,
        loadingOrders,
        loadingProducts,
        fetchOrders,
        fetchProducts,
        errorOrders,
    } = useAdminStore();

    useEffect(() => {
        fetchProducts();

        const interval = setInterval(() => {
            useAdminStore.getState().fetchOrders();
        }, 15000);

        return () => clearInterval(interval);
    }, [fetchProducts]);

    const safeOrders = Array.isArray(orders) ? orders : [];
    const safeProducts = Array.isArray(products) ? products : [];

    const totalRevenue = useMemo(
        () => safeOrders.reduce((sum, o) => sum + getOrderTotalNumber(o), 0),
        [safeOrders]
    );

    const statusCounts = useMemo(() => {
        return safeOrders.reduce((acc, o) => {
            const status = o.status || 'Pending';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
    }, [safeOrders]);

    const latestOrders = useMemo(() => {
        return [...safeOrders]
            .sort((a, b) => getOrderSortTimestamp(b) - getOrderSortTimestamp(a))
            .slice(0, 8);
    }, [safeOrders]);

    const customerRows = useMemo(() => buildCustomerRows(safeOrders), [safeOrders]);
    const latestCustomers = useMemo(() => customerRows.slice(0, 8), [customerRows]);

    const recentProducts = useMemo(() => [...safeProducts].slice(0, 6), [safeProducts]);

    const initialOrdersLoad = loadingOrders && safeOrders.length === 0;
    const ordersSoftRefresh = loadingOrders && safeOrders.length > 0;

    if (initialOrdersLoad && safeProducts.length === 0 && loadingProducts) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-spinner" />
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    if (initialOrdersLoad) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-spinner" />
                <p>Loading orders...</p>
            </div>
        );
    }

    if (errorOrders && safeOrders.length === 0) {
        return (
            <div className="admin-empty" style={{ color: '#ff453a' }}>
                <i className="fa-solid fa-triangle-exclamation" />
                <p>{errorOrders}</p>
                <button type="button" className="admin-btn mt-3" onClick={() => fetchOrders()}>
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            {ordersSoftRefresh ? (
                <div
                    className="admin-loading"
                    style={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 50,
                        flexDirection: 'row',
                        gap: 12,
                        padding: '10px 16px',
                        borderRadius: 12,
                        background: 'rgba(28,28,30,0.85)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                    }}
                >
                    <div className="admin-loading-spinner" style={{ width: 20, height: 20 }} />
                    <span style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>Syncing orders…</span>
                </div>
            ) : null}

            <div className="admin-stats-grid">
                <div className="admin-stat-card stat-orders">
                    <div className="stat-icon">
                        <i className="fa-solid fa-receipt" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{safeOrders.length}</span>
                        <span className="stat-label">Total Orders</span>
                    </div>
                </div>

                <div className="admin-stat-card stat-revenue">
                    <div className="stat-icon">
                        <i className="fa-solid fa-dollar-sign" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">
                            $
                            {totalRevenue.toLocaleString('en-US', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                            })}
                        </span>
                        <span className="stat-label">Total Revenue</span>
                    </div>
                </div>

                <div className="admin-stat-card stat-products">
                    <div
                        className="stat-icon"
                        style={{ color: '#bf5af2', background: 'rgba(191, 90, 242, 0.15)' }}
                    >
                        <i className="fa-solid fa-users" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{customerRows.length}</span>
                        <span className="stat-label">Total Customers</span>
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
                        <Link to="/admin/orders" className="admin-card-action">
                            View All
                        </Link>
                    </div>
                    <div className="order-status-grid">
                        {['Pending', 'Processing', 'OnDelivery', 'Delivered'].map((status) => (
                            <div key={status} className="order-status-item">
                                <div
                                    className="order-status-icon"
                                    style={{
                                        background: `${STATUS_COLORS[status]}18`,
                                        color: STATUS_COLORS[status],
                                    }}
                                >
                                    <i className={`fa-solid ${STATUS_ICONS[status]}`} />
                                </div>
                                <span className="order-status-count">{statusCounts[status] || 0}</span>
                                <span className="order-status-name">
                                    {status === 'OnDelivery' ? 'On Delivery' : status}
                                </span>
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
                            <span className="revenue-amount">
                                $
                                {totalRevenue.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                            <span className="revenue-sub">Lifetime Revenue</span>
                        </div>
                        <div className="revenue-stats">
                            <div className="revenue-stat-item">
                                <span className="revenue-stat-label">Average Order</span>
                                <span className="revenue-stat-value">
                                    $
                                    {safeOrders.length > 0
                                        ? (totalRevenue / safeOrders.length).toFixed(2)
                                        : '0.00'}
                                </span>
                            </div>
                            <div className="revenue-stat-item">
                                <span className="revenue-stat-label">Pending</span>
                                <span className="revenue-stat-value">{statusCounts.Pending || 0}</span>
                            </div>
                            <div className="revenue-stat-item">
                                <span className="revenue-stat-label">Processing</span>
                                <span className="revenue-stat-value">{statusCounts.Processing || 0}</span>
                            </div>
                            <div className="revenue-stat-item">
                                <span className="revenue-stat-label">On Delivery</span>
                                <span className="revenue-stat-value">{statusCounts.OnDelivery || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-dashboard-row">
                <div className="admin-card admin-latest-orders" style={{ gridColumn: 'span 2' }}>
                    <div className="admin-card-header">
                        <h3>Recent Orders</h3>
                        <Link to="/admin/orders" className="admin-card-action">
                            View All
                        </Link>
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
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Email</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Payment</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestOrders.map((order) => {
                                        const st = order.status || 'Pending';
                                        const color = STATUS_COLORS[st] || STATUS_COLORS.Pending;
                                        const total = getOrderTotalNumber(order);
                                        const dateRaw = order.createdAt;
                                        const dateLabel = dateRaw
                                            ? new Date(dateRaw).toLocaleDateString()
                                            : '—';
                                        return (
                                            <tr key={order.id}>
                                                <td className="order-number-cell">
                                                    #{order.orderNumber ?? order.id}
                                                </td>
                                                <td>{order.deliveryInfo?.fullName || '—'}</td>
                                                <td style={{ color: 'var(--admin-text-muted)' }}>
                                                    {order.deliveryInfo?.email?.trim() || '—'}
                                                </td>
                                                <td className="order-total-cell">${total.toFixed(2)}</td>
                                                <td>
                                                    <span
                                                        className="admin-status-badge"
                                                        style={{
                                                            background: `${color}18`,
                                                            color,
                                                        }}
                                                    >
                                                        {st === 'OnDelivery' ? 'On Delivery' : st}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="admin-payment-badge">
                                                        {order.paymentMethod || '—'}
                                                    </span>
                                                </td>
                                                <td className="order-date-cell">{dateLabel}</td>
                                            </tr>
                                        );
                                    })}
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
                        <Link to="/admin/products" className="admin-card-action">
                            View All
                        </Link>
                    </div>
                    {loadingProducts && recentProducts.length === 0 ? (
                        <div className="admin-loading" style={{ minHeight: 120 }}>
                            <div className="admin-loading-spinner" />
                        </div>
                    ) : recentProducts.length === 0 ? (
                        <div className="admin-empty">
                            <i className="fa-solid fa-box-open" />
                            <p>No products yet</p>
                        </div>
                    ) : (
                        <div className="admin-products-mini-grid">
                            {recentProducts.map((product) => (
                                <div key={product.id} className="admin-product-mini-card">
                                    <div className="product-mini-img">
                                        <img
                                            src={product.pictureUrl || product.image}
                                            alt={product.name}
                                        />
                                    </div>
                                    <div className="product-mini-info">
                                        <span className="product-mini-name">{product.name}</span>
                                        <span className="product-mini-price">
                                            ${Number(product.price ?? 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="admin-card admin-latest-customers">
                    <div className="admin-card-header">
                        <h3>Recent Customers</h3>
                        <span className="admin-card-action">{customerRows.length} total</span>
                    </div>
                    {latestCustomers.length === 0 ? (
                        <div className="admin-empty">
                            <i className="fa-solid fa-users" />
                            <p>No customers yet</p>
                        </div>
                    ) : (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Orders</th>
                                        <th>Last order</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestCustomers.map((cust) => (
                                        <tr key={`${cust.email}|${cust.phone}|${cust.name}`}>
                                            <td style={{ fontWeight: 600 }}>{cust.name}</td>
                                            <td style={{ color: 'var(--admin-text-muted)' }}>{cust.email}</td>
                                            <td style={{ color: 'var(--admin-text-muted)' }}>{cust.phone}</td>
                                            <td>
                                                <span className="admin-payment-badge">{cust.orderCount}</span>
                                            </td>
                                            <td className="order-date-cell">{cust.lastDateLabel}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
