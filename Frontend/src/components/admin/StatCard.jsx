import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
    title,
    value,
    icon: Icon,
    color = '#0d9488',
    subtitle,
    change,
    changeLabel,
}) => {
    const isPositive = change >= 0;
    const changeColor = isPositive ? '#10b981' : '#ef4444';

    return (
        <div className="admin-stat-card">
            <div
                className="admin-stat-icon"
                style={{
                    background: `color-mix(in srgb, ${color} 15%, transparent)`,
                    color,
                }}
            >
                <Icon size={22} />
            </div>
            <div className="admin-stat-content">
                <span className="admin-stat-value">{value}</span>
                <span className="admin-stat-title">{title}</span>
                {subtitle && <span className="admin-stat-subtitle">{subtitle}</span>}
                {change !== undefined && change !== null && (
                    <div className="admin-stat-change" style={{ color: changeColor }}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{Math.abs(change)}%</span>
                        {changeLabel && <span className="admin-stat-change-label">{changeLabel}</span>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
