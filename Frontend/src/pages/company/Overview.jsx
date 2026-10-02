import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock,
    Briefcase,
    CheckCircle2,
    Eye,
    ArrowUpRight,
    CheckCircle,
    Circle,
    FileDown,
    Images,
    UserCog,
    Sparkles,
} from 'lucide-react';
import CompanyLayout from '../../layouts/CompanyLayout';
import Loading from '../../components/Loading';
import Lightbox from '../../components/Lightbox';
import { useToast } from '../../components/Toast';
import { requestService } from '../../services/requestService';
import { getMyCompany, getCompanyGallery } from '../../services/companyService';
import { formatDate, formatService, getMediaUrl } from '../../utils/helpers';

const STATUS_LABELS = {
    pending: { label: 'New', className: 'status-new' },
    accepted: { label: 'In Progress', className: 'status-in-progress' },
    completed: { label: 'Completed', className: 'status-completed' },
    rejected: { label: 'Declined', className: 'status-declined' },
};

const isThisMonth = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

export default function CompanyOverview() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [company, setCompany] = useState(null);
    const [requests, setRequests] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [lightboxGroupIndex, setLightboxGroupIndex] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [companyData, requestsData, galleryData] = await Promise.all([
                getMyCompany(),
                requestService.getCompanyRequests(),
                getCompanyGallery(),
            ]);
            setCompany(companyData);
            setRequests(Array.isArray(requestsData) ? requestsData : requestsData?.results || []);
            setGallery(Array.isArray(galleryData) ? galleryData : []);
        } catch (err) {
            addToast('Failed to load overview', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) return <CompanyLayout><Loading /></CompanyLayout>;

    const pending = requests.filter((r) => r.status === 'pending').length;
    const active = requests.filter((r) => r.status === 'accepted').length;
    const completedThisMonth = requests.filter(
        (r) => r.status === 'completed' && isThisMonth(r.updated_at)
    ).length;
    const profileViews = company?.profile_views ?? 0;

    const recentRequests = [...requests]
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 5);

    const serviceItems = Array.isArray(company?.service_items) ? company.service_items : [];

    const checklist = [
        { key: 'description', label: 'Description added', done: Boolean(company?.description) },
        { key: 'location', label: 'Location added', done: Boolean(company?.location) },
        { key: 'phone', label: 'Phone number added', done: Boolean(company?.phone) },
        { key: 'logo', label: 'Logo uploaded', done: Boolean(company?.logo) },
        { key: 'services', label: 'At least one service selected', done: serviceItems.length > 0 },
        { key: 'gallery', label: 'At least one gallery photo', done: gallery.length > 0 },
    ];
    const completeness = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);

    const logoUrl = company?.logo ? getMediaUrl(company.logo) : '';
    const companyInitial = (company?.name || 'C').charAt(0).toUpperCase();
    const isApproved = company?.status === 'approved';
    const galleryPreview = gallery.slice(0, 4);
    const lightboxGroups = galleryPreview.map((image) => ({
        id: image.id,
        title: image.title,
        items: [
            { src: getMediaUrl(image.image), title: image.title, description: image.description },
            ...(image.sub_images || []).map((sub) => ({
                src: getMediaUrl(sub.image),
                title: image.title,
                description: sub.description || image.description,
            })),
        ],
    }));

    return (
        <CompanyLayout>
            <section className="cp-welcome-card">
                <div className="cp-welcome-left">
                    <span className="cp-welcome-avatar">
                        {logoUrl ? <img src={logoUrl} alt={company?.name || 'Company logo'} /> : companyInitial}
                    </span>
                    <div className="cp-welcome-text">
                        <h2>Welcome back, {company?.name || 'there'}</h2>
                        <p>Here's what's happening with your SafiLink profile today.</p>
                        <span className="cp-welcome-status">
                            {isApproved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {isApproved ? 'Approved & Live' : 'Pending Approval'}
                        </span>
                    </div>
                </div>
                <div className="cp-welcome-actions">
                    <button className="cp-btn cp-btn-ghost" onClick={() => navigate('/company/profile')}>
                        <UserCog size={15} /> Edit Profile
                    </button>
                    <button className="cp-btn cp-btn-ghost" onClick={() => navigate('/company/gallery')}>
                        <Images size={15} /> Add Photos
                    </button>
                    <button className="cp-btn cp-btn-ghost" onClick={() => navigate('/company/report')}>
                        <FileDown size={15} /> Download Report
                    </button>
                </div>
            </section>

            <div className="cp-stats-grid">
                <StatCard icon={Clock} label="Pending Requests" value={pending} variant="amber" />
                <StatCard icon={Briefcase} label="Active Jobs" value={active} variant="blue" />
                <StatCard icon={CheckCircle2} label="Completed This Month" value={completedThisMonth} variant="green" />
                <StatCard icon={Eye} label="Profile Views" value={profileViews} />
            </div>

            <section className="cp-section cp-card">
                <div className="cp-section-heading">
                    <h2>Recent Service Requests</h2>
                    <button className="cp-text-btn" onClick={() => navigate('/company/requests')}>
                        View all <ArrowUpRight size={14} />
                    </button>
                </div>

                {recentRequests.length > 0 ? (
                    <div className="cp-table-wrap">
                        <table className="cp-table">
                            <thead>
                                <tr>
                                    <th>Organization</th>
                                    <th>Service</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentRequests.map((r) => {
                                    const status = STATUS_LABELS[r.status] || STATUS_LABELS.pending;
                                    return (
                                        <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/company/requests/${r.id}`)}>
                                            <td>{r.organization?.name || r.guest_name || 'Organization'}</td>
                                            <td>{formatService(r.service)}</td>
                                            <td>{formatDate(r.requested_date)}</td>
                                            <td><span className={`cp-badge ${status.className}`}>{status.label}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="cp-empty">No service requests yet.</div>
                )}
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                <section className="cp-card">
                    <div className="cp-section-heading">
                        <h2>Profile Completeness</h2>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cp-teal)' }}>{completeness}%</span>
                    </div>
                    <div className="cp-progress-track">
                        <div className="cp-progress-fill" style={{ width: `${completeness}%` }} />
                    </div>
                    <ul className="cp-checklist">
                        {checklist.map((item) => (
                            <li key={item.key} className={item.done ? 'done' : ''}>
                                <span className="cp-check-icon">
                                    {item.done ? <CheckCircle size={14} /> : <Circle size={14} />}
                                </span>
                                {item.label}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="cp-card">
                    <div className="cp-section-heading">
                        <h2>Your Services</h2>
                        <button className="cp-text-btn" onClick={() => navigate('/company/services')}>
                            Manage <ArrowUpRight size={14} />
                        </button>
                    </div>
                    {serviceItems.length > 0 ? (
                        <div className="cp-tag-row">
                            {serviceItems.map((svc) => (
                                <span key={svc.id} className="cp-tag">{svc.name}</span>
                            ))}
                        </div>
                    ) : (
                        <div className="cp-empty">No services selected yet.</div>
                    )}
                </section>
            </div>

            <section className="cp-card" style={{ marginTop: '24px' }}>
                <div className="cp-section-heading">
                    <h2>Gallery</h2>
                    <button className="cp-text-btn" onClick={() => navigate('/company/gallery')}>
                        Manage <ArrowUpRight size={14} />
                    </button>
                </div>
                {galleryPreview.length > 0 ? (
                    <div className="cp-gallery-preview-grid">
                        {galleryPreview.map((image, imageIndex) => (
                            <button
                                key={image.id}
                                type="button"
                                className="cp-gallery-preview-item"
                                onClick={() => setLightboxGroupIndex(imageIndex)}
                                aria-label={`View ${image.title || 'gallery image'} full size`}
                            >
                                <img src={getMediaUrl(image.image)} alt={image.title || `${company?.name || 'Company'} work`} />
                                {image.sub_images?.length > 0 && (
                                    <span className="cp-gallery-preview-badge">+{image.sub_images.length}</span>
                                )}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="cp-empty">
                        <Sparkles size={20} style={{ marginBottom: '8px' }} />
                        <div>No gallery photos yet — add a few to showcase your work.</div>
                    </div>
                )}
            </section>

            <Lightbox
                groups={lightboxGroups}
                groupIndex={lightboxGroupIndex}
                onClose={() => setLightboxGroupIndex(null)}
                onNavigateGroup={setLightboxGroupIndex}
            />
        </CompanyLayout>
    );
}

function StatCard({ icon: Icon, label, value, variant }) {
    return (
        <div className="cp-stat-card">
            <span className={`cp-stat-icon ${variant || ''}`}><Icon size={17} /></span>
            <span className="cp-stat-value">{value}</span>
            <span className="cp-stat-label">{label}</span>
        </div>
    );
}
