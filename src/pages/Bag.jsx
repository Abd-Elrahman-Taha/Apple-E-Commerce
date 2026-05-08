import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import useStore from '../store/useStore';
import useAuthStore from '../store/useAuthStore';
import '../bag.css';

const Bag = () => {
    const { cart, removeFromCart, updateQuantity } = useStore();
    const token = useAuthStore((state) => state.token);
    const navigate = useNavigate();


    useEffect(() => {
        const tl = gsap.timeline();
        tl.fromTo(".bag-title", 
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
        );
        tl.fromTo(".reveal-bag", 
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
            "-=0.4"
        );
    }, []);


  const subtotal = cart.reduce((sum, item) => {
    return sum + (Number(item.price) * item.quantity);
}, 0);
    const shipping = subtotal > 0 ? 0 : 0;
    const total = subtotal + shipping;

    const formatPrice = (num) => `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (cart.length === 0) {
        return (
            <main className="bag-page-wrapper">
                <div className="container">
                    <div className="bag-empty-state reveal-bag">
                        <i className="fa-solid fa-bag-shopping"></i>
                        <h2>Your bag is empty.</h2>
                        <p>Free delivery and free returns.</p>
                        <Link to="/store" className="btn btn-primary mt-4 px-4 py-2" style={{ borderRadius: '20px' }}>
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="bag-page-wrapper">
            <div className="container px-4 px-md-5">
                <div className="bag-header">
                    <h1 className="bag-title">Review your bag.</h1>
                    <p className="reveal-bag" style={{ color: '#86868b' }}>Free delivery and free returns.</p>
                </div>

                <div className="bag-content reveal-bag">
                    <div className="cart-items-list">
                        {cart.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-image">
                                    <img src={item.image} alt={item.name} />
                                </div>
                                <div className="cart-item-details">
                                    <div className="cart-item-header">
                                        <h3 className="cart-item-name">{item.name}</h3>
                                        <div className="cart-item-price">{item.price}</div>
                                    </div>
                                    <div className="cart-item-specs">
                                        {item.storage && <span>{item.storage}</span>}
                                        {item.color && <span> • {item.color}</span>}
                                    </div>
                                    
                                    <div className="cart-item-actions">
                                        <div className="quantity-selector">
                                            <button 
                                                className="btn-qty" 
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                <i className="fa-solid fa-minus" style={{ fontSize: '10px' }}></i>
                                            </button>
                                            <span className="qty-number">{item.quantity}</span>
                                            <button 
                                                className="btn-qty" 
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <i className="fa-solid fa-plus" style={{ fontSize: '10px' }}></i>
                                            </button>
                                        </div>
                                        <button 
                                            className="btn-remove"
                                            onClick={() => {
                                                if (window.confirm("Are you sure you want to remove this item?")) {
                                                    removeFromCart(item.id);
                                                }
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                        <button 
                            className="btn-checkout" 
                            onClick={() => {
                                if (!token) {
                                    navigate('/login?redirect=/checkout');
                                    return;
                                }
                                navigate('/checkout');
                            }}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Bag;
