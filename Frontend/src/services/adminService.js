import api from './api';

const buildQuery = (params) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (Array.isArray(value)) {
            value.forEach((v) => qs.append(key, v));
        } else {
            qs.append(key, value);
        }
    });
    const string = qs.toString();
    return string ? `?${string}` : '';
};

export const adminService = {
    // Dashboard stats
    getDashboardStats: async () => {
        const response = await api('/admin/dashboard/');
        return response;
    },

    // Dashboard charts + recent data
    getDashboardCharts: async () => {
        const response = await api('/admin/dashboard/charts/');
        return response;
    },

    getRecentActivity: async (limit = 10) => {
        const response = await api(`/admin/activity/?${buildQuery({ limit })}`);
        return response.results || response?.activities || response || [];
    },

    // Companies
    getCompanies: async (filters = {}, page = 1, pageSize = 10) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.is_active !== undefined && filters.is_active !== '') params.append('is_active', filters.is_active);
        if (filters.search) params.append('search', filters.search);
        params.append('page', page);
        params.append('page_size', pageSize);
        const queryString = params.toString();
        const endpoint = `/admin/companies/${queryString ? `?${queryString}` : ''}`;
        const response = await api(endpoint);
        return response;
    },

    getCompany: async (id) => {
        const response = await api(`/admin/companies/${id}/`);
        return response;
    },

    getAllCompanies: async () => {
        const params = new URLSearchParams();
        params.append('page', 1);
        params.append('page_size', 100);
        const queryString = params.toString();
        const endpoint = `/admin/companies/${queryString ? `?${queryString}` : ''}`;
        const response = await api(endpoint);
        return response.results || response || [];
    },

    createCompany: async (data) => {
        const response = await api('/admin/companies/', {
            method: 'POST',
            body: data,
        });
        return response;
    },

    updateCompany: async (id, data) => {
        const response = await api(`/admin/companies/${id}/`, {
            method: 'PATCH',
            body: data,
        });
        return response;
    },

    approveCompany: async (id) => {
        const response = await api(`/admin/companies/${id}/approve/`, {
            method: 'POST',
        });
        return response;
    },

    rejectCompany: async (id) => {
        const response = await api(`/admin/companies/${id}/reject/`, {
            method: 'POST',
        });
        return response;
    },

    suspendCompany: async (id) => {
        const response = await api(`/admin/companies/${id}/suspend/`, {
            method: 'POST',
        });
        return response;
    },

    reactivateCompany: async (id) => {
        const response = await api(`/admin/companies/${id}/reactivate/`, {
            method: 'POST',
        });
        return response;
    },

    deleteCompany: async (id) => {
        const response = await api(`/admin/companies/${id}/`, {
            method: 'DELETE',
        });
        return response;
    },

    // Customers (users)
    getCustomers: async (filters = {}, page = 1, pageSize = 10) => {
        const params = new URLSearchParams();
        if (filters.role) params.append('role', filters.role);
        if (filters.is_active !== undefined && filters.is_active !== '') params.append('is_active', filters.is_active);
        if (filters.search) params.append('search', filters.search);
        params.append('page', page);
        params.append('page_size', pageSize);
        const queryString = params.toString();
        const endpoint = `/admin/users/${queryString ? `?${queryString}` : ''}`;
        const response = await api(endpoint);
        return response;
    },

    getCustomer: async (id) => {
        const response = await api(`/admin/users/${id}/`);
        return response;
    },

    getCustomerRequests: async (id) => {
        const response = await api(`/admin/users/${id}/requests/`);
        return response;
    },

    updateCustomer: async (id, data) => {
        const response = await api(`/admin/users/${id}/`, {
            method: 'PATCH',
            body: data,
        });
        return response;
    },

    deleteCustomer: async (id) => {
        const response = await api(`/admin/users/${id}/`, {
            method: 'DELETE',
        });
        return response;
    },

    // Service Requests
    getRequests: async (filters = {}, page = 1, pageSize = 10) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.service) params.append('service', filters.service);
        if (filters.property_type) params.append('property_type', filters.property_type);
        if (filters.search) params.append('search', filters.search);
        params.append('page', page);
        params.append('page_size', pageSize);
        const queryString = params.toString();
        const endpoint = `/admin/requests/${queryString ? `?${queryString}` : ''}`;
        const response = await api(endpoint);
        return response;
    },

    getRequest: async (id) => {
        const response = await api(`/admin/requests/${id}/`);
        return response;
    },

    updateRequest: async (id, data) => {
        const response = await api(`/admin/requests/${id}/`, {
            method: 'PATCH',
            body: data,
        });
        return response;
    },

    // Reviews
    getReviews: async (filters = {}, page = 1, pageSize = 10) => {
        const params = new URLSearchParams();
        if (filters.company_id) params.append('company_id', filters.company_id);
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);
        params.append('page', page);
        params.append('page_size', pageSize);
        const queryString = params.toString();
        const endpoint = `/admin/reviews/${queryString ? `?${queryString}` : ''}`;
        const response = await api(endpoint);
        return response;
    },

    getReview: async (id) => {
        const response = await api(`/admin/reviews/${id}/`);
        return response;
    },

    updateReview: async (id, data) => {
        const response = await api(`/admin/reviews/${id}/`, {
            method: 'PATCH',
            body: data,
        });
        return response;
    },

    approveReview: async (id) => {
        const response = await api(`/admin/reviews/${id}/approve/`, {
            method: 'POST',
        });
        return response;
    },

    rejectReview: async (id) => {
        const response = await api(`/admin/reviews/${id}/reject/`, {
            method: 'POST',
        });
        return response;
    },

    unpublishReview: async (id) => {
        const response = await api(`/admin/reviews/${id}/unpublish/`, {
            method: 'POST',
        });
        return response;
    },

    toggleFeaturedReview: async (id) => {
        const response = await api(`/admin/reviews/${id}/toggle_feature/`, {
            method: 'POST',
        });
        return response;
    },

    hideReview: async (id) => {
        const response = await api(`/admin/reviews/${id}/hide/`, {
            method: 'POST',
        });
        return response;
    },

    removeReview: async (id) => {
        const response = await api(`/admin/reviews/${id}/remove/`, {
            method: 'POST',
        });
        return response;
    },

    restoreReview: async (id) => {
        const response = await api(`/admin/reviews/${id}/restore/`, {
            method: 'POST',
        });
        return response;
    },

    // Activity Logs
    getActivityLogs: async (filters = {}, page = 1, pageSize = 10) => {
        const params = { ...filters, page, page_size: pageSize };
        const response = await api(`/admin/activity/?${buildQuery(params)}`);
        return response;
    },

    // Services catalog
    getServices: async (filters = {}, page = 1, pageSize = 10) => {
        const params = { ...filters, page, page_size: pageSize };
        const response = await api(`/admin/services/?${buildQuery(params)}`);
        return response;
    },

    getAllServices: async () => {
        const response = await api('/admin/services/?limit=100');
        return response.results || response?.services || response || [];
    },

    getService: async (id) => {
        const response = await api(`/admin/services/${id}/`);
        return response;
    },

    createService: async (data) => {
        const response = await api('/admin/services/', {
            method: 'POST',
            body: data,
        });
        return response;
    },

    updateService: async (id, data) => {
        const response = await api(`/admin/services/${id}/`, {
            method: 'PATCH',
            body: data,
        });
        return response;
    },

    deleteService: async (id) => {
        const response = await api(`/admin/services/${id}/`, {
            method: 'DELETE',
        });
        return response;
    },

    // Admin accounts (invite-only)
    getAdmins: async () => {
        const response = await api('/admin/admins/');
        return response.results || response || [];
    },

    inviteAdmin: async (data) => {
        const response = await api('/admin/admins/invite/', {
            method: 'POST',
            body: data,
        });
        return response;
    },

    // Audit log
    getAuditLog: async (filters = {}) => {
        const response = await api(`/admin/audit-log/${buildQuery(filters)}`);
        return response.results || response || [];
    },
};

export default adminService;