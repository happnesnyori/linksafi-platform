import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizationLayout from '../../layouts/OrganizationLayout';
import Button from '../../components/Button';
import CompanyCard from '../../components/CompanyCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { getCompanies } from '../../services/companyService';

export default function FindCompanies() {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [serviceFilter, setServiceFilter] = useState('all');

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setLoading(true);
                const filters = serviceFilter !== 'all' ? { service: serviceFilter } : {};
                const data = await getCompanies(filters);
                setCompanies(data || []);
            } catch (err) {
                setError('Failed to load companies');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, [serviceFilter]);

    if (loading) return <OrganizationLayout><Loading /></OrganizationLayout>;

    return (
        <OrganizationLayout>
            <div className="page-container">
                <div style={{ marginBottom: '40px' }}>
                    <h1 className="page-title">Find Companies</h1>
                    <p className="page-subtitle">Browse and discover service companies</p>
                </div>

                {/* Filter */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111111', marginBottom: '12px' }}>
                        Filter by Service
                    </div>
                    <div className="service-selector">
                        {[
                            { value: 'all', label: 'All Services' },
                            { value: 'cleaning', label: 'Cleaning' },
                            { value: 'decoration', label: 'Decoration' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`service-option ${serviceFilter === option.value ? 'active' : ''}`}
                                onClick={() => setServiceFilter(option.value)}
                            >
                                <div className="service-option-label">{option.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Companies Grid */}
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

                {companies.length > 0 ? (
                    <div className="companies-grid">
                        {companies.map((company) => (
                            <div key={company.id} onClick={() => navigate(`/companies/${company.id}`)}>
                                <CompanyCard company={company} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No companies found"
                        message="Try adjusting your filters to find available companies"
                    />
                )}
            </div>
        </OrganizationLayout>
    );
}
