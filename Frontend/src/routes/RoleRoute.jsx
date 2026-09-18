import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE } from '../utils/helpers';

const RoleRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, role, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="auth-page"><div className="auth-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><p>Loading...</p></div></div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(role)) {
        if (role === ROLE.COMPANY) {
            return <Navigate to="/company/overview" replace />;
        }
        if (role === ROLE.ORGANIZATION) {
            return <Navigate to="/dashboard" replace />;
        }
        if (role === ROLE.ADMIN) {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RoleRoute;