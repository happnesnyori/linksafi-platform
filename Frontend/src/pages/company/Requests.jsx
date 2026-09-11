import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyLayout from '../../layouts/CompanyLayout';
import RequestCard from '../../components/RequestCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { requestService } from '../../services/requestService';

export default function CompanyRequests() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setLoading(true);
                const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
                const data = await requestService.getCompanyRequests(filters);
                setRequests(data || []);
            } catch (err) {
                setError('Failed to load requests');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [statusFilter]);

    if (loading) return <CompanyLayout><Loading /></CompanyLayout>;

    return (
        <CompanyLayout>
            <div className="page-container">
                <div style={{ marginBottom: '40px' }}>
                    <h1 className="page-title">Service Requests</h1>
                    <p className="page-subtitle">Manage incoming service requests</p>
                </div>

                {/* Status Filter */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111111', marginBottom: '12px' }}>
                        Filter by Status
                    </div>
                    <div className="service-selector">
                        {[
                            { value: 'all', label: 'All Requests' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'accepted', label: 'Accepted' },
                            { value: 'rejected', label: 'Rejected' },
                            { value: 'completed', label: 'Completed' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`service-option ${statusFilter === option.value ? 'active' : ''}`}
                                onClick={() => setStatusFilter(option.value)}
                            >
                                <div className="service-option-label">{option.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Requests List */}
                {error && (
                    <div style={{
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        color: '#991b1b',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                    }}>
                        {error}
                    </div>
                )}

                {requests.length > 0 ? (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {requests.map((request) => (
                            <div key={request.id} onClick={() => navigate(`/company/requests/${request.id}`)}>
                                <RequestCard request={request} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No requests found"
                        message="Service requests from organizations will appear here"
                    />
                )}
            </div>
        </CompanyLayout>
    );
}
