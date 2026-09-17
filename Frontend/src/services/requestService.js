import api from './api';

export const createRequest = async (requestData) => {
    // Support both {company_id} and {company} shapes
    const payload = { ...requestData };
    if (payload.companyId !== undefined) {
        payload.company_id = payload.companyId;
        delete payload.companyId;
    }
    const response = await api('/requests/', {
        method: 'POST',
        body: payload,
    });
    return response;
};

// Public/Guest request - no authentication required
export const createPublicRequest = async (companyId, requestData) => {
    const payload = {
        ...requestData,
        company_id: Number(companyId),
    };
    // Use a public endpoint that doesn't require auth
    const response = await api('/public/requests/', {
        method: 'POST',
        body: payload,
    });
    return response;
};

export const getRequests = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = queryString ? `/requests/?${queryString}` : '/requests/';
    const response = await api(endpoint);
    return response;
};

export const getRequestById = async (id) => {
    const response = await api(`/requests/${id}/`);
    return response;
};

export const getCompanyRequests = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = queryString ? `/company/requests/?${queryString}` : '/company/requests/';
    const response = await api(endpoint);
    return response;
};

export const acceptRequest = async (id) => {
    const response = await api(`/requests/${id}/accept/`, {
        method: 'POST',
    });
    return response;
};

export const rejectRequest = async (id) => {
    const response = await api(`/requests/${id}/reject/`, {
        method: 'POST',
    });
    return response;
};

export const respondToRequest = async (id, responseData) => {
    const response = await api(`/requests/${id}/respond/`, {
        method: 'POST',
        body: responseData,
    });
    return response;
};

export const getStats = async (type = 'organization') => {
    const endpoint = '/stats/';
    const response = await api(endpoint);
    return response;
};

// Default export for easier importing
export const requestService = {
    createRequest,
    createPublicRequest,
    getRequests,
    getRequestById,
    getCompanyRequests,
    acceptRequest,
    rejectRequest,
    respondToRequest,
    getStats,
};

export default requestService;