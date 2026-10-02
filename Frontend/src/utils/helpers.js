export const ROLE = Object.freeze({
    ADMIN: 'admin',
    COMPANY: 'company',
    ORGANIZATION: 'organization',
});

export const SERVICE_FILTERS = [
    { value: '', label: 'All Services' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'decoration', label: 'Decoration' },
    { value: 'both', label: 'Cleaning + Decoration' },
];

export const getMediaUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;

    const apiBase = (import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api')
        .replace(/\/$/, '');
    return `${apiBase.replace(/\/api\/?$/, '')}/${url.replace(/^\//, '')}`;
};

export const formatDate = (value) => {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
};

export const normalizeServices = (services) => {
    const list = new Set((Array.isArray(services) ? services : []).filter(Boolean));
    if (list.has('cleaning') && list.has('decoration')) {
        list.add('both');
    } else {
        list.delete('both');
    }
    return [...list];
};

export const formatService = (service) => {
    if (!service) return '';
    if (typeof service === 'object') return service.name || service.service?.name || '';

    const labels = {
        cleaning: 'Cleaning',
        decoration: 'Decoration',
        both: 'Cleaning + Decoration',
    };
    return labels[service] || service
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const getCompanyTag = (company) => {
    const serviceItems = Array.isArray(company?.service_items) ? company.service_items : [];
    if (serviceItems.length) return formatService(serviceItems[0]);

    const services = Array.isArray(company?.services) ? company.services : [];
    return services.length ? formatService(services[0]) : '';
};

export const getCompanyCapabilities = (company) => {
    const specialties = Array.isArray(company?.specialties) ? company.specialties : [];
    if (specialties.length) return specialties;

    const serviceItems = Array.isArray(company?.service_items) ? company.service_items : [];
    return serviceItems.map((service) => formatService(service)).filter(Boolean);
};

export const getCompanyCity = (location = '') => {
    if (!location) return '';
    const parts = location.split(',');
    return parts[0].trim();
};

export const downloadCsv = (filename, rows) => {
    if (!rows || rows.length === 0) return;

    const headers = Object.keys(rows[0]);
    const escape = (value) => {
        const str = String(value ?? '');
        return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const lines = [headers.join(',')].concat(
        rows.map((row) => headers.map((header) => escape(row[header])).join(','))
    );

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const getCompanyBadge = (company = {}) => {
    const services = Array.isArray(company.services) ? company.services : [];
    if (services.includes('both')) {
        return { label: 'Full Service', tone: 'full-service' };
    }

    const rating = company.rating ?? company.average_rating;
    const reviewsCount = Number(company.reviews_count ?? company.review_count ?? 0);
    if (rating !== null && rating !== undefined && Number(rating) >= 4.5 && reviewsCount >= 1) {
        return { label: 'Top Rated', tone: 'top-rated' };
    }

    if (company.created_at) {
        const created = new Date(company.created_at);
        const ageInDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
        if (ageInDays >= 0 && ageInDays <= 30) {
            return { label: 'New', tone: 'new' };
        }
    }

    return null;
};

export const normalizeCompany = (company = {}) => {
    const serviceItems = Array.isArray(company.service_items) ? company.service_items : [];
    const services = Array.isArray(company.services) ? company.services : [];
    const ratingValue = company.rating ?? company.average_rating ?? null;
    const reviewCount = company.reviews_count ?? company.review_count ?? 0;

    return {
        ...company,
        logoUrl: getMediaUrl(company.logo),
        coverImageUrl: getMediaUrl(company.cover_image),
        thumbnailUrl: getMediaUrl(company.logo || company.thumbnail),
        rating: ratingValue === null || ratingValue === undefined ? null : Number(ratingValue),
        reviewCount: Number(reviewCount || 0),
        verified: company.verification_status === 'verified' || company.verified === true,
        serviceItems,
        services,
        tag: getCompanyTag(company),
        capabilities: getCompanyCapabilities(company),
        city: getCompanyCity(company.location),
    };
};
