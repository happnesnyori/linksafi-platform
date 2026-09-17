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

// Derive a short city/area string from a company's full location.
// e.g. "Dar es Salaam (UDSM, Ardhi, IFM zones)" -> "Dar es Salaam"
export const getCompanyCity = (company) => {
    if (company?.city) return company.city;
    const location = company?.location;
    if (!location) return '';
    return String(location).split('(')[0].split('&')[0].split(',')[0].trim();
};

// Return the full detailed location (all zones/branches).
export const getCompanyFullLocation = (company) => {
    if (company?.fullLocation) return company.fullLocation;
    return company?.location || '';
};

// Primary service tag/category as a single label.
export const getCompanyTag = (company) => {
    if (company?.tag) return company.tag;
    const services = company?.services;
    if (Array.isArray(services) && services.length) {
        return services.includes('both') ? 'Cleaning & Decoration' : formatService(services[0]);
    }
    if (company?.service) {
        return formatService(company.service);
    }
    return 'Service Provider';
};

// Bulleted capabilities list.
export const getCompanyCapabilities = (company) => {
    if (Array.isArray(company?.capabilities)) return company.capabilities;
    if (Array.isArray(company?.specialties)) return company.specialties;
    return [];
};

// Normalize any company shape (mock or API) into the listing data contract.
export const normalizeCompany = (company) => {
    if (!company) return null;
    return {
        ...company,
        city: getCompanyCity(company),
        fullLocation: getCompanyFullLocation(company),
        tag: getCompanyTag(company),
        capabilities: getCompanyCapabilities(company),
        rating: company.rating ?? 4.9,
        reviewCount: company.reviewsCount ?? company.reviewCount ?? 0,
        verified: company.verified !== false,
        turnaroundTime: company.turnoverSpeed || company.turnaroundTime || '24-48 hours',
        thumbnailUrl: company.logo || company.thumbnailUrl || company.thumbnail,
    };
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
