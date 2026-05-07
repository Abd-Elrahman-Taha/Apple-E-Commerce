import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import useStore from '../store/useStore';
import '../checkout.css';
import { formatPrice, parsePrice } from '../utils/storeData';

const Checkout = () => {
    const { cart, placeOrder, loadBasket } = useStore();
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);


    useEffect(() => {
        loadBasket().catch((error) => {
            console.error('Load basket error:', error);
        });

        const tl = gsap.timeline();
        tl.fromTo(".reveal-checkout",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
        );
    }, [loadBasket]);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }

        if (cart.length === 0) {
            navigate('/bag');
        }
    }, [cart.length, navigate]);


    const subtotal = cart.reduce((sum, item) => {
        const price = parsePrice(item.priceValue ?? item.price);
        return sum + (price * item.quantity);
    }, 0);
    const shipping = 0;
    const total = subtotal + shipping;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone Number is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (paymentMethod !== 'cod') newErrors.paymentMethod = 'Only cash on delivery is available right now';
        
        if (paymentMethod === 'card') {
            if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card Number is required';
            if (!formData.expiry.trim()) newErrors.expiry = 'Expiry Date is required';
            if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        
        if (validateForm()) {
            setSubmitting(true);

            try {
                const orderDetails = {
                    total,
                    paymentMethod: 'cod',
                    deliveryInfo: {
                        fullName: formData.fullName,
                        phone: formData.phone,
                        address: formData.address
                    }
                };
                
                await placeOrder(orderDetails);
                navigate('/tracking');
            } catch (error) {
                console.error('Checkout error:', error);
                setSubmitError(error.message || 'Failed to place order.');
            } finally {
                setSubmitting(false);
            }
        }
    };

    if (cart.length === 0) return null;

    return (
        <main className="checkout-page-wrapper">
            <div className="checkout-container">
                <h1 className="checkout-title reveal-checkout">Checkout</h1>
                
                <form onSubmit={handleSubmit} className="checkout-grid reveal-checkout">
                    <div className="checkout-forms">
                        <section className="checkout-section">
                            <h3>Delivery Information</h3>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="e.g. John Appleseed"
                                />
                                {errors.fullName && <div className="error-text">{errors.fullName}</div>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input 
                                    type="tel" 
                                    className="form-input" 
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="e.g. +1 234 567 890"
                                />
                                {errors.phone && <div className="error-text">{errors.phone}</div>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Shipping Address</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Street, City, State, ZIP"
                                />
                                {errors.address && <div className="error-text">{errors.address}</div>}
                            </div>
                        </section>

                        <section className="checkout-section">
                            <h3>Payment Method</h3>
                            <div className="payment-methods">
                                <label className={`payment-method-label ${paymentMethod === 'card' ? 'active' : ''}`}>
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="card"
                                        checked={paymentMethod === 'card'}
                                        onChange={() => setPaymentMethod('card')}
                                    />
                                    <span><i className="fa-regular fa-credit-card"></i> Credit / Debit Card</span>
                                </label>
                                <label className={`payment-method-label ${paymentMethod === 'cod' ? 'active' : ''}`}>
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                    />
                                    <span><i className="fa-solid fa-money-bill-wave"></i> Cash on Delivery</span>
                                </label>
                            </div>

                            {paymentMethod === 'card' && (
                                <div className="card-details">
                                    <div className="form-group">
                                        <label className="form-label">Card Number</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            name="cardNumber"
                                            value={formData.cardNumber}
                                            onChange={handleChange}
                                            placeholder="XXXX XXXX XXXX XXXX"
                                        />
                                        {errors.cardNumber && <div className="error-text">{errors.cardNumber}</div>}
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Expiry Date</label>
                                            <input 
                                                type="text" 
                                                className="form-input" 
                                                name="expiry"
                                                value={formData.expiry}
                                                onChange={handleChange}
                                                placeholder="MM/YY"
                                            />
                                            {errors.expiry && <div className="error-text">{errors.expiry}</div>}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">CVV</label>
                                            <input 
                                                type="text" 
                                                className="form-input" 
                                                name="cvv"
                                                value={formData.cvv}
                                                onChange={handleChange}
                                                placeholder="123"
                                                maxLength="4"
                                            />
                                            {errors.cvv && <div className="error-text">{errors.cvv}</div>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {errors.paymentMethod && <div className="error-text">{errors.paymentMethod}</div>}
                            {submitError && <div className="error-text">{submitError}</div>}
                        </section>
                    </div>

                    <div className="checkout-sidebar">
                        <div className="checkout-summary">
                            <h3>Order Summary</h3>
                            <div className="summary-items-mini">
                                {cart.map(item => (
                                    <div key={item.id} className="mini-cart-item">
                                        <div className="mini-item-img">
                                            <img src={item.image} alt={item.name} />
                                        </div>
                                        <div className="mini-item-info">
                                            <h4 className="mini-item-name">{item.name}</h4>
                                            <div className="mini-item-qty">Qty: {item.quantity}</div>
                                            <div className="mini-item-price">{formatPrice(item.priceValue ?? item.price)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            <button type="submit" className="btn-checkout" disabled={submitting}>
                                {submitting ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default Checkout;
