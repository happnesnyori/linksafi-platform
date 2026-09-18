import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles, RotateCcw, ShieldCheck } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import { getCompanies } from '../../services/companyService';
import CompanyBrowser from '../../components/CompanyBrowser';
import '../../styles/companies.css';

const serviceOptions = [
    { id: 'all', label: 'All Services' },
    { id: 'cleaning', label: 'Cleaning' },
    { id: 'decoration', label: 'Decoration' },
    { id: 'both', label: 'Both' },
];

export default function Companies() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedService, setSelectedService] = useState(searchParams.get('service') || 'all');
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const s = searchParams.get('service') || 'all';
        const q = searchParams.get('search') || '';
        setSelectedService(s);
        setSearchTerm(q);
    }, [searchParams]);

    useEffect(() => {
        const timer = setTimeout(loadCompanies, 250);
        return () => clearTimeout(timer);
    }, [selectedService, searchTerm]);

    async function loadCompanies() {
        setLoading(true);
        setError(null);
        try {
            const filters = {};
            if (selectedService !== 'all') filters.service = selectedService;
            if (searchTerm.trim()) filters.search = searchTerm.trim();
            const response = await getCompanies(filters);
            setCompanies(response.results || response || []);
        } catch (err) {
            setError(err.message || 'Failed to load companies');
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    }

    function updateFilter(newService, newSearch) {
        const nextParams = new URLSearchParams();
        if (newService && newService !== 'all') nextParams.set('service', newService);
        if (newSearch && newSearch.trim()) nextParams.set('search', newSearch.trim());
        setSearchParams(nextParams);
    }

    function resetFilters() {
        setSelectedService('all');
        setSearchTerm('');
        setSearchParams(new URLSearchParams());
    }

    return (
        <PublicLayout>
            <div className="companies-page-wrapper">
                <div className="companies-hero-band">
                    <div className="container">
                        <div className="companies-header-badge"><ShieldCheck size={16} /><span>Approved Commercial Partners</span></div>
                        <h1 className="companies-title">Find Cleaning Companies</h1>
                        <p className="companies-subtitle">Browse approved commercial cleaning companies for your property or event.</p>
                        <div className="companies-filter-card">
                            <div className="filter-search-box">
                                <Search size={18} className="filter-search-icon" />
                                <input type="text" placeholder="Search by company name, services, campus or city..." value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); updateFilter(selectedService, event.target.value); }} />
                                {searchTerm && <button type="button" className="clear-search-btn" onClick={() => { setSearchTerm(''); updateFilter(selectedService, ''); }}>✕</button>}
                            </div>
                            <div className="filter-row">
                                <div className="filter-row-group">
                                    <span className="filter-label"><Sparkles size={14} /> Service:</span>
                                    <div className="filter-pills">
                                        {serviceOptions.map((service) => (
                                            <button key={service.id} className={`filter-pill ${selectedService === service.id ? 'active' : ''}`} type="button" onClick={() => { setSelectedService(service.id); updateFilter(service.id, searchTerm); }}>{service.label}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container companies-content-container">
                    <div className="companies-results-bar">
                        <span className="results-count">{loading ? 'Searching approved partners...' : `${companies.length} approved compan${companies.length === 1 ? 'y' : 'ies'}`}</span>
                        {(selectedService !== 'all' || searchTerm) && <button className="reset-filter-btn" onClick={resetFilters}><RotateCcw size={14} /><span>Reset Filters</span></button>}
                    </div>
                    <CompanyBrowser companies={companies} loading={loading} error={error} onRetry={loadCompanies} emptyTitle="No matching companies found" emptyMessage="No companies match your current filters. Try selecting 'All Services' or broadening your search." emptyAction={<button className="btn-navy-pill" onClick={resetFilters}>Reset All Filters</button>} />
                </div>
            </div>
        </PublicLayout>
    );
}
