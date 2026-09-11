import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    Users,
    FileText,
    Clock,
    AlertCircle,
    Eye,
    ArrowUpRight,
} from 'lucide-react';
import { useToast } from '../../components/Toast';
import adminService from '../../services/adminService';
import '../../styles/admin.css';

const StatCard = ({ title, value, icon: Icon, tone, subtitle }) => (
    <div className={`admin-stat-card admin-stat-card--${tone}`}>
        <div className="admin-stat-icon">
            <Icon size={22} />
        </div>
        <div className="admin-stat-content">
            <span className="admin-stat-value">{value}</span>
            <span className="admin-stat-title">{title}</span>
            {subtitle && <span className="admin-stat-subtitle">{subtitle}</span>}
        </div>
    </div>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [pendingCompanies, setPendingCompanies] = useState([]);
    const [sortDirection, setSortDirection] = useState('desc');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { addToast } = useToast();

    useEffect(() => {
        loadDashboard();
        const refreshHandler = () => loadDashboard();
        window.addEventListener('refresh-admin-dashboard', refreshHandler);
        return () => window.removeEventListener('refresh-admin-dashboard', refreshHandler);
    }, []);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const [dashboardStats, companiesResponse] = await Promise.all([
                adminService.getDashboardStats(),
                adminService.getCompanies({ status: 'pending' }, 1, 5),
            ]);
            setStats(dashboardStats);
            setPendingCompanies(companiesResponse?.results || companiesResponse || []);
        } catch (err) {
            addToast('Failed to load dashboard stats', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-loading"><div className="spinner" /></div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Dashboard Overview</h1>
                    <p className="admin-page-subtitle">Monitor and manage the LinkSafi platform</p>
                </div>
                <span className="admin-page-context">Today&apos;s platform snapshot</span>
            </div>

            <div className="admin-stats-grid">
                <StatCard
                    title="Total Companies"
                    value={stats.total_companies}
                    icon={Building2}
                    tone="teal"
                    subtitle={`${stats.approved_companies} approved`}
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats.pending_companies}
                    icon={Clock}
                    tone="orange"
                    subtitle="Awaiting review"
                />
                <StatCard
                    title="Active Customers"
                    value={stats.total_organizations}
                    icon={Users}
                    tone="blue"
                    subtitle="Organizations on LinkSafi"
                />
                <StatCard
                    title="Open Service Requests"
                    value={stats.pending_requests}
                    icon={FileText}
                    tone="navy"
                    subtitle="Awaiting company response"
                />
            </div>

            <section className="admin-dashboard-section">
                <div className="admin-section-heading">
                    <div>
                        <span className="admin-section-eyebrow">Needs attention</span>
                        <h2>Pending approvals</h2>
                    </div>
                    <button className="admin-text-button" onClick={() => navigate('/admin/companies?status=pending')}>
                        View all <ArrowUpRight size={16} />
                    </button>
                </div>
                <div className="admin-table-container">
                    <table className="admin-table admin-dashboard-table">
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Location</th>
                                <th>
                                    <button className="admin-sort-button" onClick={() => setSortDirection((value) => value === 'desc' ? 'asc' : 'desc')}>
                                        Submitted <span>{sortDirection === 'desc' ? '↓' : '↑'}</span>
                                    </button>
                                </th>
                                <th>Status</th>
                                <th aria-label="Actions" />
                            </tr>
                        </thead>
                        <tbody>
                            {pendingCompanies.length === 0 ? (
                                <tr><td colSpan="5" className="admin-dashboard-empty">No companies are waiting for approval.</td></tr>
                            ) : [...pendingCompanies].sort((a, b) => {
                                const first = new Date(a.created_at || 0).getTime();
                                const second = new Date(b.created_at || 0).getTime();
                                return sortDirection === 'desc' ? second - first : first - second;
                            }).map((company) => (
                                <tr key={company.id}>
                                    <td><strong className="admin-table-cell-primary">{company.name}</strong><span className="admin-table-cell-muted">{company.email || company.owner_email || 'No email'}</span></td>
                                    <td>{company.location || 'Not provided'}</td>
                                    <td>{company.created_at ? new Date(company.created_at).toLocaleDateString() : 'Recently'}</td>
                                    <td><span className="admin-status-badge admin-badge-pending">Pending</span></td>
                                    <td><button className="admin-icon-button" onClick={() => navigate(`/admin/companies/${company.id}`)} aria-label={`View ${company.name}`}><Eye size={16} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="admin-dashboard-links">
                <button onClick={() => navigate('/admin/requests?status=pending')}><AlertCircle size={18} /><span>Review pending requests</span><ArrowUpRight size={15} /></button>
                <button onClick={() => navigate('/admin/companies')}><Building2 size={18} /><span>Manage all companies</span><ArrowUpRight size={15} /></button>
                <button onClick={() => navigate('/admin/customers')}><Users size={18} /><span>View customer directory</span><ArrowUpRight size={15} /></button>
            </div>
        </div>
    );
}