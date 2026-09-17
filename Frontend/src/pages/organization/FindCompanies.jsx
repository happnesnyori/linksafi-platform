import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizationLayout from '../../layouts/OrganizationLayout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import CompanyBrowser from '../../components/CompanyBrowser';
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

    const filters = [
        {
            key: 'service',
            label: 'Service',
            options: [
                { value: 'all', label: 'All Services' },
                { value: 'cleaning', label: 'Cleaning' },
                { value: 'decoration', label: 'Decoration' },
                { value: 'both', label: 'Both' },
            ],
        },
    ];

    return (
        <OrganizationLayout>
            <div className="page-container">
                <div style={{ marginBottom: '40px' }}>
                    <h1 className="page-title">Find Companies</h1>
                    <p className="page-subtitle">Browse and discover service companies</p>
                </div>

                <CompanyBrowser
                    companies={companies}
                    loading={loading}
                    error={error}
                    onRetry={() => setServiceFilter(serviceFilter)}
                    serviceFilter={serviceFilter}
                    onServiceFilterChange={setServiceFilter}
                    filters={filters}
                    emptyTitle="No companies found"
                    emptyMessage="Try adjusting your filters to find available companies."
                />
            </div>
        </OrganizationLayout>
    );
}
