import { Link, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';

const Navbar = () => {
    const location = useLocation();
    const lightThemePages = ['/store', '/bag', '/checkout', '/tracking'];
    const isLightTheme = lightThemePages.includes(location.pathname);
    const { cart } = useStore();
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

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
                        

                        <li className="nav-item d-lg-none"><Link className={`nav-link ${location.pathname === '/bag' ? 'active' : ''}`} to="/bag">Bag {cartCount > 0 && `(${cartCount})`}</Link></li>
                        <li className="nav-item d-lg-none"><Link className={`nav-link ${location.pathname === '/tracking' ? 'active' : ''}`} to="/tracking">Orders</Link></li>
                        <li className="nav-item d-lg-none"><Link className="nav-link" to="/login">Login</Link></li>
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
                    <Link className="nav-icon" to="/tracking" title="Orders" style={{ opacity: location.pathname === '/tracking' ? 1 : undefined }}>
                        <i className="fa-solid fa-box-open"></i>
                    </Link>
                    <Link className="nav-icon" to="/login">
                        <i className="fa-solid fa-circle-user"></i>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
