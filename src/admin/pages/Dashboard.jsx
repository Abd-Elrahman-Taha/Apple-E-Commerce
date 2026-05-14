import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../services/adminApi';
import useAdminStore from '../store/useAdminStore';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import {
    extractOrdersListWithFallback,
    normalizeAdminOrders,
    normalizeAdminOrder,
    getOrderSortTimestamp,
    getOrderTotalNumber,
} from '../utils/adminOrdersUtils';

const STATUSES = ['Pending', 'Processing', 'OnDelivery', 'Delivered'];

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
        const phone = (o.deliveryInfo?.phone || '').trim();
        const name = (o.deliveryInfo?.fullName || '').trim() || 'Unknown';
        const addr = (o.deliveryInfo?.address || '').trim();
        const key = phone || `${name}|${addr}`.toLowerCase();
        const ts = getOrderSortTimestamp(o);
        if (!map.has(key)) {
            map.set(key, { name, phone: phone || '—', address: addr || '—', orderCount: 0, totalSpent: 0, lastTs: 0, lastDate: '—' });
        }
        const row = map.get(key);
        row.orderCount += 1;
        row.totalSpent += getOrderTotalNumber(o);
        if (ts >= row.lastTs) {
            row.lastTs = ts;
            row.lastDate = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—';
        }
    }
    return [...map.values()].sort((a, b) => b.lastTs - a.lastTs);
}

