import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getCurrentUser, login as authLogin, logout as authLogout } from '../services/authService';
import { setToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCurrentUser = useCallback(async () => {
        try {
            const data = await getCurrentUser();
            setUser(data);
            setError(null);
        } catch (err) {
            setUser(null);
            setError(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    const login = useCallback(async (credentials) => {
        setError(null);
        try {
            const data = await authLogin(credentials);
            setToken(data.access);
            setUser(data.user);
            return data;
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authLogout();
        } catch (err) {
            setError(err);
        } finally {
            setUser(null);
        }
    }, []);

    const role = (user?.is_staff || user?.is_superuser) ? 'admin' : (user?.role || null);
    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        role,
        login,
        logout,
        refreshUser: fetchCurrentUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
