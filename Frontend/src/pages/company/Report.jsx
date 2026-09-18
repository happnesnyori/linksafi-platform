import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Sparkles } from 'lucide-react';
import Loading from '../../components/Loading';
import { useToast } from '../../components/Toast';
import { requestService } from '../../services/requestService';
import { getMyCompany, getCompanyGallery } from '../../services/companyService';
import { formatDate, formatService, getMediaUrl } from '../../utils/helpers';
import '../../styles/companyPortal.css';
import '../../styles/companyReport.css';

const STATUS_LABELS = {
    pending: 'New',
    accepted: 'In Progress',
    completed: 'Completed',
    rejected: 'Declined',
};

export default function CompanyReport() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [company, setCompany] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentRequests, setRecentRequests] = useState([]);
    const [galleryCount, setGalleryCount] = useState(0);

    useEffect(() => {
        const load = async () => {
            try {
                const [companyData, statsData, requestsData, gallery] = await Promise.all([
                    getMyCompany(),
                    requestService.getStats(),
                    requestService.getCompanyRequests({ limit: 20 }),
                    getCompanyGallery(),
                ]);
                setCompany(companyData);
                setStats(statsData);
                const list = Array.isArray(requestsData) ? requestsData : requestsData?.results || [];
                setRecentRequests(list.slice(0, 10));
                setGalleryCount(Array.isArray(gallery) ? gallery.length : 0);
            } catch (err) {
                addToast(err.message || 'Failed to load report data', 'error');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [addToast]);

    if (loading) {
        return (
            <div className="company-portal">
                <div className="cp-loading-page"><Loading /></div>
            </div>
        );
    }

    const logoUrl = company?.logo ? getMediaUrl(company.logo) : '';
    const serviceItems = Array.isArray(company?.service_items) ? company.service_items : [];
    const generatedAt = new Date().toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    return (
        <div className="company-portal cp-report-page">
            <div className="cp-report-toolbar no-print">
                <button className="cp-btn cp-btn-ghost cp-btn-sm" onClick={() => navigate(-1)}>
                    <ArrowLeft size={14} /> Back
                </button>
                <button className="cp-btn cp-btn-primary cp-btn-sm" onClick={() => window.print()}>
                    <Printer size={14} /> Print / Save as PDF
                </button>
            </div>

            <div className="cp-report-sheet">
                <header className="cp-report-header">
                    <div className="cp-report-brand">
                        <span className="cp-sidebar-logo-icon" style={{ background: 'var(--cp-teal)' }}>
                            <Sparkles size={16} color="#fff" />
                        </span>
                        <span className="cp-logo-word" style={{ color: 'var(--cp-text-primary)' }}>SafiLink</span>
                    </div>
                    <div className="cp-report-generated">Generated {generatedAt}</div>
                </header>

                <section className="cp-report-company">
                    <span className="cp-profile-logo" style={{ width: '64px', height: '64px' }}>
                        {logoUrl ? <img src={logoUrl} alt={`${company?.name} logo`} /> : (company?.name || 'C').charAt(0).toUpperCase()}
                    </span>
                    <div>
                        <h1>{company?.name}</h1>
                        <p className="cp-report-tagline">{company?.tagline || company?.location}</p>
                        <span className={`cp-badge status-${company?.status === 'approved' ? 'completed' : company?.status === 'pending' ? 'in-progress' : 'declined'}`}>
                            {company?.status}
                        </span>
                    </div>
                </section>

                <section className="cp-report-section">
                    <h2>Company Details</h2>
                    <div className="cp-detail-grid">
                        <div className="cp-detail-item"><span>Email</span><strong>{company?.email || '-'}</strong></div>
                        <div className="cp-detail-item"><span>Phone</span><strong>{company?.phone || '-'}</strong></div>
                        <div className="cp-detail-item"><span>Location</span><strong>{company?.location || '-'}</strong></div>
                        <div className="cp-detail-item"><span>Working Hours</span><strong>{company?.working_hours || '-'}</strong></div>
                    </div>
                    {company?.description && <p className="cp-report-desc">{company.description}</p>}
                </section>

                <section className="cp-report-section">
                    <h2>Services Offered</h2>
                    {serviceItems.length > 0 ? (
                        <div className="cp-tag-row">
                            {serviceItems.map((svc) => <span key={svc.id} className="cp-tag">{svc.name}</span>)}
                        </div>
                    ) : <p className="cp-report-desc">No services selected yet.</p>}
                </section>

                <section className="cp-report-section">
                    <h2>Performance Summary</h2>
                    <div className="cp-report-stats">
                        <div><strong>{stats?.total ?? 0}</strong><span>Total Requests</span></div>
                        <div><strong>{stats?.pending ?? 0}</strong><span>Pending</span></div>
                        <div><strong>{stats?.accepted ?? 0}</strong><span>Active / In Progress</span></div>
                        <div><strong>{stats?.completed ?? 0}</strong><span>Completed</span></div>
                        <div><strong>{stats?.rejected ?? 0}</strong><span>Declined</span></div>
                        <div><strong>{company?.profile_views ?? 0}</strong><span>Profile Views</span></div>
                        <div><strong>{company?.reviews_count ?? 0}</strong><span>Reviews</span></div>
                        <div><strong>{galleryCount}</strong><span>Gallery Photos</span></div>
                    </div>
                </section>

                <section className="cp-report-section">
                    <h2>Recent Service Requests</h2>
                    {recentRequests.length > 0 ? (
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
                                {recentRequests.map((r) => (
                                    <tr key={r.id}>
                                        <td>{r.organization?.name || r.guest_name || 'Organization'}</td>
                                        <td>{formatService(r.service)}</td>
                                        <td>{formatDate(r.requested_date)}</td>
                                        <td>{STATUS_LABELS[r.status] || r.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p className="cp-report-desc">No service requests yet.</p>}
                </section>

                <footer className="cp-report-footer">
                    Generated from SafiLink — this report reflects your company's data at the time it was generated.
                </footer>
            </div>
        </div>
    );
}
