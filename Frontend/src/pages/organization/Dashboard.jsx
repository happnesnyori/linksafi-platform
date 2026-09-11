import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizationLayout from '../../layouts/OrganizationLayout';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import RequestCard from '../../components/RequestCard';
import { useAuth } from '../../context/AuthContext';
import { requestService } from '../../services/requestService';
import { getCompanies } from '../../services/companyService';

export default function OrganizationDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState({ pending: 0, accepted: 0, completed: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [requestsData, statsData] = await Promise.all([
                    requestService.getRequests({ status: 'all', limit: 5 }),
                    requestService.getStats('organization'),
                ]);
                setRequests(requestsData || []);
                setStats(statsData || {});
            } catch (err) {
                setError('Failed to load dashboard');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <OrganizationLayout><Loading /></OrganizationLayout>;

    return (
        <OrganizationLayout>
            <div className="page-container">
                <div style={{ marginBottom: '40px' }}>
                    <h1 className="page-title">Welcome back, {user?.name}!</h1>
                    <p className="page-subtitle">Here's an overview of your service requests</p>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    {[
                        { label: 'Pending', value: stats.pending || 0, color: '#f59e0b' },
                        { label: 'Accepted', value: stats.accepted || 0, color: '#10b981' },
                        { label: 'Completed', value: stats.completed || 0, color: '#3b82f6' },
                        { label: 'Rejected', value: stats.rejected || 0, color: '#ef4444' },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            style={{
                                background: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '10px',
                                padding: '24px',
                                textAlign: 'center',
                            }}
                        >
                            <div style={{ fontSize: '32px', fontWeight: '700', color: stat.color, marginBottom: '8px' }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div style={{ marginBottom: '40px' }}>
                    <h2 className="section-title">Quick Actions</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={() => navigate('/find-companies')}
                        >
                            Find Companies
                        </Button>
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => navigate('/requests')}
                        >
                            View All Requests
                        </Button>
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => navigate('/profile')}
                        >
                            Edit Profile
                        </Button>
                    </div>
                </div>

                {/* Recent Requests */}
                <div>
                    <h2 className="section-title">Recent Requests</h2>
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
                                <RequestCard
                                    key={request.id}
                                    request={request}
                                    onClick={() => navigate(`/requests/${request.id}`)}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="No requests yet"
                            message="Start by finding a company and making your first service request"
                            action={{ label: 'Find Companies', onClick: () => navigate('/find-companies') }}
                        />
                    )}
                </div>
            </div>
        </OrganizationLayout>
    );
}
