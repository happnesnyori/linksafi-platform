import {
    UserCheck,
    Building2,
    Users,
    FileText,
    Star,
    Shield,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
} from 'lucide-react';

const ACTIVITY_ICONS = {
    approve: UserCheck,
    add: Building2,
    register: Building2,
    create: FileText,
    complete: CheckCircle,
    accept: CheckCircle,
    reject: XCircle,
    suspend: Clock,
    deactivate: AlertCircle,
    activate: Shield,
    review: Star,
    default: FileText,
};

const ACTIVITY_COLORS = {
    approve: '#10b981',
    add: '#0d9488',
    register: '#0d9488',
    create: '#2563eb',
    complete: '#10b981',
    accept: '#10b981',
    reject: '#ef4444',
    suspend: '#f59e0b',
    deactivate: '#ef4444',
    activate: '#10b981',
    review: '#2563eb',
    default: '#64748b',
};

const timeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.round(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    const weeks = Math.round(days / 7);
    if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const ActivityItem = ({ activity }) => {
    const iconType = activity.icon_type || activity.action || 'default';
    const Icon = ACTIVITY_ICONS[iconType] || ACTIVITY_ICONS.default;
    const iconColor = ACTIVITY_COLORS[iconType] || ACTIVITY_COLORS.default;
    const iconBg = `${iconColor}14`;

    return (
        <li className="admin-activity-item">
            <div className="admin-activity-icon" style={{ background: iconBg, color: iconColor }}>
                <Icon size={16} />
            </div>
            <div className="admin-activity-content">
                <p className="admin-activity-description">
                    {activity.description || activity.message || activity.title}
                </p>
                {activity.user && (
                    <span className="admin-activity-user">{activity.user}</span>
                )}
                <time className="admin-activity-time">{timeAgo(activity.created_at)}</time>
            </div>
        </li>
    );
};

export default ActivityItem;
