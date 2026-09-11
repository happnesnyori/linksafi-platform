import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyLayout from '../../layouts/CompanyLayout';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { useAuth } from '../../context/AuthContext';

export default function CompanyProfile() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        description: '',
    });

    useEffect(() => {
        // Load current user data
        if (user) {
            setFormData({
                name: user.companyName || '',
                email: user.email || '',
                phone: user.phone || '',
                location: user.location || '',
                description: user.description || '',
            });
        }
        setLoading(false);
    }, [user]);

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
        setSuccess('');
        setSubmitting(true);

        try {
            if (!formData.name || !formData.email) {
                throw new Error('Please fill in all required fields');
            }

            // TODO: Call updateCompany API when backend is ready
            // await companyService.updateProfile(formData);

            setSuccess('Profile updated successfully');
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <CompanyLayout><Loading /></CompanyLayout>;

    return (
        <CompanyLayout>
            <div className="page-container">
                <div style={{ marginBottom: '40px' }}>
                    <h1 className="page-title">Company Profile</h1>
                    <p className="page-subtitle">Manage your company information</p>
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

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Tell us about your company, experience, and specialties..."
                                    style={{ minHeight: '120px' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    type="button"
                                    onClick={() => navigate(-1)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    type="submit"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </CompanyLayout>
    );
}
