import api, { clearToken, setToken } from './api';

export const login = async (credentials) => {
    const response = await api('/auth/login/', {
        method: 'POST',
        body: credentials,
    });
    return response;
};

export const register = async (userData) => {
    const response = await api('/auth/register/', {
        method: 'POST',
        body: userData,
    });
    setToken(response.access);
    return response;
};

export const logout = async () => {
    try {
        const response = await api('/auth/logout/', {
            method: 'POST',
        });
        clearToken();
        return response;
    } catch (error) {
        clearToken();
        throw error;
    }
};

export const getCurrentUser = async () => {
    const response = await api('/auth/me/');
    return response;
};
