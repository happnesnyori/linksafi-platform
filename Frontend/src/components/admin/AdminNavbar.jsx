import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, Settings, LogOut, Menu, Home, ExternalLink } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminNavbar = ({ onSearch, pendingApprovals = 0 }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const searchTimeout = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            if (onSearch) onSearch(value);
        }, 400);
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const handleProfileUpdate = () => {
        setProfileOpen(false);
        navigate('/admin/settings');
    };

    const adminName = user?.name || user?.email || 'Admin';

    const getBreadcrumb = (pathname) => {
        if (pathname === '/admin') return { section: null, title: 'Dashboard' };
        if (pathname === '/admin/companies/pending') return { section: 'Companies', title: 'Pending Approvals' };
        if (pathname === '/admin/companies/approved') return { section: 'Companies', title: 'Approved Companies' };
        if (pathname === '/admin/companies/new') return { section: 'Companies', title: 'Add Company' };
        if (pathname.startsWith('/admin/companies')) return { section: 'Companies', title: 'All Companies' };
        if (pathname.startsWith('/admin/organizations')) return { section: null, title: 'Organizations' };
        if (pathname.startsWith('/admin/requests')) return { section: null, title: 'Service Requests' };
        if (pathname.startsWith('/admin/settings')) return { section: null, title: 'Platform Settings' };
        if (pathname.startsWith('/admin/reviews')) return { section: null, title: 'Reviews' };
        return { section: null, title: 'Admin workspace' };
    };

    const { section, title: pageTitle } = getBreadcrumb(location.pathname);
    const breadcrumbText = ['SafiLink', 'Admin', section, pageTitle].filter(Boolean).join(' / ');

    return (
        <header className="admin-navbar">
            <div className="admin-navbar-left">
                <button
                    type="button"
                    className="admin-nav-mobile-toggle"
                    aria-label="Toggle navigation"
                    onClick={() => {
                        const event = new Event('toggle-sidebar');
                        window.dispatchEvent(event);
                    }}
                >
                    <Menu size={20} />
                </button>

                <Link to="/" className="admin-home-link" title="View Site" target="_blank">
                    <Home size={18} />
                    <span>View Site</span>
                    <ExternalLink size={12} />
                </Link>

                <div className="admin-navbar-heading">
                    <span className="admin-navbar-kicker">{breadcrumbText}</span>
                    <strong>{pageTitle}</strong>
                </div>
                <form
                    className="admin-search-field"
                    role="search"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (onSearch) onSearch(searchTerm);
                    }}
                >
                    <Search size={16} className="admin-search-icon" />
                    <input
                        type="search"
                        placeholder="Search companies, customers, requests..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </form>
            </div>

            <div className="admin-navbar-right">
                <button
                    type="button"
                    className="admin-refresh-button"
                    onClick={() => window.dispatchEvent(new Event('refresh-admin-dashboard'))}
                >
                    <span>Refresh</span>
                </button>
                <button
                    type="button"
                    className={`admin-nav-button admin-nav-button--bell ${pendingApprovals > 0 ? 'has-alert' : ''}`}
                    aria-label="Notifications"
                    onClick={() => navigate('/admin/companies/pending')}
                    title="Pending approvals"
                >
                    <Bell size={18} />
                    {pendingApprovals > 0 && (
                        <span className="admin-nav-alert">{pendingApprovals}</span>
                    )}
                </button>

                <div className="admin-profile" ref={profileRef}>
                    <button
                        type="button"
                        className="admin-profile-trigger"
                        onClick={() => setProfileOpen((open) => !open)}
                        aria-haspopup="true"
                        aria-expanded={profileOpen}
                    >
                        <div className="admin-profile-avatar">
                            {adminName?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="admin-profile-info">
                            <span className="admin-profile-name">{adminName}</span>
                            <span className="admin-profile-role">System Administrator</span>
                        </div>
                    </button>
                    {profileOpen && (
                        <div className="admin-profile-dropdown">
                            <button className="admin-dropdown-item" onClick={handleProfileUpdate}>
                                <User size={14} />
                                <span>Profile</span>
                            </button>
                            <button className="admin-dropdown-item" onClick={() => { setProfileOpen(false); navigate('/admin/settings'); }}>
                                <Settings size={14} />
                                <span>Settings</span>
                            </button>
                            <div className="admin-dropdown-divider" />
                            <button className="admin-dropdown-item admin-dropdown-item--danger" onClick={handleLogout}>
                                <LogOut size={14} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminNavbar;
