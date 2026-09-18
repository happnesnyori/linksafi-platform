import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Bell, MessageCircle, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function OrganizationTopNav({ pendingUpdatesCount = 0 }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;
    const initial = (user?.name || user?.email || 'O').charAt(0).toUpperCase();

    return (
        <header className="org-topnav">
            <div className="org-topnav-inner">
                <Link to="/organization/browse" className="org-topnav-logo">
                    <span className="org-topnav-logo-icon"><Sparkles size={16} /></span>
                    <span>SafiLink</span>
                </Link>

                <nav className="org-topnav-links" aria-label="Primary">
                    <Link
                        to="/organization/browse"
                        className={`org-topnav-link ${isActive('/organization/browse') ? 'active' : ''}`}
                    >
                        Browse Companies
                    </Link>
                    <Link
                        to="/requests"
                        className={`org-topnav-link ${isActive('/requests') ? 'active' : ''}`}
                    >
                        My Requests
                    </Link>
                    <span className="org-topnav-link disabled" title="Messaging is coming soon">
                        <MessageCircle size={14} /> Messages
                    </span>
                </nav>

                <div className="org-topnav-right">
                    <button
                        type="button"
                        className="org-topnav-icon-btn"
                        aria-label="Notifications"
                        onClick={() => navigate('/requests')}
                        title={pendingUpdatesCount > 0 ? `${pendingUpdatesCount} request update(s)` : 'No new updates'}
                    >
                        <Bell size={17} />
                        {pendingUpdatesCount > 0 && <span className="org-topnav-dot" />}
                    </button>

                    <div className="org-topnav-menu" ref={menuRef}>
                        <button
                            type="button"
                            className="org-topnav-avatar"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-haspopup="true"
                            aria-expanded={menuOpen}
                        >
                            {initial}
                        </button>
                        {menuOpen && (
                            <div className="org-topnav-dropdown">
                                <button className="org-topnav-dropdown-item" onClick={() => { setMenuOpen(false); navigate('/profile'); }}>
                                    <User size={14} /> Profile
                                </button>
                                <button className="org-topnav-dropdown-item danger" onClick={handleLogout}>
                                    <LogOut size={14} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
