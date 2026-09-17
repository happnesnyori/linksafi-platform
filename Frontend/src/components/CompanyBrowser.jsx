import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyCard from './CompanyCard';
import CompanyProfile from './CompanyProfile';
import Loading from './Loading';
import EmptyState from './EmptyState';
import { normalizeCompany } from '../utils/helpers';
import '../styles/companyBrowser.css';

export default function CompanyBrowser({
    companies: rawCompanies = [],
    loading = false,
    error = '',
    onRetry,
    serviceFilter,
    onServiceFilterChange,
    filters = [],
    emptyTitle = 'No companies found',
    emptyMessage = 'Try adjusting your filters to find available companies.',
    emptyAction = null,
    onQuoteRequest,
}) {
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState(null);

    const companies = (rawCompanies || []).map(normalizeCompany).filter(Boolean);

    const selected = companies.find((c) => String(c.id) === String(selectedId)) || null;

    const handleBack = () => {
        setSelectedId(null);
    };

    const handleQuoteRequest = (company) => {
        if (onQuoteRequest) {
            onQuoteRequest(company);
        } else {
            navigate(`/request-service/${company.id}`);
        }
    };

    const handleFullProfile = (company) => {
        setSelectedId(String(company.id));
    };

    if (loading) {
        return <Loading message="Fetching verified service companies..." />;
    }

    if (error) {
        return (
            <div className="browser-error">
                <EmptyState
                    title="Unable to load companies"
                    message={error}
                    action={
                        onRetry ? (
                            <button className="btn btn-primary" onClick={onRetry}>
                                Try Again
                            </button>
                        ) : null
                    }
                />
            </div>
        );
    }

    if (selected) {
        return (
            <CompanyProfile
                company={selected}
                onBack={handleBack}
                onQuoteRequest={handleQuoteRequest}
                onFullProfile={handleFullProfile}
            />
        );
    }

    if (companies.length === 0) {
        return (
            <div className="browser-empty">
                <EmptyState
                    title={emptyTitle}
                    message={emptyMessage}
                    action={emptyAction}
                />
            </div>
        );
    }

    return (
        <div className="company-browser">
            {filters.length > 0 && (
                <div className="browser-filters">
                    {filters.map((f) => (
                        <div key={f.key} className="browser-filter-group">
                            <span className="browser-filter-label">{f.label}</span>
                            <div className="browser-filter-pills">
                                {f.options.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        className={`browser-filter-pill ${serviceFilter === opt.value ? 'active' : ''}`}
                                        onClick={() => onServiceFilterChange && onServiceFilterChange(opt.value)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="companies-grid browser-grid">
                {companies.map((company) => (
                    <div key={company.id} className="browser-card-wrapper">
                        <CompanyCard
                            company={company}
                            onQuoteRequest={handleQuoteRequest}
                            onFullProfile={handleFullProfile}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

CompanyBrowser.defaultProps = {
    onRetry: null,
    onServiceFilterChange: null,
    onQuoteRequest: null,
    filters: [],
    emptyAction: null,
};