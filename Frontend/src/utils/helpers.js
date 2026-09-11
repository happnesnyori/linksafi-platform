export const ROLE = {
    ORGANIZATION: 'organization',
    COMPANY: 'company',
    ADMIN: 'admin',
};

export const SERVICE_TYPE = {
    CLEANING: 'cleaning',
    DECORATION: 'decoration',
};

export const SERVICE_LABELS = {
    [SERVICE_TYPE.CLEANING]: 'Cleaning',
    [SERVICE_TYPE.DECORATION]: 'Decoration',
};

export const SERVICE_FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'cleaning', label: 'Cleaning' },
    { key: 'decoration', label: 'Decoration' },
    { key: 'both', label: 'Both' },
];

export const REQUEST_SERVICE_OPTIONS = [
    { key: 'cleaning', label: 'Cleaning' },
    { key: 'decoration', label: 'Decoration' },
    { key: 'both', label: 'Both' },
];

export const REQUEST_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
};

export const REQUEST_STATUS_LABELS = {
    [REQUEST_STATUS.PENDING]: 'Pending',
    [REQUEST_STATUS.ACCEPTED]: 'Accepted',
    [REQUEST_STATUS.REJECTED]: 'Rejected',
};

export const getServiceLabel = (serviceKey) => {
    if (Array.isArray(serviceKey)) {
        const labels = serviceKey.map((s) => SERVICE_LABELS[s] || s);
        return labels.join(' & ');
    }
    if (serviceKey === 'both') {
        return 'Cleaning & Decoration';
    }
    return SERVICE_LABELS[serviceKey] || serviceKey;
};

export const formatService = (serviceKey) => {
    if (serviceKey === 'both') {
        return 'Cleaning & Decoration';
    }
    return SERVICE_LABELS[serviceKey] || serviceKey;
};

export const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};
