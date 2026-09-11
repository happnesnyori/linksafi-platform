import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OrganizationLayout from '../../layouts/OrganizationLayout';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import { requestService } from '../../services/requestService';
import { formatDate } from '../../utils/helpers';

export default function RequestDetails() {
    const navigate = useNavigate();
    const { requestId } = useParams();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                setLoading(true);
                const data = await requestService.getRequestById(requestId);
                setRequest(data);
            } catch (err) {
                setError('Failed to load request details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRequest();
    }, [requestId]);

    if (loading) return <OrganizationLayout><Loading /></OrganizationLayout>;

    if (!request) {
        return (
            <OrganizationLayout>
                <div className="page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <h2 className="page-title">Request not found</h2>
                    <Button variant="primary" onClick={() => navigate('/requests')}>
                        Back to Requests
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }} className="responsive-grid">
                    {/* Main Details */}
                    <div>
                        <div style={{ marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                <h1 className="page-title">Request #{request.id}</h1>
                                <StatusBadge status={request.status} />
                            </div>
                            <p className="page-subtitle">Created on {formatDate(request.createdAt)}</p>
                        </div>

                        {/* Company Info */}
                        <div style={{ marginBottom: '40px' }}>
                            <h2 className="section-title">Company</h2>
                            <div style={{
                                background: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                borderRadius: '10px',
                                padding: '20px',
                            }}>
                                <div style={{ fontSize: '18px', fontWeight: '600', color: '#111111', marginBottom: '8px' }}>
                                    {request.company?.name}
                                </div>
                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                                    {request.company?.email} • {request.company?.phone}
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => navigate(`/companies/${request.company?.id}`)}
                                >
                                    View Company Profile
                                </Button>
                            </div>
                        </div>

                        {/* Request Details */}
                        <div>
                            <h2 className="section-title">Request Details</h2>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>Service Type</div>
                                    <div style={{ fontSize: '14px', color: '#111111', marginTop: '4px', textTransform: 'capitalize' }}>
                                        {request.serviceType}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>Preferred Date</div>
                                    <div style={{ fontSize: '14px', color: '#111111', marginTop: '4px' }}>
                                        {formatDate(request.preferredDate)}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>Location</div>
                                    <div style={{ fontSize: '14px', color: '#111111', marginTop: '4px' }}>
                                        {request.location || 'Not specified'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>Budget</div>
                                    <div style={{ fontSize: '14px', color: '#111111', marginTop: '4px' }}>
                                        {request.budget ? `${request.budget} SAR` : 'Not specified'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description & Response */}
                    <div>
                        <div style={{
                            background: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '10px',
                            padding: '24px',
                        }}>
                            <h2 className="section-title">Description</h2>
                            <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '40px' }}>
                                {request.description}
                            </p>

                            {/* Company Response */}
                            {request.companyResponse && (
                                <>
                                    <h2 className="section-title">Company Response</h2>
                                    <div style={{
                                        background: '#f0fdf4',
                                        border: '1px solid #dcfce7',
                                        borderRadius: '10px',
                                        padding: '16px',
                                        marginBottom: '40px',
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#166534', fontWeight: '600', marginBottom: '8px' }}>
                                            Responded on {formatDate(request.companyResponseDate)}
                                        </div>
                                        <p style={{ color: '#166534', lineHeight: '1.6' }}>
                                            {request.companyResponse}
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Status Actions */}
                            {request.status === 'pending' && (
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <Button variant="secondary" fullWidth>
                                        Cancel Request
                                    </Button>
                                </div>
                            )}

                            {request.status === 'accepted' && (
                                <div style={{
                                    background: '#ecfdf5',
                                    border: '1px solid #d1fae5',
                                    borderRadius: '10px',
                                    padding: '16px',
                                    color: '#065f46',
                                }}>
                                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>✓ Company Accepted</div>
                                    <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                                        The company has accepted your request. They will contact you soon to discuss details and scheduling.
                                    </p>
                                </div>
                            )}

                            {request.status === 'rejected' && (
                                <div style={{
                                    background: '#fef2f2',
                                    border: '1px solid #fee2e2',
                                    borderRadius: '10px',
                                    padding: '16px',
                                    color: '#991b1b',
                                }}>
                                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>✗ Company Rejected</div>
                                    <p style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '16px' }}>
                                        Unfortunately, the company declined this request. Try finding another company offering similar services.
                                    </p>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => navigate('/find-companies')}
                                    >
                                        Find Another Company
                                    </Button>
                                </div>
                            )}

                            {request.status === 'completed' && (
                                <div style={{
                                    background: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '10px',
                                    padding: '16px',
                                    color: '#1e40af',
                                }}>
                                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>✓ Completed</div>
                                    <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                                        This request has been completed. Thank you for using LinkSafi!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <div style={{
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        color: '#991b1b',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        marginTop: '20px',
                    }}>
                        {error}
                    </div>
                )}
            </div>
        </OrganizationLayout>
    );
}