const Dashboard = () => {
    const { toasts, toast, removeToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [activeTab, setActiveTab] = useState('orders');

    async function loadOrders() {
        try {
            setError(null);
            const res = await adminApi.getOrders();
            
            // Also check user-level endpoint for comparison
            try {
                const userRes = await import('../../api/api').then(m => m.default.get('/Orders'));
                console.log('[Dashboard] USER /api/Orders data:', userRes.data, 'length:', Array.isArray(userRes.data) ? userRes.data.length : 'not array');
            } catch (e) {
                console.log('[Dashboard] USER /api/Orders error:', e.message);
            }
            const token = res.config?.headers?.Authorization;
            console.log('[Dashboard] Auth token sent:', token ? token.substring(0, 30) + '...' : 'NO TOKEN!');
            console.log('[Dashboard] Response status:', res.status);
            console.log('[Dashboard] RAW res.data:', res.data);
            console.log('[Dashboard] typeof res.data:', typeof res.data);
            console.log('[Dashboard] Array.isArray:', Array.isArray(res.data));

            // API returns flat OrderDto[] array per Swagger spec
            let rawList = res.data;

            // If somehow wrapped, try to extract
            if (!Array.isArray(rawList)) {
                console.log('[Dashboard] Not array, trying extraction...');
                rawList = extractOrdersListWithFallback(res.data);
            }

            console.log('[Dashboard] rawList length:', rawList?.length);

            // Normalize
            const normalized = Array.isArray(rawList) ? normalizeAdminOrders(rawList) : [];
            console.log('[Dashboard] normalized length:', normalized.length);
            if (normalized.length > 0) console.log('[Dashboard] first order:', normalized[0]);

            setOrders(normalized);
            useAdminStore.setState({ orders: normalized, loadingOrders: false, errorOrders: null });
        } catch (err) {
            console.error('[Dashboard] FETCH ERROR:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load orders');
        }
    }

    useEffect(() => {
        setLoading(true);
        loadOrders().finally(() => setLoading(false));
        const interval = setInterval(loadOrders, 20000);
        return () => clearInterval(interval);
    }, []);

    const safeOrders = Array.isArray(orders) ? orders : [];

    const totalRevenue = useMemo(() => safeOrders.reduce((s, o) => s + getOrderTotalNumber(o), 0), [safeOrders]);

    const statusCounts = useMemo(() => safeOrders.reduce((acc, o) => {
        const st = o.status || 'Pending';
        acc[st] = (acc[st] || 0) + 1;
        return acc;
    }, {}), [safeOrders]);

    const filteredOrders = useMemo(() => {
        const sorted = [...safeOrders].sort((a, b) => getOrderSortTimestamp(b) - getOrderSortTimestamp(a));
        return statusFilter ? sorted.filter(o => o.status === statusFilter) : sorted;
    }, [safeOrders, statusFilter]);

    const customerRows = useMemo(() => buildCustomerRows(safeOrders), [safeOrders]);

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await adminApi.updateOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => String(o.id) === String(orderId) ? { ...o, status: newStatus } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
            }
            toast.success(`Order status updated to ${newStatus}`);
        } catch {
            toast.error('Failed to update order status');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleViewDetails = async (order) => {
        setDetailLoading(true);
        setSelectedOrder(order);
        try {
            const res = await adminApi.getOrder(order.id);
            const detail = normalizeAdminOrder(res.data) || res.data;
            setSelectedOrder(detail);
        } catch {
            toast.error('Failed to load order details');
        } finally {
            setDetailLoading(false);
        }
    };

    if (loading && safeOrders.length === 0) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-spinner" />
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error && safeOrders.length === 0) {
        return (
            <div className="admin-empty" style={{ color: '#ff453a' }}>
                <i className="fa-solid fa-triangle-exclamation" />
                <p>{error}</p>
                <button type="button" className="admin-btn mt-3" onClick={() => { setLoading(true); loadOrders().finally(() => setLoading(false)); }}>Try again</button>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <Toast toasts={toasts} removeToast={removeToast} />

            {/* ── Stats Cards ── */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card stat-orders">
                    <div className="stat-icon"><i className="fa-solid fa-receipt" /></div>
                    <div className="stat-info">
                        <span className="stat-value">{safeOrders.length}</span>
                        <span className="stat-label">Total Orders</span>
                    </div>
                </div>
                <div className="admin-stat-card stat-revenue">
                    <div className="stat-icon"><i className="fa-solid fa-dollar-sign" /></div>
                    <div className="stat-info">
                        <span className="stat-value">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="stat-label">Total Revenue</span>
                    </div>
                </div>
                <div className="admin-stat-card stat-products">
                    <div className="stat-icon" style={{ color: '#bf5af2', background: 'rgba(191,90,242,0.15)' }}><i className="fa-solid fa-users" /></div>
                    <div className="stat-info">
                        <span className="stat-value">{customerRows.length}</span>
                        <span className="stat-label">Total Customers</span>
                    </div>
                </div>
                <div className="admin-stat-card stat-delivered">
                    <div className="stat-icon"><i className="fa-solid fa-circle-check" /></div>
                    <div className="stat-info">
                        <span className="stat-value">{statusCounts.Delivered || 0}</span>
                        <span className="stat-label">Delivered</span>
                    </div>
                </div>
            </div>

            {/* ── Order Status Breakdown ── */}
            <div className="admin-dashboard-row">
                <div className="admin-card admin-order-status-card">
                    <div className="admin-card-header"><h3>Order Status</h3></div>
                    <div className="order-status-grid">
                        {STATUSES.map(st => (
                            <div key={st} className="order-status-item" style={{ cursor: 'pointer' }} onClick={() => { setStatusFilter(statusFilter === st ? '' : st); setActiveTab('orders'); }}>
                                <div className="order-status-icon" style={{ background: `${STATUS_COLORS[st]}18`, color: STATUS_COLORS[st] }}>
                                    <i className={`fa-solid ${STATUS_ICONS[st]}`} />
                                </div>
                                <span className="order-status-count">{statusCounts[st] || 0}</span>
                                <span className="order-status-name">{st === 'OnDelivery' ? 'On Delivery' : st}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="admin-card admin-revenue-card">
                    <div className="admin-card-header"><h3>Revenue Summary</h3></div>
                    <div className="revenue-summary">
                        <div className="revenue-main">
                            <span className="revenue-amount">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            <span className="revenue-sub">Lifetime Revenue</span>
                        </div>
                        <div className="revenue-stats">
                            <div className="revenue-stat-item">
                                <span className="revenue-stat-label">Average Order</span>
                                <span className="revenue-stat-value">${safeOrders.length > 0 ? (totalRevenue / safeOrders.length).toFixed(2) : '0.00'}</span>
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

            {/* ── Tab Switcher ── */}
            <div className="admin-status-filters" style={{ marginBottom: 0 }}>
                <button className={`admin-status-filter-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                    <i className="fa-solid fa-receipt" /> Orders <span className="filter-count">{filteredOrders.length}</span>
                </button>
                <button className={`admin-status-filter-btn ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
                    <i className="fa-solid fa-users" /> Customers <span className="filter-count">{customerRows.length}</span>
                </button>
            </div>

            {/* ── Orders Tab ── */}
            {activeTab === 'orders' && (
                <>
                    {/* Status Filters */}
                    <div className="admin-status-filters">
                        <button className={`admin-status-filter-btn ${!statusFilter ? 'active' : ''}`} onClick={() => setStatusFilter('')}>
                            All <span className="filter-count">{safeOrders.length}</span>
                        </button>
                        {STATUSES.map(st => (
                            <button key={st} className={`admin-status-filter-btn ${statusFilter === st ? 'active' : ''}`}
                                onClick={() => setStatusFilter(statusFilter === st ? '' : st)}
                                style={{ '--status-color': STATUS_COLORS[st] }}>
                                <i className={`fa-solid ${STATUS_ICONS[st]}`} />
                                {st === 'OnDelivery' ? 'On Delivery' : st}
                                <span className="filter-count">{statusCounts[st] || 0}</span>
                            </button>
                        ))}
                    </div>

                    {filteredOrders.length === 0 ? (
                        <div className="admin-empty"><i className="fa-solid fa-inbox" /><p>{statusFilter ? `No ${statusFilter} orders` : 'No orders yet'}</p></div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="admin-orders-list-desktop">
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Order</th>
                                                <th>Customer</th>
                                                <th>Phone</th>
                                                <th>Items</th>
                                                <th>Total</th>
                                                <th>Payment</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrders.map(order => (
                                                <tr key={order.id}>
                                                    <td className="order-number-cell">#{order.orderNumber || order.id}</td>
                                                    <td>{order.deliveryInfo?.fullName || '—'}</td>
                                                    <td style={{ color: 'var(--admin-text-muted)' }}>{order.deliveryInfo?.phone || '—'}</td>
                                                    <td>{order.items?.length || 0}</td>
                                                    <td className="order-total-cell">${getOrderTotalNumber(order).toFixed(2)}</td>
                                                    <td><span className="admin-payment-badge">{order.paymentMethod || '—'}</span></td>
                                                    <td>
                                                        <select className="admin-status-select" value={order.status} disabled={updatingId === order.id}
                                                            onChange={e => handleStatusChange(order.id, e.target.value)}
                                                            style={{ color: STATUS_COLORS[order.status], borderColor: `${STATUS_COLORS[order.status]}40` }}>
                                                            {STATUSES.map(s => <option key={s} value={s}>{s === 'OnDelivery' ? 'On Delivery' : s}</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="order-date-cell">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</td>
                                                    <td>
                                                        <button className="admin-action-btn view" onClick={() => handleViewDetails(order)} title="View Details">
                                                            <i className="fa-solid fa-eye" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Cards */}
                            <div className="admin-orders-list-mobile">
                                {filteredOrders.map(order => (
                                    <div key={order.id} className="admin-order-card" onClick={() => handleViewDetails(order)}>
                                        <div className="order-card-header">
                                            <span className="order-card-number">#{order.orderNumber || order.id}</span>
                                            <span className="admin-status-badge" style={{ background: `${STATUS_COLORS[order.status]}18`, color: STATUS_COLORS[order.status] }}>
                                                {order.status === 'OnDelivery' ? 'On Delivery' : order.status}
                                            </span>
                                        </div>
                                        <div className="order-card-body">
                                            <div className="order-card-row"><span className="order-card-label">Customer</span><span>{order.deliveryInfo?.fullName || '—'}</span></div>
                                            <div className="order-card-row"><span className="order-card-label">Total</span><span className="order-card-total">${getOrderTotalNumber(order).toFixed(2)}</span></div>
                                            <div className="order-card-row"><span className="order-card-label">Date</span><span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}

            {/* ── Customers Tab ── */}
            {activeTab === 'customers' && (
                <div className="admin-card" style={{ marginTop: 16 }}>
                    <div className="admin-card-header">
                        <h3>All Customers ({customerRows.length})</h3>
                    </div>
                    {customerRows.length === 0 ? (
                        <div className="admin-empty"><i className="fa-solid fa-users" /><p>No customers yet</p></div>
                    ) : (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Address</th>
                                        <th>Orders</th>
                                        <th>Total Spent</th>
                                        <th>Last Order</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customerRows.map((cust, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600 }}>{cust.name}</td>
                                            <td style={{ color: 'var(--admin-text-muted)' }}>{cust.phone}</td>
                                            <td style={{ color: 'var(--admin-text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cust.address}</td>
                                            <td><span className="admin-payment-badge">{cust.orderCount}</span></td>
                                            <td className="order-total-cell">${cust.totalSpent.toFixed(2)}</td>
                                            <td className="order-date-cell">{cust.lastDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Order Detail Modal ── */}
            {selectedOrder && (
                <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="admin-modal admin-modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-close" onClick={() => setSelectedOrder(null)}>
                            <i className="fa-solid fa-xmark" />
                        </div>
                        {detailLoading ? (
                            <div className="admin-loading" style={{ minHeight: 200 }}><div className="admin-loading-spinner" /></div>
                        ) : (
                            <>
                                <div className="order-detail-header">
                                    <div>
                                        <h3>Order #{selectedOrder.orderNumber || selectedOrder.id}</h3>
                                        <span className="order-detail-date">
                                            {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                                        </span>
                                    </div>
                                    <span className="admin-status-badge" style={{ background: `${STATUS_COLORS[selectedOrder.status]}18`, color: STATUS_COLORS[selectedOrder.status] }}>
                                        <i className={`fa-solid ${STATUS_ICONS[selectedOrder.status]}`} />
                                        {selectedOrder.status === 'OnDelivery' ? 'On Delivery' : selectedOrder.status}
                                    </span>
                                </div>

                                <div className="order-detail-section">
                                    <h4>Customer Information</h4>
                                    <div className="order-detail-info-grid">
                                        <div><span className="info-label">Name</span><span>{selectedOrder.deliveryInfo?.fullName || '—'}</span></div>
                                        <div><span className="info-label">Phone</span><span>{selectedOrder.deliveryInfo?.phone || '—'}</span></div>
                                        <div><span className="info-label">Address</span><span>{selectedOrder.deliveryInfo?.address || '—'}</span></div>
                                        <div><span className="info-label">Payment</span><span>{selectedOrder.paymentMethod || '—'}</span></div>
                                    </div>
                                </div>

                                <div className="order-detail-section">
                                    <h4>Order Items</h4>
                                    <div className="order-detail-items">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <div key={idx} className="order-detail-item">
                                                <div className="order-item-img"><img src={item.pictureUrl || item.image} alt={item.name} /></div>
                                                <div className="order-item-info">
                                                    <span className="order-item-name">{item.name}</span>
                                                    <span className="order-item-qty">Qty: {item.quantity}</span>
                                                </div>
                                                <span className="order-item-price">${item.total?.toFixed(2) || (item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="order-detail-total">
                                    <div className="order-total-row">
                                        <span>Subtotal</span>
                                        <span>${selectedOrder.subtotal?.toFixed(2) || getOrderTotalNumber(selectedOrder).toFixed(2)}</span>
                                    </div>
                                    <div className="order-total-row total">
                                        <span>Total</span>
                                        <span>${getOrderTotalNumber(selectedOrder).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="order-detail-actions">
                                    <span className="order-detail-status-label">Update Status:</span>
                                    <div className="order-status-btns">
                                        {STATUSES.map(s => (
                                            <button key={s}
                                                className={`admin-btn admin-btn-sm ${selectedOrder.status === s ? 'active' : ''}`}
                                                style={{
                                                    '--btn-color': STATUS_COLORS[s],
                                                    background: selectedOrder.status === s ? `${STATUS_COLORS[s]}25` : 'transparent',
                                                    color: selectedOrder.status === s ? STATUS_COLORS[s] : 'rgba(245,245,247,0.5)',
                                                    borderColor: selectedOrder.status === s ? `${STATUS_COLORS[s]}40` : 'rgba(255,255,255,0.08)',
                                                }}
                                                onClick={() => handleStatusChange(selectedOrder.id, s)}
                                                disabled={updatingId === selectedOrder.id}>
                                                <i className={`fa-solid ${STATUS_ICONS[s]}`} />
                                                {s === 'OnDelivery' ? 'On Delivery' : s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
