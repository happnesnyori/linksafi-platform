import api from './api';

export const createCompany = async (companyData) => {
    const response = await api('/companies/', {
        method: 'POST',
        body: companyData,
    });
    return response;
};

export const getCompanies = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.service) params.append('service', filters.service);
    if (filters.specialty) params.append('specialty', filters.specialty);
    if (filters.location) params.append('location', filters.location);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('page_size', filters.limit);

    const queryString = params.toString();
    const response = await api(`/companies/${queryString ? `?${queryString}` : ''}`);
    return response;
};

export const getCompanyById = async (id) => {
    const response = await api(`/companies/${id}/`);
    return response;
};

export const getMyCompany = async () => {
    const response = await api('/companies/me/');
    return response;
};

export const updateMyCompany = async (companyData) => {
    const response = await api('/companies/me/', {
        method: 'PUT',
        body: companyData,
    });
    return response;
};

export const getServicesCatalog = async () => {
    const response = await api('/services/');
    return response.results || response || [];
};

export const createService = async (serviceData) => {
    const response = await api('/services/', {
        method: 'POST',
        body: serviceData,
    });
    return response;
};

export const updateMyServices = async (servicesPayload) => {
    const payload = Array.isArray(servicesPayload)
        ? { service_ids: servicesPayload }
        : servicesPayload;
    const response = await api('/companies/me/services/', {
        method: 'PUT',
        body: payload,
    });
    return response;
};

export const updateServices = async (_userId, servicesPayload) => updateMyServices(servicesPayload);

export const getCompanyGallery = async (serviceId) => {
    const query = serviceId ? `?service=${serviceId}` : '';
    const response = await api(`/companies/me/gallery/${query}`);
    return response.results || response || [];
};

export const uploadGalleryImage = async (imageData) => {
    const response = await api('/companies/me/gallery/', {
        method: 'POST',
        body: imageData,
    });
    return response;
};

export const uploadServiceImage = async (serviceId, file, title, description) => {
    const form = new FormData();
    form.append('image', file);
    form.append('service', serviceId);
    if (title) form.append('title', title);
    if (description) form.append('description', description);
    return uploadGalleryImage(form);
};

// Uploads a group of related photos (e.g. a main shot plus close-up/detail shots)
// as a single gallery item. The first file becomes the main image; the rest are
// stored as its sub-images.
export const uploadServiceImageGroup = async (serviceId, files, title, description) => {
    const form = new FormData();
    files.forEach((file) => form.append('images', file));
    form.append('service', serviceId);
    if (title) form.append('title', title);
    if (description) form.append('description', description);
    return uploadGalleryImage(form);
};

// Edits an existing gallery image's label/description/service, and optionally
// replaces its image file. Works for both main images and sub-images.
export const updateGalleryImage = async (imageId, updates) => {
    const hasFile = updates.image instanceof File;
    let body;
    if (hasFile) {
        body = new FormData();
        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined && value !== null) body.append(key, value);
        });
    } else {
        body = updates;
    }
    const response = await api(`/companies/gallery/${imageId}/`, {
        method: 'PATCH',
        body,
    });
    return response;
};

export const deleteGalleryImage = async (imageId) => {
    const response = await api(`/companies/gallery/${imageId}/`, {
        method: 'DELETE',
    });
    return response;
};

export const getCompanyReviews = async (companyId) => {
    const response = await api(`/reviews/company/${companyId}/`);
    return response.results || response || [];
};

export const getFeaturedReviews = async () => {
    const response = await api('/reviews/featured/');
    return response.results || response || [];
};

export const getFavorites = async () => {
    const response = await api('/favorites/');
    return response.results || response || [];
};

export const addFavorite = async (companyId) => {
    const response = await api('/favorites/', {
        method: 'POST',
        body: { company_id: companyId },
    });
    return response;
};

export const removeFavorite = async (companyId) => {
    const response = await api(`/favorites/${companyId}/`, {
        method: 'DELETE',
    });
    return response;
};

export const companyService = {
    getCompanies,
    getCompanyById,
    getMyCompany,
    updateMyCompany,
    createCompany,
    getServicesCatalog,
    createService,
    updateMyServices,
    updateServices,
    getCompanyGallery,
    uploadGalleryImage,
    uploadServiceImage,
    uploadServiceImageGroup,
    updateGalleryImage,
    deleteGalleryImage,
    getCompanyReviews,
    getFeaturedReviews,
    getFavorites,
    addFavorite,
    removeFavorite,
};

export default companyService;
