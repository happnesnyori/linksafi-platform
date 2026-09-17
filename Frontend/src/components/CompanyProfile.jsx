import { ArrowLeft, MapPin, ShieldCheck, Star, Sparkles, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatService } from '../utils/helpers';
import '../styles/companyProfile.css';

export default function CompanyProfile({
    company,
    onBack,
    onQuoteRequest,
    onFullProfile,
}) {
    const navigate = useNavigate();

    if (!company) return null;

    const rating = company.rating ?? 4.9;
    const reviewCount = company.reviewCount ?? company.reviewsCount ?? 0;
    const isVerified = company.verified !== false;
    const tag = company.tag || 'Service Provider';
    const turnaround = company.turnaroundTime || company.turnoverSpeed || '24-48 hours';
    const capabilities = company.capabilities || company.specialties || [];
    const fullLocation = company.fullLocation || company.location || '';
    const thumbnail = company.thumbnailUrl || company.logo || '';

    const handleFullProfile = () => {
        if (onFullProfile) {
            onFullProfile(company);
        } else {
            navigate(`/companies/${company.id}`);
        }
    };

    const handleQuoteRequest = () => {
        if (onQuoteRequest) {
            onQuoteRequest(company);
        } else {
            navigate(`/request-service/${company.id}`);
        }
    };

    return (
        <div className="company-profile-panel">
            <button
                type="button"
                className="company-profile-back"
                onClick={onBack}
            >
                <ArrowLeft size={16} /> Back to companies
            </button>

            <div className="company-profile-card">
                <div className="company-profile-hero">
                    <div className="company-profile-avatar">
                        {thumbnail ? (
                            <img src={thumbnail} alt={company.name} />
                        ) : (
                            <span>{(company.name || 'C').charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="company-profile-meta">
                        <h2 className="company-profile-name">{company.name}</h2>
                        {fullLocation && (
                            <div className="company-profile-location">
                                <MapPin size={15} /> {fullLocation}
                            </div>
                        )}
                        <div className="company-profile-badges">
                            {isVerified && (
                                <span className="badge badge-verified">
                                    <ShieldCheck size={13} /> Verified
                                </span>
                            )}
                            <span className="badge badge-rating">
                                <Star size={13} className="star-icon" /> {rating} ({reviewCount})
                            </span>
                            <span className="badge badge-tag">
                                <Sparkles size={13} /> {tag}
                            </span>
                            <span className="badge badge-turnaround">
                                <Clock size={13} /> {turnaround}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="company-profile-body">
                    <div className="company-profile-section">
                        <h3>About this provider</h3>
                        <p className="company-profile-description">
                            {company.tagline || company.description || 'Professional facility partner for institutions and residential properties.'}
                        </p>
                    </div>

                    {capabilities.length > 0 && (
                        <div className="company-profile-section">
                            <h3>Key capabilities</h3>
                            <ul className="company-profile-capabilities">
                                {capabilities.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="company-profile-footer">
                    <button
                        type="button"
                        className="btn-profile-outline"
                        onClick={handleFullProfile}
                    >
                        View full profile
                    </button>
                    <button
                        type="button"
                        className="btn-profile-solid"
                        onClick={handleQuoteRequest}
                    >
                        Request quote
                    </button>
                </div>
            </div>
        </div>
    );
}

CompanyProfile.defaultProps = {
    onBack: () => {},
    onQuoteRequest: () => {},
    onFullProfile: () => {},
};