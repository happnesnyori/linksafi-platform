import { useState } from 'react';
import { Star, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { formatService } from '../utils/helpers';
import '../styles/companyCard.css';

export default function CompanyCard({ company, onQuoteRequest, onFullProfile }) {
    const [saved, setSaved] = useState(false);

    if (!company) return null;

    const rating = company.rating || 4.9;
    const isVerified = company.verified !== false;
    const tag = company.tag || 'Service Provider';
    const city = company.city || (company.location ? String(company.location).split('(')[0].split('&')[0].split(',')[0].trim() : '');
    const thumbnail = company.thumbnailUrl || company.logo || '';

    const handleProfileClick = (e) => {
        e.preventDefault();
        if (onFullProfile) onFullProfile(company);
    };

    const handleQuoteClick = (e) => {
        e.preventDefault();
        if (onQuoteRequest) onQuoteRequest(company);
    };

    return (
        <div className="company-card company-card-collapsed">
            {/* Save / Heart Button */}
            <button
                className="save-btn"
                onClick={() => setSaved(!saved)}
                aria-label={saved ? 'Remove from saved' : 'Save company'}
            >
                <Heart
                    size={18}
                    fill={saved ? '#E11D48' : 'none'}
                    color={saved ? '#E11D48' : '#64748B'}
                />
            </button>

            {/* Thumbnail */}
            <div className="collapsed-thumb">
                {thumbnail ? (
                    <img src={thumbnail} alt={company.name} />
                ) : (
                    <div className="collapsed-thumb-placeholder">
                        {(company.name || 'C').charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            {/* Name + City */}
            <div className="collapsed-head">
                <h3 className="collapsed-name" title={company.name}>
                    {company.name}
                </h3>
                {city && (
                    <div className="collapsed-location">
                        <span>{city}</span>
                    </div>
                )}
            </div>

            {/* Rating number only */}
            <div className="collapsed-rating">
                <Star size={15} className="star-icon" />
                <span className="rating-score">{rating}</span>
            </div>

            {/* Single primary service tag pill */}
            <div className="collapsed-tag-row">
                <span className="service-tag service-pill">
                    <Sparkles size={12} /> {tag}
                </span>
            </div>

            {/* Footer: single full-width "View profile" button */}
            <div className="company-card-footer collapsed-footer">
                <button
                    type="button"
                    className="card-view-btn collapsed-view-btn"
                    onClick={handleProfileClick}
                >
                    <span>View profile</span>
                    <ArrowRight size={15} />
                </button>
            </div>
        </div>
    );
}

CompanyCard.defaultProps = {
    onQuoteRequest: () => {},
    onFullProfile: () => {},
};