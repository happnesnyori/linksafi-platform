import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyLayout from '../../layouts/CompanyLayout';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { useAuth } from '../../context/AuthContext';
import { updateServices } from '../../services/companyService';

export default function ManageServices() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [services, setServices] = useState({
        cleaning: false,
        decoration: false,
    });

    useEffect(() => {
        // Load current services from user data
        if (user?.services) {
            setServices({
                cleaning: user.services.includes('cleaning'),
                decoration: user.services.includes('decoration'),
            });
        }
        setLoading(false);
    }, [user]);

    const handleServiceToggle = (service) => {
        setServices((prev) => ({
            ...prev,
            [service]: !prev[service],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            const selectedServices = Object.keys(services).filter((service) => services[service]);

            if (selectedServices.length === 0) {
                throw new Error('Please select at least one service');
            }

            await updateServices(user.id, selectedServices);
            setSuccess('Services updated successfully');
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to update services');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <CompanyLayout><Loading /></CompanyLayout>;

    return (
        <CompanyLayout>
            <div className="page-container">
                <div style={{ marginBottom: '40px' }}>
                    <h1 className="page-title">Manage Services</h1>
                    <p className="page-subtitle">Update the services your company offers</p>
                </div>

                <div style={{ maxWidth: '600px' }}>
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        padding: '32px',
                    }}>
                        {error && (
                            <div style={{
                                background: '#fee2e2',
                                border: '1px solid #fecaca',
                                color: '#991b1b',
                                padding: '12px 16px',
                                borderRadius: '6px',
                                marginBottom: '24px',
                                fontSize: '14px',
                            }}>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div style={{
                                background: '#dcfce7',
                                border: '1px solid #86efac',
                                color: '#166534',
                                padding: '12px 16px',
                                borderRadius: '6px',
                                marginBottom: '24px',
                                fontSize: '14px',
                            }}>
                                ✓ {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '32px' }}>
                                <h2 className="section-title" style={{ marginBottom: '20px' }}>
                                    Services Offered
                                </h2>

                                <div style={{ display: 'grid', gap: '20px' }}>
                                    {[
                                        {
                                            id: 'cleaning',
                                            title: 'Cleaning Services',
                                            description: 'Professional cleaning for offices, residences, and facilities',
                                            icon: '🧹',
                                        },
                                        {
                                            id: 'decoration',
                                            title: 'Decoration Services',
                                            description: 'Interior decoration, design, and installation services',
                                            icon: '🎨',
                                        },
                                    ].map((service) => (
                                        <label
                                            key={service.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                padding: '16px',
                                                border: `2px solid ${services[service.id] ? '#2563eb' : '#e5e7eb'}`,
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                background: services[service.id] ? '#eff6ff' : '#ffffff',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={services[service.id]}
                                                onChange={() => handleServiceToggle(service.id)}
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    cursor: 'pointer',
                                                }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#111111', marginBottom: '4px' }}>
                                                    {service.icon} {service.title}
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                                    {service.description}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    type="button"
                                    onClick={() => navigate('/company/dashboard')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    type="submit"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Saving...' : 'Save Services'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </CompanyLayout>
    );
}
