import api from './api';
import { MOCK_COMPANIES } from '../data/mockCompanies';

const filterMockCompanies = (filters = {}) => {
    let result = [...MOCK_COMPANIES];
    if (filters.service && filters.service !== 'all') {
        result = result.filter((c) => {
            if (filters.service === 'both') {
                return c.service === 'both' || (Array.isArray(c.services) && c.services.includes('both'));
            }
            return c.service === filters.service;
        });
    }
    if (filters.search) {
        const query = filters.search.toLowerCase();
        result = result.filter(
            (c) =>
                c.name.toLowerCase().includes(query) ||
                (c.description && c.description.toLowerCase().includes(query)) ||
                (c.location && c.location.toLowerCase().includes(query))
        );
    }
    return result;
};

export const getCompanies = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.service) params.append('service', filters.service);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const queryString = params.toString();
        const endpoint = queryString ? `/companies/?${queryString}` : '/companies/';
        const response = await api(endpoint);
        const list = response?.companies || (Array.isArray(response) ? response : []);
        if (list.length > 0) {
            return list;
        }
        return filterMockCompanies(filters);
    } catch {
        return filterMockCompanies(filters);
    }
};

export const getCompanyById = async (id) => {
    try {
        const response = await api(`/companies/${id}/`);
        if (response && response.id) return response;
    } catch {
        // Fallback to mock
    }
    const found = MOCK_COMPANIES.find((c) => String(c.id) === String(id));
    if (found) return found;
    throw new Error('Company not found');
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

// Default export for easier importing
export const companyService = {
    getCompanies,
    getCompanyById,
    updateCompany,
    updateServices,
};

export default companyService;
