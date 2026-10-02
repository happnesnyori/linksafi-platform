import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import CompanyLayout from '../../layouts/CompanyLayout';
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
    const [responding, setResponding] = useState(false);
    const [response, setResponse] = useState('');
    const [responseMode, setResponseMode] = useState(false);

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

    const handleAccept = async () => {
        try {
            setResponding(true);
            const updated = await requestService.acceptRequest(requestId);
            setRequest((current) => ({ ...current, ...updated }));
        } catch (err) {
            setError('Failed to accept request');
        } finally {
            setResponding(false);
        }
    };

    const handleReject = async () => {
        try {
            setResponding(true);
            const updated = await requestService.rejectRequest(requestId);
            setRequest((current) => ({ ...current, ...updated }));
        } catch (err) {
            setError('Failed to reject request');
        } finally {
            setResponding(false);
        }
    };

    const handleSubmitResponse = async (event) => {
        event.preventDefault();
        if (!response.trim()) return;

        try {
            setResponding(true);
            const updated = await requestService.respondToRequest(requestId, { response_note: response });
            setRequest((current) => ({ ...current, ...updated }));
            setResponse('');
            setResponseMode(false);
        } catch (err) {
            setError('Failed to submit response');
        } finally {
            setResponding(false);
        }
    };

    if (loading) return <CompanyLayout><Loading /></CompanyLayout>;

    if (!request) {
        return (
            <CompanyLayout>
                <div className="page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <h2 className="page-title">Request not found</h2>
                    <Button variant="primary" onClick={() => navigate('/company/requests')}>Back to Requests</Button>
                </div>
            </CompanyLayout>
        );
    }

    return (
        <CompanyLayout>
            <div className="page-container">
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        marginBottom: '20px',
                    }}
                >
                    ← Back
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }} className="responsive-grid">
                    <div>
                        <div style={{ marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                <h1 className="page-title">Request #{request.id}</h1>
                                <StatusBadge status={request.status} />
                            </div>
                            <p className="page-subtitle">From {request.contact_name || request.organization?.name || request.guest_name || 'Guest'}</p>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h2 className="section-title">Contact</h2>
                            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' }}>
                                <div style={{ fontSize: '18px', fontWeight: 600, color: '#111111', marginBottom: '8px' }}>
                                    {request.contact_name || request.organization?.name || request.guest_name || 'Guest'}
                                </div>
                                {request.organization?.organizationType && (
                                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                                        Type: {request.organization.organizationType}
                                    </div>
                                )}
                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                                    {(request.contact_email || request.organization?.email) || 'No email provided'}
                                    {' • '}
                                    {(request.contact_phone || request.organization?.phone) || 'No phone provided'}
                                </div>
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: '#166534',
                                        background: '#dcfce7',
                                        padding: '4px 10px',
                                        borderRadius: '999px',
                                        marginBottom: '16px',
                                    }}
                                >
                                    {request.preferred_contact === 'phone' ? <Phone size={12} /> : <Mail size={12} />}
                                    Prefers to be contacted by {request.preferred_contact === 'phone' ? 'phone — call them directly' : 'email — sent automatically when you respond'}
                                </div>
                                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                    Location: {request.organization?.location || request.location || 'Not specified'}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="section-title">Request Details</h2>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Service Type</div>
                                    <div style={{ fontSize: '14px', color: '#111111', marginTop: '4px', textTransform: 'capitalize' }}>
                                        {request.service || request.serviceType}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Preferred Date</div>
                                    <div style={{ fontSize: '14px', color: '#111111', marginTop: '4px' }}>
                                        {formatDate(request.requested_date || request.preferredDate)}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Location</div>
                                    <div style={{ fontSize: '14px', color: '#111111', marginTop: '4px' }}>
                                        {request.location || 'Not specified'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px' }}>
                            <h2 className="section-title">Description</h2>
                            <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '40px' }}>
                                {request.description}
                            </p>

                            {error && (
                                <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '6px', marginBottom: '24px', fontSize: '14px' }}>
                                    {error}
                                </div>
                            )}

                            {request.status === 'pending' && (
                                <div style={{ display: 'grid', gap: '12px', marginBottom: '40px' }}>
                                    <Button variant="primary" fullWidth onClick={handleAccept} disabled={responding}>
                                        {responding ? 'Processing...' : 'Accept Request'}
                                    </Button>
                                    <Button variant="danger" fullWidth onClick={handleReject} disabled={responding}>
                                        Reject Request
                                    </Button>
                                </div>
                            )}

                            <h2 className="section-title">Response</h2>

                            {request.response_note && (
                                <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                                    <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600, marginBottom: '8px' }}>
                                        Your response
                                    </div>
                                    <p style={{ color: '#166534', lineHeight: '1.6', fontSize: '14px' }}>
                                        {request.response_note}
                                    </p>
                                </div>
                            )}

                            {!responseMode ? (
                                <Button variant="secondary" fullWidth onClick={() => setResponseMode(true)}>
                                    Add Response
                                </Button>
                            ) : (
                                <form onSubmit={handleSubmitResponse} className="form">
                                    <div className="form-group">
                                        <label className="form-label">Your Response</label>
                                        <textarea
                                            className="form-textarea"
                                            value={response}
                                            onChange={(event) => setResponse(event.target.value)}
                                            placeholder="Send a message to the organization about their request..."
                                            style={{ minHeight: '100px' }}
                                            required
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <Button variant="secondary" type="button" onClick={() => setResponseMode(false)}>Cancel</Button>
                                        <Button variant="primary" type="submit" disabled={responding}>
                                            {responding ? 'Sending...' : 'Send Response'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CompanyLayout>
    );
}
