import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, MapPin, CalendarDays } from 'lucide-react';
import { useToast } from '../../components/Toast';
import adminService from '../../services/adminService';
import { formatService } from '../../utils/helpers';
import '../../styles/admin.css';

const toList = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value) return [];
    return String(value).split(',').map((item) => item.trim()).filter(Boolean);
};

export default function CompaniesPending() {
    const { addToast } = useToast();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const load = async () => {
        try {
            setLoading(true);
            const data = await adminService.getCompanies({ status: 'pending' }, 1, 100);
            setCompanies(data.results || data || []);
        } catch (err) {
            addToast('Failed to load pending companies', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleDecision = async (company, action) => {
        setActionLoading(company.id);
        const previous = companies;
        // Optimistic: remove immediately from the queue.
        setCompanies((current) => current.filter((c) => c.id !== company.id));
        try {
            if (action === 'approve') {
                await adminService.approveCompany(company.id);
                addToast(`${company.name} approved`, 'success');
            } else {
                await adminService.rejectCompany(company.id);
                addToast(`${company.name} rejected`, 'success');
            }
        } catch (err) {
            // Reconcile: roll back on failure.
            setCompanies(previous);
            addToast(err.data?.message || err.message || `Failed to ${action} company`, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Pending Approvals</h1>
                    <p className="admin-page-subtitle">Review new company submissions before they go live</p>
                </div>
            </div>

            {loading ? (
                <div className="admin-loading"><div className="spinner" /></div>
            ) : companies.length === 0 ? (
                <div className="admin-empty-state">
                    <div className="admin-empty-state-icon"><CheckCircle size={28} /></div>
                    <h3>No pending companies</h3>
                    <p>New company registrations will show up here for review.</p>
                </div>
            ) : (
                <div className="admin-pending-grid">
                    {companies.map((company) => {
                        const category = toList(company.services)
                            .map((s) => formatService(s))
                            .join(', ') || 'No services selected';
                        const services = Array.isArray(company.service_items) ? company.service_items : [];
                        const busy = actionLoading === company.id;

                        return (
                            <div key={company.id} className="admin-pending-card">
                                <div className="admin-pending-card-head">
                                    <span className="admin-pending-logo">
                                        {company.logo ? (
                                            <img src={company.logo} alt={`${company.name} logo`} />
                                        ) : (company.name || 'C').charAt(0).toUpperCase()}
                                    </span>
                                    <div>
                                        <div className="admin-pending-name">{company.name}</div>
                                        <div className="admin-pending-meta">
                                            <span>{category}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="admin-pending-meta">
                                    {company.location && <span><MapPin size={13} style={{ verticalAlign: '-2px' }} /> {company.location}</span>}
                                    <span><CalendarDays size={13} style={{ verticalAlign: '-2px' }} /> Submitted {formatDate(company.created_at)}</span>
                                </div>

                                {company.description && (
                                    <p className="admin-pending-about">{company.description}</p>
                                )}

                                {services.length > 0 && (
                                    <div className="admin-pending-services">
                                        {services.map((svc) => (
                                            <span key={svc.id} className="admin-pending-service-tag">{svc.name}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="admin-pending-actions">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => handleDecision(company, 'reject')}
                                        disabled={busy}
                                    >
                                        <XCircle size={15} /> Reject
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleDecision(company, 'approve')}
                                        disabled={busy}
                                    >
                                        <CheckCircle size={15} /> Approve
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
