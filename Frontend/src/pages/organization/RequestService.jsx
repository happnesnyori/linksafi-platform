import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OrganizationLayout from '../../layouts/OrganizationLayout';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { requestService } from '../../services/requestService';
import { getCompanyById } from '../../services/companyService';

export default function RequestService() {
    const navigate = useNavigate();
    const { companyId } = useParams();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        serviceType: '',
        description: '',
        preferredDate: '',
        location: '',
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
            if (!formData.serviceType || !formData.description || !formData.preferredDate) {
                throw new Error('Please fill in all required fields');
            }
            await requestService.createRequest(companyId, {
                service: formData.serviceType,
                description: formData.description,
                requested_date: formData.preferredDate,
                location: formData.location,
            });
            navigate('/requests');
        } catch (err) {
            setError(err.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <OrganizationLayout><Loading /></OrganizationLayout>;

    if (!company) {
        return (
            <OrganizationLayout>
                <div className="page-container profile-error">
                    <h1 className="page-title">Company not found</h1>
                    <Button variant="primary" onClick={() => navigate('/find-companies')}>Back to Companies</Button>
                </div>
            </OrganizationLayout>
        );
    }

    const serviceItems = Array.isArray(company.service_items) ? company.service_items : [];
    const serviceCategories = Array.isArray(company.services) ? company.services : [];
    const serviceOptions = serviceItems.length
        ? [...new Set(serviceItems.map((service) => service.category || service))]
        : serviceCategories;

    return (
        <OrganizationLayout>
            <div className="page-container">
                <button className="company-profile-back" type="button" onClick={() => navigate(-1)}>← Back</button>
                <div className="request-page-grid">
                    <div>
                        <h1 className="page-title">{company.name}</h1>
                        <p className="page-subtitle">{company.description}</p>
                        <div className="request-company-contact">
                            {company.location && <span>{company.location}</span>}
                            {company.email && <span>{company.email}</span>}
                            {company.phone && <span>{company.phone}</span>}
                        </div>
                    </div>
                    <div className="request-form-card">
                        <h2 className="section-title">Request Service</h2>
                        {error && <div className="form-alert form-alert-error">{error}</div>}
                        <form onSubmit={handleSubmit} className="form">
                            <div className="form-group">
                                <label className="form-label required">Service</label>
                                <select className="form-select" name="serviceType" value={formData.serviceType} onChange={handleChange} required>
                                    <option value="">Select a service offered by this company</option>
                                    {serviceOptions.map((service) => (
                                        <option key={service} value={service}>{service}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label required">Description</label>
                                <textarea className="form-textarea" name="description" value={formData.description} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label required">Preferred Date</label>
                                <input className="form-input" type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input className="form-input" type="text" name="location" value={formData.location} onChange={handleChange} />
                            </div>
                            <Button variant="primary" size="lg" fullWidth type="submit" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </OrganizationLayout>
    );
}
