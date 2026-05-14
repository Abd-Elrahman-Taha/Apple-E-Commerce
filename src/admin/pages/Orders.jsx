import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import adminApi from '../services/adminApi';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import useAdminStore from '../store/useAdminStore';
import { normalizeAdminOrder } from '../utils/adminOrdersUtils';

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

const Orders = () => {
    const { pathname } = useLocation();
    const { toasts, toast, removeToast } = useToast();
    const {
        orders,
        loadingOrders: loading,
        fetchOrders,
        updateOrderStatus: updateStatusInStore,
        errorOrders,
    } = useAdminStore();
    
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        if (pathname === '/admin/orders') {
            fetchOrders();
        }
    }, [pathname, fetchOrders]);

    const filteredOrders = statusFilter
        ? orders.filter((o) => o.status === statusFilter)
        : orders;

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await updateStatusInStore(orderId, newStatus);
            if (selectedOrder?.id === orderId) {
                setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
            }
            toast.success(`Order status updated to ${newStatus}`);
        } catch (err) {
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
        } catch (err) {
            toast.error('Failed to load order details');
        } finally {
            setDetailLoading(false);
        }
    };

    const statusCounts = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {});

    if (loading && orders.length === 0) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-spinner" />
                <p>Loading orders...</p>
            </div>
        );
    }

    if (errorOrders && orders.length === 0) {
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
        <div className="admin-orders-page">
            <Toast toasts={toasts} removeToast={removeToast} />

            <div className="admin-status-filters">
                <button
                    className={`admin-status-filter-btn ${!statusFilter ? 'active' : ''}`}
                    onClick={() => setStatusFilter('')}
                >
                    All <span className="filter-count">{orders.length}</span>
                </button>
                {STATUSES.map((status) => (
                    <button
                        key={status}
                        className={`admin-status-filter-btn ${statusFilter === status ? 'active' : ''}`}
                        onClick={() => setStatusFilter(status === statusFilter ? '' : status)}
                        style={{
                            '--status-color': STATUS_COLORS[status],
                        }}
                    >
                        <i className={`fa-solid ${STATUS_ICONS[status]}`} />
                        {status === 'OnDelivery' ? 'On Delivery' : status}
                        <span className="filter-count">{statusCounts[status] || 0}</span>
                    </button>
                ))}
            </div>

            {filteredOrders.length === 0 ? (
                <div className="admin-empty">
                    <i className="fa-solid fa-inbox" />
                    <p>{statusFilter ? `No ${statusFilter} orders` : 'No orders yet'}</p>
                </div>
            ) : (
                <>
                    <div className="admin-orders-list-desktop">
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Order</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Payment</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="order-number-cell">#{order.orderNumber || order.id}</td>
                                            <td>
                                                <div className="order-customer-cell">
                                                    <span>{order.deliveryInfo?.fullName || '—'}</span>
                                                    <small>{order.deliveryInfo?.phone || ''}</small>
                                                </div>
                                            </td>
                                            <td>{order.items?.length || 0}</td>
                                            <td className="order-total-cell">${order.total?.toFixed(2)}</td>
                                            <td>
                                                <span className="admin-payment-badge">{order.paymentMethod || '—'}</span>
                                            </td>
                                            <td>
                                                <select
                                                    className="admin-status-select"
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    disabled={updatingId === order.id}
                                                    style={{
                                                        color: STATUS_COLORS[order.status],
                                                        borderColor: `${STATUS_COLORS[order.status]}40`,
                                                    }}
                                                >
                                                    {STATUSES.map((s) => (
                                                        <option key={s} value={s}>
                                                            {s === 'OnDelivery' ? 'On Delivery' : s}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="order-date-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    className="admin-action-btn view"
                                                    onClick={() => handleViewDetails(order)}
                                                    title="View Details"
                                                >
                                                    <i className="fa-solid fa-eye" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="admin-orders-list-mobile">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="admin-order-card" onClick={() => handleViewDetails(order)}>
                                <div className="order-card-header">
                                    <span className="order-card-number">#{order.orderNumber || order.id}</span>
                                    <span
                                        className="admin-status-badge"
                                        style={{ background: `${STATUS_COLORS[order.status]}18`, color: STATUS_COLORS[order.status] }}
                                    >
                                        {order.status === 'OnDelivery' ? 'On Delivery' : order.status}
                                    </span>
                                </div>
                                <div className="order-card-body">
                                    <div className="order-card-row">
                                        <span className="order-card-label">Customer</span>
                                        <span>{order.deliveryInfo?.fullName || '—'}</span>
                                    </div>
                                    <div className="order-card-row">
                                        <span className="order-card-label">Total</span>
                                        <span className="order-card-total">${order.total?.toFixed(2)}</span>
                                    </div>
                                    <div className="order-card-row">
                                        <span className="order-card-label">Date</span>
                                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {selectedOrder && (
                <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-close" onClick={() => setSelectedOrder(null)}>
                            <i className="fa-solid fa-xmark" />
                        </div>

                        {detailLoading ? (
                            <div className="admin-loading" style={{ minHeight: 200 }}>
                                <div className="admin-loading-spinner" />
                            </div>
                        ) : (
                            <>
                                <div className="order-detail-header">
                                    <div>
                                        <h3>Order #{selectedOrder.orderNumber || selectedOrder.id}</h3>
                                        <span className="order-detail-date">
                                            {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <span
                                        className="admin-status-badge"
                                        style={{ background: `${STATUS_COLORS[selectedOrder.status]}18`, color: STATUS_COLORS[selectedOrder.status] }}
                                    >
                                        <i className={`fa-solid ${STATUS_ICONS[selectedOrder.status]}`} />
                                        {selectedOrder.status === 'OnDelivery' ? 'On Delivery' : selectedOrder.status}
                                    </span>
                                </div>

                                <div className="order-detail-section">
                                    <h4>Customer Information</h4>
                                    <div className="order-detail-info-grid">
                                        <div>
                                            <span className="info-label">Name</span>
                                            <span>{selectedOrder.deliveryInfo?.fullName || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="info-label">Phone</span>
                                            <span>{selectedOrder.deliveryInfo?.phone || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="info-label">Address</span>
                                            <span>{selectedOrder.deliveryInfo?.address || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="info-label">Payment</span>
                                            <span>{selectedOrder.paymentMethod || '—'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-detail-section">
                                    <h4>Order Items</h4>
                                    <div className="order-detail-items">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <div key={idx} className="order-detail-item">
                                                <div className="order-item-img">
                                                    <img src={item.pictureUrl || item.image} alt={item.name} />
                                                </div>
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
                                        <span>${selectedOrder.subtotal?.toFixed(2) || selectedOrder.total?.toFixed(2)}</span>
                                    </div>
                                    <div className="order-total-row total">
                                        <span>Total</span>
                                        <span>${selectedOrder.total?.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="order-detail-actions">
                                    <span className="order-detail-status-label">Update Status:</span>
                                    <div className="order-status-btns">
                                        {STATUSES.map((s) => (
                                            <button
                                                key={s}
                                                className={`admin-btn admin-btn-sm ${selectedOrder.status === s ? 'active' : ''}`}
                                                style={{
                                                    '--btn-color': STATUS_COLORS[s],
                                                    background: selectedOrder.status === s ? `${STATUS_COLORS[s]}25` : 'transparent',
                                                    color: selectedOrder.status === s ? STATUS_COLORS[s] : 'rgba(245,245,247,0.5)',
                                                    borderColor: selectedOrder.status === s ? `${STATUS_COLORS[s]}40` : 'rgba(255,255,255,0.08)',
                                                }}
                                                onClick={() => handleStatusChange(selectedOrder.id, s)}
                                                disabled={updatingId === selectedOrder.id}
                                            >
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

export default Orders;
