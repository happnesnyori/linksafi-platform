import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { requestService } from '../../services/requestService';
import { getCompanyById } from '../../services/companyService';
import { AlertCircle, User, Mail, Phone, LogIn, Shield, Building2, GraduationCap, Home } from 'lucide-react';
import '../../styles/publicRequest.css';

export default function PublicRequestService() {
    const navigate = useNavigate();
    const { companyId } = useParams();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const [formData, setFormData] = useState({
        service: '',
        property_type: '',
        description: '',
        requested_date: '',
        location: '',
        guest_name: '',
        guest_email: '',
        guest_phone: '',
    });

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                setLoading(true);
                const data = await getCompanyById(companyId);
                setCompany(data);
            } catch (err) {
                setError('Failed to load company details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [companyId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            if (!formData.service || !formData.description || !formData.requested_date) {
                throw new Error('Please fill in all required fields');
            }

            const payload = {
                service: formData.service,
                property_type: formData.property_type,
                description: formData.description,
                requested_date: formData.requested_date,
                location: formData.location,
                guest_name: formData.guest_name,
                guest_email: formData.guest_email,
                guest_phone: formData.guest_phone,
            };

            await requestService.createPublicRequest(companyId, payload);
            
            // Show success with login prompt
            setShowLoginPrompt(true);
        } catch (err) {
            setError(err.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <PublicLayout><Loading /></PublicLayout>;

    if (!company) {
        return (
            <PublicLayout>
                <div className="page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <h2 className="page-title">Company not found</h2>
                    <Button variant="primary" onClick={() => navigate('/companies')}>
                        Back to Companies
                    </Button>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="page-container">
                <Link
                    to="/companies"
                    className="back-link"
                >
                    ← Back to Companies
                </Link>

                <div className="request-grid">
                    {/* Company Info */}
                    <div className="company-info">
                        <h1 className="page-title">{company.name}</h1>
                        <p className="page-subtitle">{company.description}</p>
                        <div className="company-details">
                            <div className="detail-item">
                                <span className="detail-label">Location</span>
                                <span className="detail-value">{company.location}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{company.email}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Phone</span>
                                <span className="detail-value">{company.phone}</span>
                            </div>
                        </div>
                        {company.verified && (
                            <div className="verified-badge">
                                <Shield size={16} /> Verified Company
                            </div>
                        )}
                    </div>

                    {/* Request Form */}
                    <div className="request-form-wrapper">
                        <div className="request-card">
                            <div className="request-header">
                                <h2>Request Service</h2>
                                <p>Fill in your details and we'll connect you with {company.name}</p>
                            </div>

                            {showLoginPrompt && (
                                <div className="login-prompt">
                                    <div className="login-prompt-icon">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div className="login-prompt-content">
                                        <h3>Request Submitted Successfully!</h3>
                                        <p>Your service request has been sent to {company.name}. They will contact you shortly.</p>
                                        <p className="login-prompt-sub">Want to track this request and manage future orders? Create an account or log in.</p>
                                    </div>
                                    <div className="login-prompt-actions">
                                        <Link to="/login?requested=1" className="btn-login-prompt">
                                            <LogIn size={16} /> Log In / Sign Up
                                        </Link>
                                        <Button variant="secondary" onClick={() => navigate('/companies')}>
                                            Browse More Companies
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {!showLoginPrompt && (
                                <>
                                    {error && (
                                        <div className="error-message">
                                            <AlertCircle size={16} />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="form">
                                        <div className="form-group">
                                            <label className="form-label required">Service Type *</label>
                                            <select
                                                className="form-select"
                                                name="service"
                                                value={formData.service}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select service</option>
                                                <option value="cleaning">Cleaning</option>
                                                <option value="decoration">Decoration</option>
                                                <option value="both">Cleaning + Decoration</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label required">Property Type *</label>
                                            <select
                                                className="form-select"
                                                name="property_type"
                                                value={formData.property_type}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select property type</option>
                                                <option value="university">University</option>
                                                <option value="apartment">Apartment</option>
                                                <option value="hostel">Hostel</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label required">Description *</label>
                                            <textarea
                                                className="form-textarea"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Describe your service needs in detail..."
                                                style={{ minHeight: '100px' }}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label required">Preferred Date *</label>
                                            <input
                                                type="date"
                                                className="form-input"
                                                name="requested_date"
                                                value={formData.requested_date}
                                                onChange={handleChange}
                                                required
                                                min={new Date().toISOString().split('T')[0]}
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
                                                placeholder="Service location (optional)"
                                            />
                                        </div>

                                        <div className="guest-section">
                                            <h4>Your Contact Details (Optional)</h4>
                                            <p className="guest-section-hint">Provide these so the company can contact you directly</p>
                                            
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label className="form-label">Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        name="guest_name"
                                                        value={formData.guest_name}
                                                        onChange={handleChange}
                                                        placeholder="Your name"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Email</label>
                                                    <input
                                                        type="email"
                                                        className="form-input"
                                                        name="guest_email"
                                                        value={formData.guest_email}
                                                        onChange={handleChange}
                                                        placeholder="you@example.com"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="form-group">
                                                <label className="form-label">Phone</label>
                                                <input
                                                    type="tel"
                                                    className="form-input"
                                                    name="guest_phone"
                                                    value={formData.guest_phone}
                                                    onChange={handleChange}
                                                    placeholder="+255 ..."
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            variant="primary"
                                            size="lg"
                                            fullWidth
                                            type="submit"
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Submitting...' : 'Submit Request'}
                                        </Button>

                                        <p className="no-login-note">
                                            No account needed — we'll forward your request directly to the company
                                        </p>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}