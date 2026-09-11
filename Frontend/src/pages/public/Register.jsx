import { useState } from 'react';
import { Check, Eye, EyeOff, Layers, Paintbrush, Sparkles, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import Button from '../../components/Button';
import { register } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/register.css';

const passwordRequirements = [
    {
        id: 'length',
        label: 'At least 8 characters',
        test: (value) => value.length >= 8,
    },
    {
        id: 'letters',
        label: 'Uppercase and lowercase letters',
        test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value),
    },
    {
        id: 'number',
        label: 'A number',
        test: (value) => /\d/.test(value),
    },
    {
        id: 'special-character',
        label: 'A special character',
        test: (value) => /[^A-Za-z0-9]/.test(value),
    },
];

const serviceOptions = [
    {
        id: 'cleaning',
        title: 'Cleaning Services',
        description: 'Deep cleaning, sanitization, turnover cleans, and routine facility care.',
        icon: Sparkles,
    },
    {
        id: 'decoration',
        title: 'Decoration Services',
        description: 'Event styling, floral design, staging, and interior decoration.',
        icon: Paintbrush,
    },
    {
        id: 'both',
        title: 'Cleaning + Decoration',
        description: 'Combined packages for complete facility care and event transformation.',
        icon: Layers,
    },
];

export default function Register() {
    const navigate = useNavigate();
    const { login: contextLogin } = useAuth();

    const [accountType, setAccountType] = useState('organization');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        organizationType: '',
        phone: '',
        location: '',
        description: '',
        services: [],
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleServiceToggle = (service) => {
        setFormData((prev) => {
            const isSelected = prev.services.includes(service);

            if (service === 'both') {
                return {
                    ...prev,
                    services: isSelected ? [] : ['both'],
                };
            }

            const servicesWithoutBoth = prev.services.filter((item) => item !== 'both');
            const servicesWithoutCurrent = servicesWithoutBoth.filter((item) => item !== service);

            return {
                ...prev,
                services: isSelected ? servicesWithoutBoth : [...servicesWithoutCurrent, service],
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!formData.email || !formData.password || !formData.name) {
                throw new Error('Please fill in all required fields');
            }

            if (formData.password !== formData.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
            if (!strongPasswordPattern.test(formData.password)) {
                throw new Error('Use at least 8 characters, including uppercase and lowercase letters, a number, and a special character.');
            }

            const userData = {
                email: formData.email,
                password: formData.password,
                role: accountType,
                [accountType === 'organization' ? 'organizationName' : 'companyName']: formData.name,
                phone: formData.phone,
                location: formData.location,
            };

            if (accountType === 'organization') {
                userData.organizationType = formData.organizationType;
            } else {
                userData.description = formData.description;
                userData.services = formData.services;
            }

            await register(userData);
            await contextLogin({ email: formData.email, password: formData.password });

            navigate(accountType === 'organization' ? '/dashboard' : '/company/dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout>
            <div className="register-page">
                <div className="register-card">
                    <div className="register-header">
                        <div className="register-brand">
                            <span className="register-brand-icon">
                                <Sparkles size={18} aria-hidden="true" />
                            </span>
                            <span>Link<span>Safi</span></span>
                        </div>
                        <h1 className="register-title">Create Account</h1>
                        <p className="register-subtitle">Join LinkSafi to get started</p>
                    </div>

                    <div className="register-account-selector" role="group" aria-label="Account type">
                        <button
                            type="button"
                            className={`register-account-option ${accountType === 'organization' ? 'active' : ''}`}
                            onClick={() => setAccountType('organization')}
                        >
                            University/Apartment
                        </button>
                        <button
                            type="button"
                            className={`register-account-option ${accountType === 'company' ? 'active' : ''}`}
                            onClick={() => setAccountType('company')}
                        >
                            Service Company
                        </button>
                    </div>

                    {error && (
                        <div className="register-error" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label className="form-label required">
                            {accountType === 'organization' ? 'Organization Name' : 'Company Name'}
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter name"
                            required
                        />
                    </div>

                    {accountType === 'organization' && (
                        <div className="form-group">
                            <label className="form-label required">Organization Type</label>
                            <select
                                className="form-select"
                                name="organizationType"
                                value={formData.organizationType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select type</option>
                                <option value="university">University</option>
                                <option value="apartment">Apartment Complex</option>
                            </select>
                        </div>
                    )}

                    {accountType === 'company' && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Tell us about your company..."
                                    style={{ minHeight: '100px' }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label required">Services Offered</label>
                                <div className="register-services-grid" role="group" aria-label="Services offered">
                                    {serviceOptions.map((service) => {
                                        const Icon = service.icon;
                                        const isSelected = formData.services.includes(service.id);

                                        return (
                                            <button
                                                key={service.id}
                                                type="button"
                                                className={`register-service-card ${isSelected ? 'active' : ''}`}
                                                onClick={() => handleServiceToggle(service.id)}
                                                aria-pressed={isSelected}
                                            >
                                                <span className="register-service-icon">
                                                    <Icon size={22} aria-hidden="true" />
                                                </span>
                                                <span className="register-service-title">{service.title}</span>
                                                <span className="register-service-description">{service.description}</span>
                                                <span className="register-service-status">
                                                    {isSelected ? 'Selected' : 'Select'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label className="form-label required">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input
                            type="tel"
                            className="form-input"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Your phone number"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Location</label>
                        <input
                            type="text"
                            className="form-input"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="City or address"
                        />
                    </div>

                    <div className="form-group password-form-group">
                        <label className="form-label required" htmlFor="password">Password</label>
                        <div className="register-password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                autoComplete="new-password"
                                aria-describedby="password-description password-checklist"
                                required
                            />
                            <button
                                type="button"
                                className="register-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                aria-pressed={showPassword}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div className="password-guidance" id="password-description">
                            <span className="password-guidance-title">Password requirements</span>
                            <p>Use at least 8 characters, including uppercase and lowercase letters, a number, and a special character.</p>
                            <ul className="password-checklist" id="password-checklist" aria-live="polite">
                                {passwordRequirements.map((requirement) => {
                                    const isMet = requirement.test(formData.password);

                                    return (
                                        <li
                                            key={requirement.id}
                                            className={`password-check-item ${isMet ? 'is-met' : ''}`}
                                        >
                                            <span className="password-check-icon" aria-hidden="true">
                                                {isMet ? <Check size={15} /> : <X size={15} />}
                                            </span>
                                            <span>{requirement.label}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label required" htmlFor="confirm-password">Confirm Password</label>
                        <div className="register-password-input-wrapper">
                            <input
                                id="confirm-password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="form-input"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repeat your password"
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                className="register-password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                                aria-pressed={showConfirmPassword}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        type="submit"
                        disabled={loading}
                        className="register-submit-button"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                </form>

                <p className="register-signin-prompt">
                    Already have an account?{' '}
                    <Link to="/login" className="register-signin-link">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    </PublicLayout>
    );
}
