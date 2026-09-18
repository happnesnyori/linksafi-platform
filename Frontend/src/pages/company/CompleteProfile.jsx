import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { useAuth } from '../../context/AuthContext';
import { createCompany, getServicesCatalog, updateMyServices } from '../../services/companyService';

const categoryLabels = {
    cleaning: 'Cleaning',
    decoration: 'Decoration',
};

export default function CompleteCompanyProfile() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [catalog, setCatalog] = useState([]);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [selectedServiceIds, setSelectedServiceIds] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        description: '',
    });

    useEffect(() => {
        setFormData((current) => ({
            ...current,
            name: current.name || user?.name || '',
            email: current.email || user?.email || '',
            phone: current.phone || user?.phone || '',
        }));
    }, [user]);

    useEffect(() => {
        let active = true;
        getServicesCatalog()
            .then((data) => {
                if (active) setCatalog(Array.isArray(data) ? data : []);
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

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleServiceToggle = (serviceId) => {
        setSelectedServiceIds((current) => (
            current.includes(serviceId)
                ? current.filter((id) => id !== serviceId)
                : [...current, serviceId]
        ));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('Company name is required');
            return;
        }
        if (selectedServiceIds.length === 0) {
            setError('Select at least one service your company offers');
            return;
        }

        setSubmitting(true);
        try {
            const selectedCatalogServices = catalog.filter((service) => selectedServiceIds.includes(service.id));
            const categories = [...new Set(selectedCatalogServices.map((service) => service.category))];
            const highLevelServices = categories.length === 2 ? ['both', ...categories] : categories;

            await createCompany({
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                location: formData.location.trim(),
                description: formData.description.trim(),
                services: highLevelServices,
            });
            await updateMyServices(selectedServiceIds);
            navigate('/company/overview');
        } catch (err) {
            setError(err.message || 'Failed to create company profile');
        } finally {
            setSubmitting(false);
        }
    };

    const groupedCatalog = catalog.reduce((groups, service) => {
        const category = service.category || 'other';
        groups[category] = groups[category] || [];
        groups[category].push(service);
        return groups;
    }, {});

    return (
        <PublicLayout>
            <div className="page-container">
                <div style={{ marginBottom: '40px' }}>
                    <h1 className="page-title">Complete Your Company Profile</h1>
                    <p className="page-subtitle">
                        Your account was created, but your company profile wasn't finished. Fill this in to unlock your dashboard, gallery, and service requests.
                    </p>
                </div>

                <div style={{ maxWidth: '760px' }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '32px' }}>
                        {error && (
                            <div className="form-alert form-alert-error" style={{ marginBottom: '24px' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="form">
                            <div className="form-group">
                                <label className="form-label required">Company Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your company name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="company@example.com"
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

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Tell organizations about your company..."
                                    style={{ minHeight: '100px' }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label required">Services Offered</label>
                                {catalogLoading ? (
                                    <Loading />
                                ) : catalog.length === 0 ? (
                                    <div className="form-alert form-alert-error">No active services are available in the catalog.</div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '20px' }}>
                                        {Object.entries(groupedCatalog).map(([category, services]) => (
                                            <div key={category}>
                                                <h3 className="section-title" style={{ marginBottom: '12px' }}>
                                                    {categoryLabels[category] || category}
                                                </h3>
                                                <div style={{ display: 'grid', gap: '10px' }}>
                                                    {services.map((service) => {
                                                        const selected = selectedServiceIds.includes(service.id);
                                                        return (
                                                            <label
                                                                key={service.id}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'flex-start',
                                                                    gap: '12px',
                                                                    padding: '14px',
                                                                    border: `2px solid ${selected ? '#2563eb' : '#e5e7eb'}`,
                                                                    borderRadius: '8px',
                                                                    cursor: 'pointer',
                                                                    background: selected ? '#eff6ff' : '#ffffff',
                                                                }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selected}
                                                                    onChange={() => handleServiceToggle(service.id)}
                                                                    style={{ width: '18px', height: '18px', marginTop: '2px' }}
                                                                />
                                                                <div>
                                                                    <div style={{ fontWeight: 600 }}>{service.name}</div>
                                                                    {service.description && (
                                                                        <div style={{ fontSize: '13px', color: '#6b7280' }}>{service.description}</div>
                                                                    )}
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button variant="primary" size="lg" fullWidth type="submit" disabled={submitting} style={{ marginTop: '16px' }}>
                                {submitting ? 'Creating profile...' : 'Create Company Profile'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
