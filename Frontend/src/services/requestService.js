import api from './api';

export const createRequest = async (companyId, requestData) => {
    const payload = {
        ...requestData,
        company_id: Number(companyId),
    };
    const response = await api('/requests/', {
        method: 'POST',
        body: payload,
    });
    return response;
};

export const createPublicRequest = async (companyId, requestData) => {
    const payload = {
        ...requestData,
        company_id: Number(companyId),
    };
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
    if (filters.limit) params.append('page_size', filters.limit);

    const queryString = params.toString();
    const response = await api(queryString ? `/requests/?${queryString}` : '/requests/');
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
    if (filters.limit) params.append('page_size', filters.limit);

    const queryString = params.toString();
    const response = await api(queryString ? `/company/requests/?${queryString}` : '/company/requests/');
    return response;
};

export const acceptRequest = async (id) => {
    const response = await api(`/requests/${id}/accept/`, { method: 'POST' });
    return response;
};

export const rejectRequest = async (id) => {
    const response = await api(`/requests/${id}/reject/`, { method: 'POST' });
    return response;
};

export const respondToRequest = async (id, responseData) => {
    const response = await api(`/requests/${id}/respond/`, {
        method: 'POST',
        body: responseData,
    });
    return response;
};

export const getStats = async () => {
    const response = await api('/stats/');
    return response;
};

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
