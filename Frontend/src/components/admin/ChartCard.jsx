import { ChevronDown } from 'lucide-react';

const ChartCard = ({ title, subtitle, actions, children, className = '' }) => {
    return (
        <div className={`admin-chart-card ${className}`.trim()}>
            <div className="admin-chart-card-header">
                <div className="admin-chart-card-title">
                    <h3>{title}</h3>
                    {subtitle && <p>{subtitle}</p>}
                </div>
                {actions && <div className="admin-chart-card-actions">{actions}</div>}
            </div>
            <div className="admin-chart-card-body">{children}</div>
        </div>
    );
};

export const ChartToolbar = ({ options, value, onChange, compact = false }) => {
    if (!options || options.length === 0) return null;
    return (
        <div className={`admin-chart-toolbar ${compact ? 'compact' : ''}}`}>
            <button
                type="button"
                className="admin-chart-toolbar-trigger admin-btn admin-btn-ghost admin-btn-sm"
                onClick={(e) => e.preventDefault()}
            >
                <span>{options.find((o) => o.value === value)?.label || options[0]?.label}</span>
                <ChevronDown size={14} />
            </button>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    className={`admin-chart-toolbar-option admin-btn admin-btn-ghost admin-btn-sm ${value === option.value ? 'active' : ''}`}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

export default ChartCard;
