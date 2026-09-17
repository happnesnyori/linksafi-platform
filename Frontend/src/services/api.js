const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

let token = null;

const storedToken = localStorage.getItem('token');
if (storedToken) {
    token = storedToken;
}

export const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
};

export const setToken = (newToken) => {
    token = newToken;
    if (newToken) {
        localStorage.setItem('token', newToken);
    } else {
        localStorage.removeItem('token');
    }
};

export const clearToken = () => {
    token = null;
    localStorage.removeItem('token');
};

const api = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http')
        ? endpoint
        : `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: getHeaders(),
        ...options,
    };

    if (config.body instanceof FormData) {
        delete config.headers['Content-Type'];
    } else if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            errorData = { message: response.statusText };
        }

        let errorMessage = 'An error occurred';

        if (response.status === 404) {
            errorMessage = 'Service request endpoint not found. Please check the backend URL configuration.';
        } else if (response.status === 400) {
            const detail = Array.isArray(errorData.detail)
                ? errorData.detail.join(' ')
                : errorData.detail;
            const fieldError = Object.values(errorData)
                .find((value) => Array.isArray(value) && value.length > 0);
            errorMessage = errorData.message
                || detail
                || (Array.isArray(fieldError) ? fieldError.join(' ') : fieldError)
                || 'Validation failed. Please check your input.';
        } else if (response.status === 401) {
            errorMessage = 'Authentication required. Please log in.';
        } else if (response.status === 403) {
            errorMessage = 'You do not have permission to perform this action.';
        } else {
            errorMessage = errorData.message || errorData.detail || response.statusText;
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = errorData;
        throw error;
    }

    const text = await response.text();
    if (!text) return null;

    return JSON.parse(text);
};

export default api;