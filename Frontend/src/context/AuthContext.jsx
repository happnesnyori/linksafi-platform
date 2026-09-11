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
            // Add a timeout to prevent hanging if no backend is available
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 5000)
            );

            const data = await Promise.race([
                getCurrentUser(),
                timeoutPromise,
            ]);
            setUser(data);
            setError(null);
        } catch (err) {
            // Silently fail - user is not authenticated yet
            // This is expected when there's no backend or user hasn't logged in
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
        setLoading(true);
        setError(null);
        try {
            const data = await authLogin(credentials);
            setToken(data.access);
            setUser(data.user);
            return data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setLoading(true);
        try {
            await authLogout();
        } catch (err) {
            setError(err);
        } finally {
            setUser(null);
            setLoading(false);
        }
    }, []);

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        role: user?.is_staff || user?.is_superuser
            ? 'admin'
            : user?.role || null,
        login,
        logout,
        refreshUser: fetchCurrentUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
