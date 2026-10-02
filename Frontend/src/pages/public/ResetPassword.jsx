import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, X, Sparkles } from 'lucide-react';
import { confirmPasswordReset } from '../../services/authService';
import '../../styles/login.css';

export default function ResetPassword() {
    const navigate = useNavigate();
    const { uid, token } = useParams();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await confirmPasswordReset({ uid, token, newPassword: password });
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'This reset link is invalid or has expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-modal-card">
                <div className="login-corner-wedge" />

                <button
                    type="button"
                    className="login-close-btn"
                    onClick={() => navigate('/')}
                    aria-label="Close and go home"
                >
                    <X size={20} />
                </button>

                <div className="login-header">
                    <div className="login-brand-badge">
                        <div className="login-icon-wrap">
                            <Sparkles size={18} className="login-logo-icon" />
                        </div>
                        <span className="login-brand-text">Safi<span>Link</span></span>
                    </div>
                    <h1 className="login-title">RESET PASSWORD</h1>
                </div>

                {error && (
                    <div className="login-error-alert">
                        {error}
                    </div>
                )}

                {success ? (
                    <>
                        <div className="login-success-alert">
                            The password has been reset. Sign in with the new password.
                        </div>
                        <button type="button" className="login-submit-btn" onClick={() => navigate('/login')}>
                            Go to Login
                        </button>
                    </>
                ) : (
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-input-group">
                            <Lock size={18} className="login-input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="login-pill-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="New password"
                                autoComplete="new-password"
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

                        <div className="login-input-group">
                            <Lock size={18} className="login-input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="login-pill-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <button type="submit" className="login-submit-btn" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <Link to="/login" className="login-forgot-link">
                    Back to login
                </Link>
            </div>
        </div>
    );
}
