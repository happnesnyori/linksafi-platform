import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Download } from 'lucide-react';
import CompanyLayout from '../../layouts/CompanyLayout';
import Loading from '../../components/Loading';
import { useToast } from '../../components/Toast';
import { requestService } from '../../services/requestService';
import { downloadCsv, formatDate, formatService } from '../../utils/helpers';

const STATUS_LABELS = {
    pending: { label: 'New', className: 'status-new' },
    accepted: { label: 'In Progress', className: 'status-in-progress' },
    completed: { label: 'Completed', className: 'status-completed' },
    rejected: { label: 'Declined', className: 'status-declined' },
};

const FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'New' },
    { value: 'accepted', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Declined' },
];

export default function CompanyRequests() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setLoading(true);
                const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
                const data = await requestService.getCompanyRequests(filters);
                setRequests(Array.isArray(data) ? data : data?.results || []);
            } catch (err) {
                addToast('Failed to load requests', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [statusFilter, addToast]);

    if (loading) return <CompanyLayout><Loading /></CompanyLayout>;

    const handleExportCsv = () => {
        if (requests.length === 0) return;
        const rows = requests.map((request) => ({
            Organization: request.organization?.name || request.guest_name || 'Organization',
            Service: formatService(request.service),
            Date: formatDate(request.requested_date),
            Status: (STATUS_LABELS[request.status] || STATUS_LABELS.pending).label,
            Location: request.location || '',
            Description: request.description || '',
        }));
        downloadCsv(`service-requests-${statusFilter}.csv`, rows);
    };

    return (
        <CompanyLayout>
            <div className="cp-card">
                <div className="cp-section-heading">
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {FILTERS.map((filter) => (
                            <button
                                key={filter.value}
                                className={`cp-btn cp-btn-sm ${statusFilter === filter.value ? 'cp-btn-primary' : 'cp-btn-ghost'}`}
                                onClick={() => setStatusFilter(filter.value)}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                    <button className="cp-btn cp-btn-ghost cp-btn-sm" onClick={handleExportCsv} disabled={requests.length === 0}>
                        <Download size={13} /> Export CSV
                    </button>
                </div>

                {requests.length > 0 ? (
                    <div className="cp-table-wrap">
                        <table className="cp-table">
                            <thead>
                                <tr>
                                    <th>Organization</th>
                                    <th>Service Requested</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((request) => {
                                    const status = STATUS_LABELS[request.status] || STATUS_LABELS.pending;
                                    return (
                                        <tr key={request.id}>
                                            <td>{request.organization?.name || request.guest_name || 'Organization'}</td>
                                            <td>{formatService(request.service)}</td>
                                            <td>{formatDate(request.requested_date)}</td>
                                            <td><span className={`cp-badge ${status.className}`}>{status.label}</span></td>
                                            <td>
                                                <button
                                                    className="cp-icon-btn"
                                                    style={{ width: '32px', height: '32px' }}
                                                    aria-label="View request"
                                                    onClick={() => navigate(`/company/requests/${request.id}`)}
                                                >
                                                    <Eye size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="cp-empty">
                        No requests found. Organizations select your company and send requests here — you can't browse or choose requests yourself.
                    </div>
                )}
            </div>
        </CompanyLayout>
    );
}
