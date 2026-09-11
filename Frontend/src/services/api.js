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

        const error = new Error(errorData.message || 'An error occurred');
        error.status = response.status;
        error.data = errorData;
        throw error;
    }

    const text = await response.text();
    if (!text) return null;

    return JSON.parse(text);
};

export default api;
