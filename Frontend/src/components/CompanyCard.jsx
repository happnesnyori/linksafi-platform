import { Star, ArrowRight, Sparkles } from 'lucide-react';
import { formatService } from '../utils/helpers';
import '../styles/companyCard.css';

export default function CompanyCard({ company, onQuoteRequest, onFullProfile }) {
    if (!company) return null;

    const rating = company.rating ?? company.average_rating;
    const reviewCount = Number(company.reviewCount ?? company.reviews_count ?? 0);
    const isVerified = company.verification_status === 'verified' || company.verified === true;
    const serviceItems = Array.isArray(company.serviceItems) ? company.serviceItems : [];
    const services = Array.isArray(company.services) ? company.services : [];
    const tag = company.tag || (serviceItems.length ? formatService(serviceItems[0]) : (services.length ? formatService(services[0]) : ''));
    const city = company.city || (company.location ? String(company.location).split(',')[0].trim() : '');
    const thumbnail = company.thumbnailUrl || company.logoUrl || company.logo || '';

    const handleProfileClick = (event) => {
        event.preventDefault();
        if (onFullProfile) onFullProfile(company);
    };

    const handleQuoteClick = (event) => {
        event.preventDefault();
        if (onQuoteRequest) onQuoteRequest(company);
    };

    return (
        <div className="company-card company-card-collapsed">
            <div className="collapsed-thumb">
                {thumbnail ? (
                    <img src={thumbnail} alt={company.name} />
                ) : (
                    <div className="collapsed-thumb-placeholder">
                        {(company.name || 'C').charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            <div className="collapsed-head">
                <div className="collapsed-name-row">
                    <h3 className="collapsed-name" title={company.name}>
                        {company.name}
                    </h3>
                    {isVerified && <span className="collapsed-verified" title="Verified Company">✓</span>}
                </div>
                {city && <div className="collapsed-location">{city}</div>}
            </div>

            <div className="collapsed-rating">
                {rating !== null && rating !== undefined && reviewCount > 0 ? (
                    <>
                        <Star size={15} className="star-icon" />
                        <span className="rating-score">{rating}</span>
                        <span className="rating-count">({reviewCount})</span>
                    </>
                ) : (
                    <span className="no-reviews">No reviews yet</span>
                )}
            </div>

            {tag && (
                <div className="collapsed-tag-row">
                    <span className="service-tag service-pill">
                        <Sparkles size={12} /> {tag}
                    </span>
                </div>
            )}

            <div className="company-card-footer collapsed-footer">
                <button
                    type="button"
                    className="card-view-btn collapsed-view-btn"
                    onClick={handleProfileClick}
                >
                    <span>View profile</span>
                    <ArrowRight size={15} />
                </button>
                {onQuoteRequest && (
                    <button
                        type="button"
                        className="card-quote-btn"
                        onClick={handleQuoteClick}
                    >
                        Request service
                    </button>
                )}
            </div>
        </div>
    );
}

CompanyCard.defaultProps = {
    onQuoteRequest: null,
    onFullProfile: () => {},
};
