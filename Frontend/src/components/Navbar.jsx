import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);
    const servicesRef = useRef(null);
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const activeService = location.pathname === '/companies'
        ? new URLSearchParams(location.search).get('service') || 'all'
        : null;

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const handleNavClick = () => {
        setMobileMenuOpen(false);
        setServicesOpen(false);
    };

    useEffect(() => {
        const closeServices = (event) => {
            if (servicesRef.current && !servicesRef.current.contains(event.target)) {
                setServicesOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setServicesOpen(false);
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', closeServices);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', closeServices);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="logo" onClick={handleNavClick}>
                    <div className="logo-icon-wrap">
                        <Sparkles size={18} className="logo-icon" />
                    </div>
                    Safi<span>Link</span>
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Navigation Links */}
                <div className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
                    <Link
                        to="/"
                        className={`nav-link ${isActive('/') ? 'active' : ''}`}
                        onClick={handleNavClick}
                    >
                        Home
                    </Link>
                    <div className={`nav-services ${servicesOpen ? 'open' : ''}`} ref={servicesRef}>
                        <button
                            type="button"
                            className={`nav-link nav-services-trigger ${location.pathname === '/companies' ? 'active' : ''}`}
                            aria-expanded={servicesOpen}
                            aria-haspopup="true"
                            onClick={() => setServicesOpen((open) => !open)}
                        >
                            Services
                            <ChevronDown size={16} className="nav-services-chevron" />
                        </button>
                        <div className="nav-services-menu">
                            {[
                                { id: 'all', label: 'All Services', to: '/companies' },
                                { id: 'cleaning', label: 'Cleaning', to: '/companies?service=cleaning' },
                                { id: 'decoration', label: 'Decoration', to: '/companies?service=decoration' },
                                { id: 'both', label: 'Both', to: '/companies?service=both' },
                            ].map((service) => (
                                <Link
                                    key={service.id}
                                    to={service.to}
                                    className={`nav-service-option ${activeService === service.id ? 'active' : ''}`}
                                    onClick={handleNavClick}
                                >
                                    {service.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <Link
                        to="/how-it-works"
                        className={`nav-link ${isActive('/how-it-works') ? 'active' : ''}`}
                        onClick={handleNavClick}
                    >
                        How It Works
                    </Link>

                    <div className="nav-divider"></div>

                    {isAuthenticated ? (
                        <div className="nav-auth-group">
                            <span className="user-name-badge">{user?.name || user?.email}</span>
                            {user?.role === 'organization' ? (
                                <Link
                                    to="/dashboard"
                                    className="nav-dash-link"
                                    onClick={handleNavClick}
                                >
                                    Dashboard
                                </Link>
                            ) : user?.role === 'admin' ? (
                                <Link
                                    to="/admin"
                                    className="nav-dash-link"
                                    onClick={handleNavClick}
                                >
                                    Admin
                                </Link>
                            ) : (
                                <Link
                                    to="/company/overview"
                                    className="nav-dash-link"
                                    onClick={handleNavClick}
                                >
                                    Dashboard
                                </Link>
                            )}
                            <button className="logout-button" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="nav-auth-group">
                            <Link
                                to="/login"
                                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                                onClick={handleNavClick}
                            >
                                Login
                            </Link>
                            <Link
                                to="/companies"
                                className="nav-pill-cta"
                                onClick={handleNavClick}
                            >
                                Find Companies
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
