import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/login.css';

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login: contextLogin, logout } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!email || !password) {
                throw new Error('Please enter your email and password.');
            }

            const response = await contextLogin({ email, password });
            const isAdmin = response.user?.is_staff || response.user?.is_superuser;

            if (!isAdmin) {
                await logout();
                throw new Error('This account does not have admin access.');
            }

            navigate('/admin');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-modal-card">
                <div className="login-corner-wedge" />

                <div className="login-header">
                    <div className="login-brand-badge">
                        <div className="login-icon-wrap">
                            <ShieldCheck size={18} className="login-logo-icon" />
                        </div>
                        <span className="login-brand-text">Safi<span>Link</span></span>
                    </div>
                    <h1 className="login-title">ADMIN SIGN IN</h1>
                </div>

                {error && (
                    <div className="login-error-alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-input-group">
                        <Mail size={18} className="login-input-icon" />
                        <input
                            type="email"
                            className="login-pill-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Admin email"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="login-input-group">
                        <Lock size={18} className="login-input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="login-pill-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            autoComplete="current-password"
                            required
                        />
                        <button
                            type="button"
                            className="login-eye-btn"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <button type="submit" className="login-submit-btn" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted, #6b7280)', marginTop: '16px' }}>
                        Admin accounts are invite-only and created by an existing administrator.
                    </p>
                </form>
            </div>
        </div>
    );
}
