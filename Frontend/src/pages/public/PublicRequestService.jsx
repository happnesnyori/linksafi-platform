import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { requestService } from '../../services/requestService';
import { getCompanyById } from '../../services/companyService';
import { AlertCircle, Shield } from 'lucide-react';
import '../../styles/publicRequest.css';

export default function PublicRequestService() {
    const navigate = useNavigate();
    const { companyId } = useParams();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

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
        let active = true;
        setLoading(true);
        getCompanyById(companyId)
            .then((data) => {
                if (active) setCompany(data);
            })
            .catch(() => {
                if (active) setError('Failed to load company details');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [companyId]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            if (!formData.service || !formData.description || !formData.requested_date) {
                throw new Error('Please fill in all required fields');
            }
            await requestService.createPublicRequest(companyId, formData);
            setSubmitted(true);
            setFormData({
                service: '',
                property_type: '',
                description: '',
                requested_date: '',
                location: '',
                guest_name: '',
                guest_email: '',
                guest_phone: '',
            });
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
                <div className="page-container profile-error">
                    <h1 className="page-title">Company not found</h1>
                    <Button variant="primary" onClick={() => navigate('/companies')}>Back to Companies</Button>
                </div>
            </PublicLayout>
        );
    }

    const serviceItems = Array.isArray(company.service_items) ? company.service_items : [];
    const serviceCategories = Array.isArray(company.services) ? company.services : [];
    const serviceOptions = serviceItems.length
        ? [...new Set(serviceItems.map((service) => service.category || service))]
        : serviceCategories;
    const isVerified = company.verification_status === 'verified' || company.verified === true;

    return (
        <PublicLayout>
            <div className="page-container">
                <Link to="/companies" className="company-profile-back">← Back to Companies</Link>
                <div className="request-grid">
                    <div className="company-info">
                        <h1 className="page-title">{company.name}</h1>
                        <p className="page-subtitle">{company.description}</p>
                        <div className="company-details">
                            <div className="detail-item"><span className="detail-label">Location</span><span className="detail-value">{company.location}</span></div>
                            <div className="detail-item"><span className="detail-label">Email</span><span className="detail-value">{company.email}</span></div>
                            <div className="detail-item"><span className="detail-label">Phone</span><span className="detail-value">{company.phone}</span></div>
                        </div>
                        {isVerified && <div className="verified-badge"><Shield size={16} /> Verified Company</div>}
                    </div>
                    <div className="request-form-wrapper">
                        <div className="request-card">
                            <div className="request-header">
                                <h2>Request Service</h2>
                                <p>Fill in your details and we will connect you with {company.name}.</p>
                            </div>
                            {submitted && (
                                <div className="login-prompt">
                                    <div className="login-prompt-icon"><AlertCircle size={24} /></div>
                                    <div className="login-prompt-content">
                                        <h3>Request Submitted Successfully!</h3>
                                        <p>Your service request has been sent to {company.name}.</p>
                                        <p className="login-prompt-sub">Create an account or log in to track this request.</p>
                                    </div>
                                    <div className="login-prompt-actions">
                                        <Link to="/login?requested=1" className="btn-login-prompt">Log In / Sign Up</Link>
                                        <Button variant="secondary" onClick={() => navigate('/companies')}>Browse More Companies</Button>
                                    </div>
                                </div>
                            )}
                            {!submitted && (
                                <>
                                    {error && <div className="error-message"><AlertCircle size={16} /><span>{error}</span></div>}
                                    <form onSubmit={handleSubmit} className="form">
                                        <div className="form-group">
                                            <label className="form-label required">Service Type</label>
                                            <select className="form-select" name="service" value={formData.service} onChange={handleChange} required>
                                                <option value="">Select a service offered by this company</option>
                                                {serviceOptions.map((service) => <option key={service} value={service}>{service}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label required">Property Type</label>
                                            <select className="form-select" name="property_type" value={formData.property_type} onChange={handleChange} required>
                                                <option value="">Select property type</option>
                                                <option value="university">University</option>
                                                <option value="apartment">Apartment</option>
                                                <option value="hostel">Hostel</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label required">Description</label>
                                            <textarea className="form-textarea" name="description" value={formData.description} onChange={handleChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label required">Preferred Date</label>
                                            <input className="form-input" type="date" name="requested_date" value={formData.requested_date} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Location</label>
                                            <input className="form-input" type="text" name="location" value={formData.location} onChange={handleChange} />
                                        </div>
                                        <div className="guest-section">
                                            <h4>Your Contact Details (Optional)</h4>
                                            <div className="form-row">
                                                <div className="form-group"><label className="form-label">Name</label><input className="form-input" type="text" name="guest_name" value={formData.guest_name} onChange={handleChange} /></div>
                                                <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" name="guest_email" value={formData.guest_email} onChange={handleChange} /></div>
                                            </div>
                                            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" type="tel" name="guest_phone" value={formData.guest_phone} onChange={handleChange} /></div>
                                        </div>
                                        <Button variant="primary" size="lg" fullWidth type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</Button>
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
