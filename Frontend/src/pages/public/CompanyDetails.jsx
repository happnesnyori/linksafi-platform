import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Mail, Phone, ArrowLeft } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { getCompanyById } from '../../services/companyService';

export default function CompanyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCompany();
    }, [id]);

    const loadCompany = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getCompanyById(id);
            setCompany(response);
        } catch (err) {
            setError(err.message || 'Failed to load company');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestService = () => {
        navigate(`/request-service/${id}`);
    };

    if (loading) {
        return <PublicLayout><Loading message="Loading company..." /></PublicLayout>;
    }

    if (error || !company) {
        return (
            <PublicLayout>
                <div className="page-container">
                    <EmptyState
                        title="Company not found"
                        message={error || 'Unable to load this company.'}
                        action={<Button variant="primary" onClick={() => navigate('/companies')}>Back to Companies</Button>}
                    />
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="page-container">
                <button
                    onClick={() => navigate('/companies')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <ArrowLeft size={18} />
                    Back to Companies
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                    {/* Company Info */}
                    <div>
                        {company.logo ? (
                            <img
                                src={company.logo}
                                alt={company.name}
                                style={{
                                    width: '100%',
                                    height: '300px',
                                    objectFit: 'cover',
                                    borderRadius: '10px',
                                    marginBottom: '24px',
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: '100%',
                                    height: '300px',
                                    background: '#2563eb',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '64px',
                                    fontWeight: 700,
                                    borderRadius: '10px',
                                    marginBottom: '24px',
                                }}
                            >
                                {company.name?.charAt(0) || '?'}
                            </div>
                        )}

                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111111', marginBottom: '12px' }}>
                            {company.name}
                        </h1>

                        <div style={{ marginBottom: '24px' }}>
                            {company.location && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: '#6b7280' }}>
                                    <MapPin size={20} color="#2563eb" />
                                    <span>{company.location}</span>
                                </div>
                            )}

                            {company.email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: '#6b7280' }}>
                                    <Mail size={20} color="#2563eb" />
                                    <a href={`mailto:${company.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                                        {company.email}
                                    </a>
                                </div>
                            )}

                            {company.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#6b7280' }}>
                                    <Phone size={20} color="#2563eb" />
                                    <a href={`tel:${company.phone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                                        {company.phone}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div>
                        <div className="section-content" style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111111', marginBottom: '12px' }}>
                                About
                            </h2>
                            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>
                                {company.description || 'No description provided.'}
                            </p>
                        </div>

                        {company.services && (
                            <div className="section-content" style={{ marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111111', marginBottom: '12px' }}>
                                    Services Offered
                                </h2>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {(Array.isArray(company.services) ? company.services : [company.services]).map((service, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                background: '#eff6ff',
                                                color: '#2563eb',
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {service.charAt(0).toUpperCase() + service.slice(1)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleRequestService}
                        >
                            Request Service
                        </Button>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
