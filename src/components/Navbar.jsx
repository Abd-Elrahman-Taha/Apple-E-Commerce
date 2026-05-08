import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import useAuthStore from '../store/useAuthStore';
import '../navbar.css';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const lightThemePages = ['/store', '/bag', '/checkout', '/tracking', '/profile'];
    const isLightTheme = lightThemePages.includes(location.pathname);
    const { cart } = useStore();
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    const logout = useAuthStore((state) => state.logout);
    const isLoggedIn = !!token;

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        setDropdownOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownOpen]);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate('/');
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <nav className={`navbar navbar-expand-lg ${isLightTheme ? 'navbar-light' : 'navbar-dark'} fixed-top ${isLightTheme ? 'apple-nav-light' : 'apple-nav'}`}>
            <div className="container-fluid px-4 px-md-5">
                <Link className="navbar-brand nav-icon" to="/">
                    <i className="fa-brands fa-apple"></i>
                </Link>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse justify-content-center" id="navbarSupportedContent">
                    <ul className="navbar-nav mb-2 mb-lg-0 gap-4">
                        <li className="nav-item"><Link className="nav-link" to="/store">Store</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/mac">Mac</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/ipad">iPad</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/iphone">iPhone</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/watch">Watch</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/airpods">AirPods</Link></li>

                        <li className="nav-item d-lg-none">
                            <Link className={`nav-link ${location.pathname === '/bag' ? 'active' : ''}`} to="/bag">
                                Bag {cartCount > 0 && `(${cartCount})`}
                            </Link>
                        </li>

                        {isLoggedIn ? (
                            <>
                                <li className="nav-item d-lg-none">
                                    <Link className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`} to="/profile">
                                        <span className="mobile-auth-item">
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt="" className="nav-avatar" style={{ width: 24, height: 24 }} />
                                            ) : (
                                                <span className="nav-avatar-placeholder">{getInitials(user?.name)}</span>
                                            )}
                                            Profile
                                        </span>
                                    </Link>
                                </li>
                                <li className="nav-item d-lg-none">
                                    <Link className={`nav-link ${location.pathname === '/tracking' ? 'active' : ''}`} to="/tracking">Orders</Link>
                                </li>
                                <li className="nav-item d-lg-none">
                                    <button className="nav-link btn btn-link p-0" onClick={handleLogout} style={{ textDecoration: 'none' }}>
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item d-lg-none">
                                <Link className="nav-link" to="/login">Sign In</Link>
                            </li>
                        )}
                    </ul>
                </div>

                <div className="d-none d-lg-flex align-items-center gap-4">
                    <Link className="nav-icon position-relative" to="/bag" style={{ position: 'relative', opacity: location.pathname === '/bag' ? 1 : undefined }}>
                        <i className="fa-solid fa-bag-shopping"></i>
                        {cartCount > 0 && (
                            <span className="cart-badge" style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-8px',
                                background: '#0071e3',
                                color: 'white',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                borderRadius: '50%',
                                width: '16px',
                                height: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {isLoggedIn ? (
                        <div className="nav-user-section" ref={dropdownRef}>
                            <button
                                className="nav-avatar-btn"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                aria-label="User menu"
                            >
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user?.name} className="nav-avatar" />
                                ) : (
                                    <span className="nav-avatar-placeholder">{getInitials(user?.name)}</span>
                                )}
                                <span className="nav-user-name">{user?.name?.split(' ')[0] || 'Account'}</span>
                            </button>

                            <div className={`nav-dropdown ${dropdownOpen ? 'open' : ''}`}>
                                <div className="nav-dropdown-header">
                                    <p className="dropdown-name">{user?.name || 'User'}</p>
                                    <p className="dropdown-email">{user?.email || ''}</p>
                                </div>

                                <Link to="/profile" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                                    <i className="fa-solid fa-user"></i>
                                    Profile
                                </Link>
                                <Link to="/tracking" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                                    <i className="fa-solid fa-box-open"></i>
                                    Orders
                                </Link>

                                <div className="nav-dropdown-divider"></div>

                                <button className="nav-dropdown-item logout-item" onClick={handleLogout}>
                                    <i className="fa-solid fa-right-from-bracket"></i>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link className="nav-signin-btn" to="/login">
                            <i className="fa-solid fa-circle-user"></i>
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

