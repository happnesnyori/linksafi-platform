import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Sparkles,
    FileText,
    LogOut,
    X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMediaUrl } from '../../utils/helpers';

const NAV_ITEMS = [
    { to: '/company/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/company/profile', label: 'Profile', icon: Building2 },
    { to: '/company/services', label: 'Services', icon: Sparkles },
    { to: '/company/requests', label: 'Requests', icon: FileText },
];

export default function CompanySidebar({ company, pendingCount = 0, mobileOpen = false, onMobileClose }) {
    const location = useLocation();
    const { logout } = useAuth();

    const isActive = (to) => location.pathname === to || location.pathname.startsWith(`${to}/`);

    const handleLogout = () => {
        onMobileClose?.();
        logout();
    };

    const logoUrl = company?.logo ? getMediaUrl(company.logo) : '';
    const initial = (company?.name || 'C').charAt(0).toUpperCase();
    const status = company?.status || 'pending';

    return (
        <>
            <div className={`cp-sidebar-overlay ${mobileOpen ? 'open' : ''}`} onClick={onMobileClose} />
            <aside className={`cp-sidebar ${mobileOpen ? 'open' : ''}`}>
                <button type="button" className="cp-sidebar-close" onClick={onMobileClose} aria-label="Close menu">
                    <X size={18} />
                </button>

                <Link to="/company/overview" className="cp-sidebar-logo" onClick={onMobileClose}>
                    <span className="cp-sidebar-logo-icon">
                        <Sparkles size={17} color="#fff" />
                    </span>
                    <span className="cp-logo-word">SafiLink</span>
                </Link>

                <ul className="cp-nav">
                    {NAV_ITEMS.map((item) => (
                        <li key={item.to}>
                            <Link
                                to={item.to}
                                className={`cp-nav-link ${isActive(item.to) ? 'active' : ''}`}
                                onClick={onMobileClose}
                            >
                                <item.icon size={17} />
                                <span>{item.label}</span>
                                {item.to === '/company/requests' && pendingCount > 0 && (
                                    <span className="cp-nav-badge">{pendingCount}</span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="cp-sidebar-footer">
                    <div className="cp-mini-card">
                        <span className="cp-mini-avatar">
                            {logoUrl ? <img src={logoUrl} alt={company?.name || 'Company logo'} /> : initial}
                        </span>
                        <div className="cp-mini-info">
                            <div className="cp-mini-name" title={company?.name}>{company?.name || 'Your company'}</div>
                            <div className="cp-mini-status">
                                <span className={`cp-status-dot ${status}`} />
                                <span>{status}</span>
                            </div>
                        </div>
                    </div>
                    <button type="button" className="cp-logout-btn" onClick={handleLogout}>
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
