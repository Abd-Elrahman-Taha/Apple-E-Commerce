import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    const isStore = location.pathname === '/store';

    return (
        <nav className={`navbar navbar-expand-lg ${isStore ? 'navbar-light' : 'navbar-dark'} fixed-top ${isStore ? 'apple-nav-light' : 'apple-nav'}`}>
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
                        
                        {/* Mobile-only nav items */}
                        <li className="nav-item d-lg-none"><Link className="nav-link" to="/bag">Bag</Link></li>
                        <li className="nav-item d-lg-none"><Link className="nav-link" to="/login">Login</Link></li>
                    </ul>
                </div>

                <div className="d-none d-lg-flex align-items-center gap-4">
                  
                    <Link className="nav-icon" to="/bag">
                        <i className="fa-solid fa-bag-shopping"></i>
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
