import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Search,
    Sparkles,
    RotateCcw,
    ShieldCheck,
} from 'lucide-react';

import PublicLayout from '../../layouts/PublicLayout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import { getCompanies } from '../../services/companyService';
import CompanyBrowser from '../../components/CompanyBrowser';
import '../../styles/companies.css';

export default function Companies() {
    const [searchParams, setSearchParams] = useSearchParams();

    const initialService = searchParams.get('service') || 'all';
    const initialSearch = searchParams.get('search') || '';

    const [selectedService, setSelectedService] = useState(initialService);
    const [searchTerm, setSearchTerm] = useState(initialSearch);

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
        loadCompanies();
    }, [selectedService, searchTerm]);

    const loadCompanies = async () => {
        setLoading(true);
        setError(null);
        try {
            const filters = {};
            if (selectedService !== 'all') filters.service = selectedService;
            if (searchTerm.trim()) filters.search = searchTerm.trim();

            const response = await getCompanies(filters);
            setCompanies(response || []);
        } catch (err) {
            setError(err.message || 'Failed to load companies');
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    };

    const updateFilter = (newService, newSearch) => {
        const nextParams = new URLSearchParams();
        if (newService && newService !== 'all') nextParams.set('service', newService);
        if (newSearch && newSearch.trim()) nextParams.set('search', newSearch.trim());
        setSearchParams(nextParams);
    };

    const resetFilters = () => {
        setSelectedService('all');
        setSearchTerm('');
        setSearchParams(new URLSearchParams());
    };

    const serviceOptions = [
        { id: 'all', label: 'All Services' },
        { id: 'cleaning', label: 'Cleaning' },
        { id: 'decoration', label: 'Decoration' },
        { id: 'both', label: 'Both' },
    ];

    return (
        <PublicLayout>
            <div className="companies-page-wrapper">
                {/* Header Band */}
                <div className="companies-hero-band">
                    <div className="container">
                        <div className="companies-header-badge">
                            <ShieldCheck size={16} />
                            <span>Verified Commercial Partners</span>
                        </div>
                        <h1 className="companies-title">
                            Find Vetted Cleaning & Decoration Companies
                        </h1>
                        <p className="companies-subtitle">
                            Browse verified companies offering professional cleaning, decoration, or both
                            for your property or event. Find trusted service providers ready to meet your specific needs.

                        </p>

                        {/* Search & Filter Bar */}
                        <div className="companies-filter-card">
                            <div className="filter-search-box">
                                <Search size={18} className="filter-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search by company name, services, campus or city (e.g. UDSM, Dodoma, Arusha)..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        updateFilter(selectedService, e.target.value);
                                    }}
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        className="clear-search-btn"
                                        onClick={() => {
                                            setSearchTerm('');
                                            updateFilter(selectedService, '');
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Service Filter Pills */}
                            <div className="filter-row">
                                <div className="filter-row-group">
                                    <span className="filter-label">
                                        <Sparkles size={14} /> Service:
                                    </span>
                                    <div className="filter-pills">
                                        {serviceOptions.map((s) => (
                                            <button
                                                key={s.id}
                                                className={`filter-pill ${selectedService === s.id ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSelectedService(s.id);
                                                    updateFilter(s.id, searchTerm);
                                                }}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container companies-content-container">
                    {/* Active Filter Summary Strip */}
                    <div className="companies-results-bar">
                        <span className="results-count">
                            {loading
                                ? 'Searching verified partners...'
                                : `Showing ${companies.length} verified company${companies.length === 1 ? '' : 'ies'}`}
                        </span>

                        {(selectedService !== 'all' || searchTerm) && (
                            <button className="reset-filter-btn" onClick={resetFilters}>
                                <RotateCcw size={14} />
                                <span>Reset Filters</span>
                            </button>
                        )}
                    </div>

                    <CompanyBrowser
                        companies={companies}
                        loading={loading}
                        error={error}
                        onRetry={loadCompanies}
                        serviceFilter={selectedService}
                        onServiceFilterChange={(value) => {
                            setSelectedService(value);
                            updateFilter(value, searchTerm);
                        }}
                        emptyTitle="No matching companies found"
                        emptyMessage="No companies match your current filters. Try selecting 'All Services' or broadening your search."
                        emptyAction={
                            <button className="btn-navy-pill" onClick={resetFilters}>
                                Reset All Filters
                            </button>
                        }
                    />
                </div>
            </div>
        </PublicLayout>
    );
}
