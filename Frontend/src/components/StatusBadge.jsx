export default function StatusBadge({ status }) {
    const statusLabelMap = {
        pending: 'Pending',
        accepted: 'Accepted',
        rejected: 'Rejected',
        completed: 'Completed',
    };

    const statusColorMap = {
        pending: '#f59e0b',
        accepted: '#10b981',
        rejected: '#ef4444',
        completed: '#3b82f6',
    };

    const statusBgMap = {
        pending: '#fef3c7',
        accepted: '#d1fae5',
        rejected: '#fee2e2',
        completed: '#dbeafe',
    };

    const label = statusLabelMap[status] || status;
    const color = statusColorMap[status] || '#6b7280';
    const bgColor = statusBgMap[status] || '#f3f4f6';

    return (
        <span
            className="status-badge"
            style={{
                backgroundColor: bgColor,
                color: color,
                borderColor: color,
            }}
        >
            {label}
        </span>
    );
}
