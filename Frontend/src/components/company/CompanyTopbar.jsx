import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { getMediaUrl } from '../../utils/helpers';

const PAGE_COPY = {
    '/company/overview': {
        title: 'Overview',
        subtitle: 'A snapshot of your requests, profile, and services',
    },
    '/company/profile': {
        title: 'Company Profile',
        subtitle: 'How organizations see your company',
    },
    '/company/services': {
        title: 'Services',
        subtitle: 'Manage the services you offer',
    },
    '/company/requests': {
        title: 'Service Requests',
        subtitle: 'Requests organizations have sent to you',
    },
};

export default function CompanyTopbar({ company, pendingCount = 0, onMobileMenu }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const copy = PAGE_COPY[location.pathname] || { title: 'Company Dashboard', subtitle: '' };
    const logoUrl = company?.logo ? getMediaUrl(company.logo) : '';
    const initial = (company?.name || 'C').charAt(0).toUpperCase();

    return (
        <header className="cp-topbar">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <button type="button" className="cp-topbar-mobile-toggle" onClick={onMobileMenu} aria-label="Open menu">
                    <Menu size={20} />
                </button>
                <div className="cp-topbar-title">
                    <h1>{copy.title}</h1>
                    {copy.subtitle && <p>{copy.subtitle}</p>}
                </div>
            </div>

            <div className="cp-topbar-right">
                <div style={{ position: 'relative' }} ref={notifRef}>
                    <button
                        type="button"
                        className="cp-icon-btn"
                        aria-label="Notifications"
                        onClick={() => setNotifOpen((open) => !open)}
                    >
                        <Bell size={17} />
                        {pendingCount > 0 && <span className="cp-icon-btn-dot" />}
                    </button>
                    <div className={`cp-notif-dropdown ${notifOpen ? 'open' : ''}`}>
                        {pendingCount > 0 ? (
                            <div
                                className="cp-notif-item"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    setNotifOpen(false);
                                    navigate('/company/requests');
                                }}
                            >
                                <strong>{pendingCount} new request{pendingCount === 1 ? '' : 's'}</strong>
                                <span>Awaiting your response</span>
                            </div>
                        ) : (
                            <div className="cp-notif-empty">No new notifications</div>
                        )}
                    </div>
                </div>

                <span className="cp-avatar">
                    {logoUrl ? <img src={logoUrl} alt={company?.name || 'Company avatar'} /> : initial}
                </span>
            </div>
        </header>
    );
}
