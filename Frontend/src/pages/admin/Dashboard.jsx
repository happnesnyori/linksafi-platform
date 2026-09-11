import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    Users,
    FileText,
    Star,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw,
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    Eye,
    Ban,
    UserCheck,
    Shield,
    Star as StarIcon,
    ThumbsUp,
    ThumbsDown,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useToast } from '../../components/Toast';
import adminService from '../../services/adminService';
import '../../styles/admin.css';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="admin-stat-card">
        <div className="admin-stat-icon" style={{ background: color }}>
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
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { addToast } = useToast();

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await adminService.getDashboardStats();
            setStats(data);
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
                <button className="btn btn-secondary" onClick={loadStats}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            <div className="admin-stats-grid">
                <StatCard
                    title="Total Companies"
                    value={stats.total_companies}
                    icon={Building2}
                    color="#0d9488"
                    subtitle={`${stats.approved_companies} approved`}
                />
                <StatCard
                    title="Pending Companies"
                    value={stats.pending_companies}
                    icon={Clock}
                    color="#f59e0b"
                    subtitle="Awaiting review"
                />
                <StatCard
                    title="Suspended Companies"
                    value={stats.suspended_companies}
                    icon={Ban}
                    color="#ef4444"
                    subtitle="Temporarily inactive"
                />
                <StatCard
                    title="Total Customers"
                    value={stats.total_customers}
                    icon={Users}
                    color="#2563eb"
                    subtitle={`${stats.total_organizations} orgs, ${stats.total_company_users} companies`}
                />
                <StatCard
                    title="Total Service Requests"
                    value={stats.total_service_requests}
                    icon={FileText}
                    color="#8b5cf6"
                    subtitle="All time"
                />
                <StatCard
                    title="Pending Requests"
                    value={stats.pending_requests}
                    icon={AlertCircle}
                    color="#f59e0b"
                    subtitle="Awaiting company response"
                />
                <StatCard
                    title="Completed Requests"
                    value={stats.completed_requests}
                    icon={CheckCircle}
                    color="#10b981"
                    subtitle="Successfully finished"
                />
                <StatCard
                    title="Rejected Requests"
                    value={stats.rejected_requests}
                    icon={XCircle}
                    color="#ef4444"
                    subtitle="Declined by companies"
                />
            </div>

            <div className="admin-quick-actions">
                <h2>Quick Actions</h2>
                <div className="admin-quick-actions-grid">
                    <button className="admin-quick-action" onClick={() => navigate('/admin/companies?status=pending')}>
                        <Clock size={28} />
                        <span>Review Pending Companies</span>
                        <small>{stats.pending_companies} awaiting approval</small>
                    </button>
                    <button className="admin-quick-action" onClick={() => navigate('/admin/requests?status=pending')}>
                        <AlertCircle size={28} />
                        <span>Review Pending Requests</span>
                        <small>{stats.pending_requests} pending</small>
                    </button>
                    <button className="admin-quick-action" onClick={() => navigate('/admin/companies')}>
                        <Building2 size={28} />
                        <span>Manage Companies</span>
                        <small>View all companies</small>
                    </button>
                    <button className="admin-quick-action" onClick={() => navigate('/admin/customers')}>
                        <Users size={28} />
                        <span>Manage Customers</span>
                        <small>View all users</small>
                    </button>
                </div>
            </div>
        </div>
    );
}