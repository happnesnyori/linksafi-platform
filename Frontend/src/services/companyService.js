import api from './api';

export const getCompanies = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.service) params.append('service', filters.service);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = queryString ? `/companies/?${queryString}` : '/companies/';
    const response = await api(endpoint);
    const list = response?.results || response?.companies || (Array.isArray(response) ? response : []);
    return list;
};

export const getCompanyById = async (id) => {
    const response = await api(`/companies/${id}/`);
    if (response && response.id) return response;
    throw new Error('Company not found');
};

export const createCompany = async (data) => {
    const response = await api('/companies/', {
        method: 'POST',
        body: data,
    });
    return response;
};

export const updateCompany = async (id, data) => {
    const response = await api(`/companies/${id}/`, {
        method: 'PUT',
        body: data,
    });
    return response;
};

export const updateServices = async (id, services) => {
    const response = await api(`/companies/${id}/services/`, {
        method: 'PUT',
        body: { services },
    });
    return response;
};

export const deleteCompany = async (id) => {
    const response = await api(`/companies/${id}/`, {
        method: 'DELETE',
    });
    return response;
};

// Default export for easier importing
export const companyService = {
    getCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    updateServices,
    deleteCompany,
};

export default companyService;