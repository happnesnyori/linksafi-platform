import api, { clearToken, setToken } from './api';

export const login = async (credentials) => {
    const response = await api('/auth/login/', {
        method: 'POST',
        body: credentials,
        skipAuth: true,
    });
    return response;
};

export const register = async (userData) => {
    const response = await api('/auth/register/', {
        method: 'POST',
        body: userData,
        skipAuth: true,
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

export const requestPasswordReset = async (email) => {
    const response = await api('/auth/password-reset/', {
        method: 'POST',
        body: { email },
        skipAuth: true,
    });
    return response;
};

export const confirmPasswordReset = async ({ uid, token, newPassword }) => {
    const response = await api('/auth/password-reset/confirm/', {
        method: 'POST',
        body: { uid, token, new_password: newPassword },
        skipAuth: true,
    });
    return response;
};
