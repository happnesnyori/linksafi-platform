import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, X, Sparkles } from 'lucide-react';
import { requestPasswordReset } from '../../services/authService';
import '../../styles/login.css';

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await requestPasswordReset(email.trim());
            setSubmitted(true);
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
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
                    <h1 className="login-title">FORGOT PASSWORD</h1>
                </div>

                {error && (
                    <div className="login-error-alert">
                        {error}
                    </div>
                )}

                {submitted ? (
                    <div className="login-success-alert">
                        If an account exists for <strong>{email}</strong>, we've sent a link to reset the password. Check the inbox (and spam folder).
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="login-form">
                        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '18px', lineHeight: 1.5 }}>
                            Enter the email associated with the account and a password reset link will be sent to it.
                        </p>

                        <div className="login-input-group">
                            <Mail size={18} className="login-input-icon" />
                            <input
                                type="email"
                                className="login-pill-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <button type="submit" className="login-submit-btn" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
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
