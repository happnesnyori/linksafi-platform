import { useNavigate } from 'react-router-dom';
import CompanyCard from './CompanyCard';
import Loading from './Loading';
import EmptyState from './EmptyState';
import { normalizeCompany } from '../utils/helpers';
import '../styles/companyBrowser.css';

export default function CompanyBrowser({
    companies: rawCompanies = [],
    loading = false,
    error = '',
    onRetry,
    emptyTitle = 'No companies found',
    emptyMessage = 'Try adjusting your filters to find available companies.',
    emptyAction = null,
    onQuoteRequest,
}) {
    const navigate = useNavigate();
    const companies = (rawCompanies || []).map(normalizeCompany).filter(Boolean);

    const handleQuoteRequest = (company) => {
        if (onQuoteRequest) {
            onQuoteRequest(company);
        } else {
            navigate(`/request-service/${company.id}`);
        }
    };

    const handleFullProfile = (company) => {
        navigate(`/companies/${company.id}`);
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
    onQuoteRequest: null,
    emptyAction: null,
};
