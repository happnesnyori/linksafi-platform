import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, X, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/login.css';

export default function Login() {
    const navigate = useNavigate();
    const { login: contextLogin } = useAuth();

    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!usernameOrEmail || !password) {
                throw new Error('Please fill in both username and password.');
            }

            // Supports either email or username
            const credentials = {
                email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@linksafi.com`,
                username: usernameOrEmail,
                password,
            };

            const response = await contextLogin(credentials);

            if (rememberMe) {
                localStorage.setItem('remembered_user', usernameOrEmail);
            } else {
                localStorage.removeItem('remembered_user');
            }

            // Role redirect
            if (response.user?.role === 'company') {
                navigate('/company/dashboard');
            } else if (response.user?.role === 'admin' || response.user?.is_staff || response.user?.is_superuser) {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-modal-card">
                {/* Top-Left Geometric Brand Wedge */}
                <div className="login-corner-wedge" />

                {/* Top-Right Close Button */}
                <button
                    type="button"
                    className="login-close-btn"
                    onClick={() => navigate('/')}
                    aria-label="Close login and go home"
                >
                    <X size={20} />
                </button>

                {/* Title & Brand Badge */}
                    <div className="login-header">
                        <div className="login-brand-badge">
                            <div className="login-icon-wrap">
                                <Sparkles size={18} className="login-logo-icon" />
                            </div>
                            <span className="login-brand-text">Link<span>Safi</span></span>
                        </div>
                        <h1 className="login-title">LOGIN</h1>
                    </div>

                {/* Error Banner */}
                {error && (
                    <div className="login-error-alert">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    {/* Username Input */}
                    <div className="login-input-group">
                        <User size={18} className="login-input-icon" />
                        <input
                            type="text"
                            className="login-pill-input"
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                            placeholder="Username"
                            autoComplete="username"
                            required
                        />
                    </div>

                    {/* Password Input */}
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
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {/* Remember Me */}
                    <div className="login-remember-row">
                        <input
                            type="checkbox"
                            id="remember"
                            className="login-custom-checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="remember" className="login-remember-label">
                            Remember me
                        </label>
                    </div>

                    {/* Sign In Button */}
                    <button
                        type="submit"
                        className="login-submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    {/* Forget your password */}
                    <Link
                        to="/how-it-works"
                        className="login-forgot-link"
                    >
                        Forget your password?
                    </Link>

                    {/* Register Option */}
                    <div className="login-register-row">
                        <span>Don’t have account?</span>
                        <Link to="/register" className="login-register-highlight">
                            Register
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
