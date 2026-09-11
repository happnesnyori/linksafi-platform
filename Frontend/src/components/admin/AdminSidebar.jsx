import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Users,
    FileText,
    Sparkles,
    LogOut,
    X,
    ChevronRight,
    ChevronDown,
    Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SidebarItem = ({ to, icon: Icon, label, isActive, children, onClick }) => (
    <Link
        to={to}
        className={`admin-nav-link ${isActive ? 'active' : ''}`}
        onClick={onClick}
    >
        {Icon && <Icon size={18} />}
        <span>{label}</span>
        {children}
    </Link>
);

const companiesSubItems = [
    { path: '/admin/companies', label: 'All Companies' },
    { path: '/admin/companies/pending', label: 'Pending Approvals' },
    { path: '/admin/companies/approved', label: 'Approved Companies' },
    { path: '/admin/companies/add', label: 'Add Company' },
];

const mainNavItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    {
        key: 'companies-group',
        label: 'Companies',
        icon: Building2,
        children: companiesSubItems,
    },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/requests', label: 'Service Requests', icon: FileText },
    { path: '/admin/reviews', label: 'Reviews', icon: Star },
];

const AdminSidebar = ({ pendingCount = 0, mobileOpen = false, onMobileClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [openGroups, setOpenGroups] = useState({ 'companies-group': true });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleGroup = (key) => {
        setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const isActivePath = (to, exact = false) => {
        if (exact) return location.pathname === to;
        return location.pathname === to || location.pathname.startsWith(to + '/');
    };

    const isCompaniesGroupActive = () =>
        location.pathname === '/admin/companies' ||
        location.pathname.startsWith('/admin/companies/');

    const renderNavItem = (item) => {
        if (item.children) {
            const isOpen = openGroups[item.key];
            const active = isCompaniesGroupActive();
            return (
                <li key={item.key} className="admin-nav-item">
                    <button
                        type="button"
                        className={`admin-nav-group-toggle ${active ? 'active' : ''}`}
                        onClick={() => toggleGroup(item.key)}
                    >
                        {item.icon && <item.icon size={18} />}
                        <span>{item.label}</span>
                        <span className="admin-nav-chevron">
                            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </span>
                    </button>
                    {isOpen && (
                        <ul className="admin-nav-submenu">
                            {item.children.map((child) => {
                                const isPending = child.path === '/admin/companies/pending';
                                return (
                                    <li key={child.path}>
                                        <SidebarItem
                                            to={child.path}
                                            label={child.label}
                                            isActive={isActivePath(child.path)}
                                            onClick={onMobileClose}
                                        >
                                            {isPending && pendingCount > 0 && (
                                                <span className="admin-nav-badge">{pendingCount}</span>
                                            )}
                                        </SidebarItem>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </li>
            );
        }

        return (
            <li key={item.path} className="admin-nav-item">
                <SidebarItem
                    to={item.path}
                    icon={item.icon}
                    label={item.label}
                    isActive={isActivePath(item.path, item.exact)}
                    onClick={onMobileClose}
                />
            </li>
        );
    };

    return (
        <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
            <button
                type="button"
                className="admin-sidebar-close"
                onClick={onMobileClose}
                aria-label="Close sidebar"
            >
                <X size={20} />
            </button>

            <div className="admin-sidebar-header">
                <Link to="/admin" className="admin-logo" onClick={onMobileClose}>
                    <div className="admin-logo-icon">
                        <Sparkles size={20} />
                    </div>
                    <div className="admin-logo-text">
                        <span>Link</span>
                        <span>Safi</span>
                        <small>Admin Panel</small>
                    </div>
                </Link>
            </div>

            <nav className="admin-nav" role="navigation">
                <ul className="admin-nav-list">
                    {mainNavItems.map(renderNavItem)}
                </ul>
            </nav>

            <div className="admin-sidebar-footer">
                <div className="admin-user-info">
                    <div className="admin-avatar">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                    </div>
                    <div className="admin-user-details">
                        <span className="admin-user-name">{user?.name || 'Admin'}</span>
                        <span className="admin-user-role">System Administrator</span>
                    </div>
                </div>
                <button className="admin-logout-btn" onClick={handleLogout} title="Logout" aria-label="Logout">
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
