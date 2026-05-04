import React, { useEffect } from 'react';
import gsap from 'gsap';
import useStore from '../store/useStore';
import '../tracking.css';

const Tracking = () => {
    const { orders } = useStore();

    useEffect(() => {
        const tl = gsap.timeline();
        tl.fromTo(".tracking-title", 
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
        );
        tl.fromTo(".order-card", 
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
            "-=0.4"
        );
    }, [orders.length]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { 
            year: 'numeric', month: 'long', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        }).format(date);
    };

    const formatPrice = (num) => `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const getTimelineIndex = (status) => {
        switch(status) {
            case 'Pending': return 0;
            case 'Processing': return 1;
            case 'On Delivery': return 2;
            case 'Delivered': return 3;
            default: return 0;
        }
    };

    if (orders.length === 0) {
        return (
            <main className="tracking-page-wrapper">
                <div className="tracking-container" style={{ textAlign: 'center', paddingTop: '80px' }}>
                    <i className="fa-solid fa-box-open" style={{ fontSize: '64px', color: '#86868b', marginBottom: '24px' }}></i>
                    <h2>No orders found.</h2>
                    <p style={{ color: '#86868b' }}>When you place an order, it will appear here.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="tracking-page-wrapper">
            <div className="tracking-container">
                <h1 className="tracking-title">Your Orders</h1>
                
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <div>
                                    <h3 className="order-id">Order {order.id}</h3>
                                    <p className="order-date">Placed on {formatDate(order.date)}</p>
                                </div>
                                <div className={`order-status-badge status-${order.status.toLowerCase().replace(' ', '')}`}>
                                    {order.status}
                                </div>
                            </div>


                            <div className="order-timeline">
                                {['Pending', 'Processing', 'On Delivery', 'Delivered'].map((step, index) => {
                                    const currentIndex = getTimelineIndex(order.status);
                                    let stepClass = 'timeline-step';
                                    if (index < currentIndex) stepClass += ' completed';
                                    if (index === currentIndex) stepClass += ' active';

                                    const icons = [
                                        'fa-clipboard-list',
                                        'fa-box',
                                        'fa-truck',
                                        'fa-house-circle-check'
                                    ];

                                    return (
                                        <div key={step} className={stepClass}>
                                            <div className="step-icon">
                                                <i className={`fa-solid ${icons[index]}`}></i>
                                            </div>
                                            <div className="step-label">{step}</div>
                                        </div>
                                    );
                                })}
                            </div>


                            <div className="order-items-grid">
                                {order.items.map((item, index) => (
                                    <div key={`${item.id}-${index}`} className="order-item-card">
                                        <img src={item.image} alt={item.name} />
                                        <div className="order-item-details">
                                            <h4>{item.name}</h4>
                                            <p>Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>


                            <div className="order-footer">
                                <div className="delivery-info">
                                    <p><strong>Delivery to:</strong> {order.deliveryInfo.fullName}</p>
                                    <p>{order.deliveryInfo.address}</p>
                                    <p>{order.deliveryInfo.phone}</p>
                                </div>
                                <div className="order-total">
                                    <p>Payment: {order.paymentMethod === 'card' ? 'Credit Card' : 'Cash on Delivery'}</p>
                                    <h3>{formatPrice(order.total)}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default Tracking;
