import { useEffect, useState } from 'react';
import { Check, Eye, EyeOff, Sparkles, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { register } from '../../services/authService';
import { createCompany, getServicesCatalog, updateMyServices } from '../../services/companyService';
import { useAuth } from '../../context/AuthContext';
import { normalizeServices } from '../../utils/helpers';
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

const categoryLabels = {
    cleaning: 'Cleaning',
    decoration: 'Decoration',
};

export default function Register() {
    const navigate = useNavigate();
    const { login: contextLogin } = useAuth();

    const accountType = 'company';
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        location: '',
        description: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [catalogServices, setCatalogServices] = useState([]);
    const [selectedServiceIds, setSelectedServiceIds] = useState([]);
    const [catalogLoading, setCatalogLoading] = useState(false);

    useEffect(() => {
        let active = true;
        setCatalogLoading(true);
        getServicesCatalog()
            .then((data) => {
                if (active) setCatalogServices(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                if (active) setError(err.message || 'Failed to load service catalog');
            })
            .finally(() => {
                if (active) setCatalogLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleServiceToggle = (serviceId) => {
        setSelectedServiceIds((current) => (
            current.includes(serviceId)
                ? current.filter((id) => id !== serviceId)
                : [...current, serviceId]
        ));
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

            if (selectedServiceIds.length === 0) {
                throw new Error('Select at least one service from the catalog');
            }

            const userData = {
                email: formData.email,
                password: formData.password,
                role: accountType,
                name: formData.name,
                phone: formData.phone,
                location: formData.location,
                description: formData.description,
            };

            await register(userData);
            await contextLogin({ email: formData.email, password: formData.password });

            try {
                const selectedCatalogServices = catalogServices.filter((service) => selectedServiceIds.includes(service.id));
                const categories = [...new Set(selectedCatalogServices.map((service) => service.category))];
                const highLevelServices = normalizeServices(categories);
                const companyData = {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    location: formData.location,
                    description: formData.description,
                    services: highLevelServices,
                };
                await createCompany(companyData);
                await updateMyServices(selectedServiceIds);
            } catch (companyErr) {
                console.error('Company creation failed:', companyErr);
                throw new Error(`Account created but company profile failed: ${companyErr.message || 'Please create your company profile from the dashboard'}`);
            }

            navigate('/company/overview');
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
                            <span>Safi<span>Link</span></span>
                        </div>
                        <h1 className="register-title">Create Account</h1>
                        <p className="register-subtitle">Join SafiLink to get started</p>
                    </div>

                    {error && (
                        <div className="register-error" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label className="form-label required">Company Name</label>
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
                        {catalogLoading ? (
                            <Loading />
                        ) : catalogServices.length === 0 ? (
                            <div className="register-error">No active services are available in the catalog.</div>
                        ) : (
                            <div className="register-services-grid" role="group" aria-label="Services offered">
                                {Object.entries(Object.groupBy
                                    ? Object.groupBy(catalogServices, (service) => service.category)
                                    : catalogServices.reduce((groups, service) => {
                                        const category = service.category || 'other';
                                        groups[category] = groups[category] || [];
                                        groups[category].push(service);
                                        return groups;
                                    }, {})).map(([category, services]) => (
                                    <div key={category} className="register-service-group">
                                        <div className="register-service-group-title">{categoryLabels[category] || category}</div>
                                        {services.map((service) => {
                                            const isSelected = selectedServiceIds.includes(service.id);
                                            return (
                                                <button
                                                    key={service.id}
                                                    type="button"
                                                    className={`register-service-card ${isSelected ? 'active' : ''}`}
                                                    onClick={() => handleServiceToggle(service.id)}
                                                    aria-pressed={isSelected}
                                                >
                                                    <span className="register-service-icon">
                                                        <Sparkles size={22} aria-hidden="true" />
                                                    </span>
                                                    <span className="register-service-title">{service.name}</span>
                                                    <span className="register-service-description">{service.description}</span>
                                                    <span className="register-service-status">
                                                        {isSelected ? 'Selected' : 'Select'}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

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
