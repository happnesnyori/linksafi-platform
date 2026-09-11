import React from 'react';

const STATUS_CONFIG = {
    pending: { label: 'Pending', bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
    accepted: { label: 'Accepted', bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
    rejected: { label: 'Rejected', bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
    completed: { label: 'Completed', bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
    cancelled: { label: 'Cancelled', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
    in_progress: { label: 'In Progress', bg: '#ede9fe', color: '#4338a1', border: '#c7b2fe' },
    draft: { label: 'Draft', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
};

const AdminStatusBadge = ({ status, size = 'md' }) => {
    const key = (status || 'pending').toLowerCase();
    const config = STATUS_CONFIG[key] || STATUS_CONFIG.pending;
    const cls = `admin-request-badge admin-request-badge--${size}`;

    return (
        <span
            className={cls}
            style={{
                backgroundColor: config.bg,
                color: config.color,
                borderColor: config.border,
            }}
        >
            {config.label}
        </span>
    );
};

export default AdminStatusBadge;
