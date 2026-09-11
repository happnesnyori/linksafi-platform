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
        budget: '',
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
            if (!formData.serviceType || !formData.description || !formData.preferredDate) {
                throw new Error('Please fill in all required fields');
            }

            await requestService.createRequest(companyId, formData);
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
                <div className="page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <h2 className="page-title">Company not found</h2>
                    <Button variant="primary" onClick={() => navigate('/find-companies')}>
                        Back to Companies
                    </Button>
                </div>
            </OrganizationLayout>
        );
    }

    return (
        <OrganizationLayout>
            <div className="page-container">
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '20px',
                    }}
                >
                    ← Back
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }} className="responsive-grid">
                    {/* Company Info */}
                    <div>
                        <h1 className="page-title">{company.name}</h1>
                        <p className="page-subtitle">{company.description}</p>
                        <div style={{ marginTop: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>Location</div>
                                <div style={{ fontSize: '14px', color: '#111111', marginTop: '4px' }}>{company.location}</div>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>Email</div>
                                <div style={{ fontSize: '14px', color: '#111111', marginTop: '4px' }}>{company.email}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>Phone</div>
                                <div style={{ fontSize: '14px', color: '#111111', marginTop: '4px' }}>{company.phone}</div>
                            </div>
                        </div>
                    </div>

                    {/* Request Form */}
                    <div>
                        <div style={{
                            background: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '10px',
                            padding: '24px',
                        }}>
                            <h2 className="section-title">Request Service</h2>

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

                            <form onSubmit={handleSubmit} className="form">
                                <div className="form-group">
                                    <label className="form-label required">Service Type</label>
                                    <select
                                        className="form-select"
                                        name="serviceType"
                                        value={formData.serviceType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select service</option>
                                        <option value="cleaning">Cleaning</option>
                                        <option value="decoration">Decoration</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Description</label>
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
                                    <label className="form-label required">Preferred Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        name="preferredDate"
                                        value={formData.preferredDate}
                                        onChange={handleChange}
                                        required
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

                                <div className="form-group">
                                    <label className="form-label">Budget (Optional)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleChange}
                                        placeholder="Max budget in SAR"
                                    />
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
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </OrganizationLayout>
    );
}
