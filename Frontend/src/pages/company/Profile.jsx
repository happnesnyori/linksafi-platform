import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Edit2,
    Images,
    CheckCircle2,
    Clock3,
    XCircle,
    Upload,
} from 'lucide-react';
import CompanyLayout from '../../layouts/CompanyLayout';
import Loading from '../../components/Loading';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { getMyCompany, updateMyCompany } from '../../services/companyService';
import { formatService, getMediaUrl } from '../../utils/helpers';

const APPROVAL_COPY = {
    pending: {
        icon: Clock3,
        title: 'Awaiting admin review',
        body: "Your company profile has been submitted and is not yet visible to organizations. An administrator reviews new companies before they're approved — this usually doesn't take long.",
    },
    approved: {
        icon: CheckCircle2,
        title: 'Approved and visible',
        body: 'Your company is approved and visible to organizations browsing SafiLink. Keep your profile and services up to date to get more requests.',
    },
    rejected: {
        icon: XCircle,
        title: 'Not approved',
        body: 'Your company was not approved by the admin team. Update your profile details and contact support if you believe this was a mistake.',
    },
    suspended: {
        icon: XCircle,
        title: 'Suspended',
        body: 'Your company has been suspended and is currently hidden from organizations. Contact support for more information.',
    },
};

export default function CompanyProfile() {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [company, setCompany] = useState(null);
    const [editing, setEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', location: '', description: '', tagline: '', serviceAreas: '', workingHours: '',
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const data = await getMyCompany();
            setCompany(data);
            setFormData({
                name: data?.name || '',
                email: data?.email || '',
                phone: data?.phone || '',
                location: data?.location || '',
                description: data?.description || '',
                tagline: data?.tagline || '',
                serviceAreas: Array.isArray(data?.service_areas) ? data.service_areas.join(', ') : '',
                workingHours: data?.working_hours || '',
            });
        } catch (err) {
            addToast(err.message || 'Failed to load company profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleLogoChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        if (!formData.name.trim() || !formData.email.trim()) {
            setError('Company name and email are required');
            return;
        }
        setSubmitting(true);
        try {
            const serviceAreas = formData.serviceAreas.split(',').map((a) => a.trim()).filter(Boolean);
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                location: formData.location.trim(),
                description: formData.description.trim(),
                tagline: formData.tagline.trim(),
                service_areas: serviceAreas,
                working_hours: formData.workingHours.trim(),
            };

            if (logoFile) {
                const form = new FormData();
                Object.entries(payload).forEach(([key, value]) => {
                    form.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
                });
                form.append('logo', logoFile);
                await updateMyCompany(form);
            } else {
                await updateMyCompany(payload);
            }

            await refreshUser();
            await load();
            setLogoFile(null);
            setLogoPreview('');
            addToast('Profile updated', 'success');
            setEditing(false);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <CompanyLayout><Loading /></CompanyLayout>;

    const category = Array.isArray(company?.services) && company.services.length
        ? formatService(company.services.includes('both') ? 'both' : company.services[0])
        : 'No category set';
    const logoUrl = company?.logo ? getMediaUrl(company.logo) : '';
    const approval = APPROVAL_COPY[company?.status] || APPROVAL_COPY.pending;
    const ApprovalIcon = approval.icon;

    if (editing) {
        return (
            <CompanyLayout>
                <div className="cp-card" style={{ maxWidth: '640px' }}>
                    {error && <div className="cp-alert cp-alert-error">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="cp-form-group">
                            <label className="cp-form-label">Company Logo</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <span className="cp-profile-logo" style={{ width: '56px', height: '56px', fontSize: '18px' }}>
                                    {logoPreview || company?.logo ? (
                                        <img src={logoPreview || getMediaUrl(company.logo)} alt="Logo preview" />
                                    ) : (
                                        (formData.name || 'C').charAt(0).toUpperCase()
                                    )}
                                </span>
                                <label className="cp-btn cp-btn-ghost cp-btn-sm" style={{ cursor: 'pointer' }}>
                                    <Upload size={13} /> {logoFile ? logoFile.name : 'Choose logo'}
                                    <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
                                </label>
                            </div>
                        </div>
                        <div className="cp-form-group">
                            <label className="cp-form-label">Company Name</label>
                            <input className="cp-form-input" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="cp-form-group">
                            <label className="cp-form-label">Email</label>
                            <input className="cp-form-input" type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="cp-form-group">
                            <label className="cp-form-label">Phone</label>
                            <input className="cp-form-input" name="phone" value={formData.phone} onChange={handleChange} />
                        </div>
                        <div className="cp-form-group">
                            <label className="cp-form-label">Location</label>
                            <input className="cp-form-input" name="location" value={formData.location} onChange={handleChange} />
                        </div>
                        <div className="cp-form-group">
                            <label className="cp-form-label">Tagline</label>
                            <input className="cp-form-input" name="tagline" value={formData.tagline} onChange={handleChange} />
                        </div>
                        <div className="cp-form-group">
                            <label className="cp-form-label">Service Areas</label>
                            <input className="cp-form-input" name="serviceAreas" value={formData.serviceAreas} onChange={handleChange} placeholder="Dar es Salaam, Dodoma" />
                        </div>
                        <div className="cp-form-group">
                            <label className="cp-form-label">Working Hours</label>
                            <textarea className="cp-form-textarea" name="workingHours" value={formData.workingHours} onChange={handleChange} style={{ minHeight: '70px' }} />
                        </div>
                        <div className="cp-form-group">
                            <label className="cp-form-label">About / Description</label>
                            <textarea className="cp-form-textarea" name="description" value={formData.description} onChange={handleChange} />
                        </div>
                        <div className="cp-form-actions">
                            <button
                                type="button"
                                className="cp-btn cp-btn-ghost"
                                onClick={() => { setEditing(false); setLogoFile(null); setLogoPreview(''); }}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="cp-btn cp-btn-primary" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </CompanyLayout>
        );
    }

    return (
        <CompanyLayout>
            <div className="cp-card cp-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                    <div className="cp-profile-hero">
                        <span className="cp-profile-logo">
                            {logoUrl ? <img src={logoUrl} alt={`${company?.name} logo`} /> : (company?.name || 'C').charAt(0).toUpperCase()}
                        </span>
                        <div>
                            <div className="cp-profile-name">{company?.name}</div>
                            <div className="cp-profile-meta">
                                {company?.location && <span><MapPin size={14} /> {company.location}</span>}
                                <span>{category}</span>
                            </div>
                        </div>
                    </div>
                    <button className="cp-btn cp-btn-primary" onClick={() => setEditing(true)}>
                        <Edit2 size={14} /> Edit Profile
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                <div>
                    <section className="cp-card cp-section">
                        <div className="cp-section-heading"><h2>About</h2></div>
                        <p style={{ fontSize: '14px', color: 'var(--cp-text-secondary)', lineHeight: 1.6 }}>
                            {company?.description || 'No description provided yet.'}
                        </p>
                    </section>

                    <section className="cp-card cp-section">
                        <div className="cp-section-heading"><h2>Contact & Experience</h2></div>
                        <div className="cp-detail-grid">
                            <div className="cp-detail-item">
                                <span>Email</span>
                                <strong><Mail size={13} style={{ marginRight: '4px', verticalAlign: '-2px' }} />{company?.email || '-'}</strong>
                            </div>
                            <div className="cp-detail-item">
                                <span>Phone</span>
                                <strong><Phone size={13} style={{ marginRight: '4px', verticalAlign: '-2px' }} />{company?.phone || '-'}</strong>
                            </div>
                            <div className="cp-detail-item">
                                <span>Working Hours</span>
                                <strong><Clock size={13} style={{ marginRight: '4px', verticalAlign: '-2px' }} />{company?.working_hours || '-'}</strong>
                            </div>
                            <div className="cp-detail-item">
                                <span>Service Areas</span>
                                <strong>{Array.isArray(company?.service_areas) && company.service_areas.length ? company.service_areas.join(', ') : '-'}</strong>
                            </div>
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <button className="cp-text-btn" onClick={() => navigate('/company/gallery')}>
                                <Images size={14} /> View gallery photos
                            </button>
                        </div>
                    </section>
                </div>

                <section className="cp-card">
                    <div className="cp-section-heading"><h2>Approval Status</h2></div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <span className={`cp-status-dot ${company?.status}`} style={{ width: '10px', height: '10px', marginTop: '4px' }} />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <ApprovalIcon size={15} /> {approval.title}
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--cp-text-secondary)', lineHeight: 1.6, marginTop: '6px' }}>
                                {approval.body}
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </CompanyLayout>
    );
}
