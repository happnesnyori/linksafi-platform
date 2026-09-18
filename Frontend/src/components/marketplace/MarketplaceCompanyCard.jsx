import { useNavigate } from 'react-router-dom';
import { Star, Heart, MapPin, Droplets, PartyPopper, Building2, Award, Sparkle } from 'lucide-react';
import { getCompanyBadge, getMediaUrl } from '../../utils/helpers';

const BADGE_ICONS = {
    'full-service': Sparkle,
    'top-rated': Award,
    new: Star,
};

export default function MarketplaceCompanyCard({ company, isFavorite, onToggleFavorite }) {
    const navigate = useNavigate();
    if (!company) return null;

    const photoUrl = getMediaUrl(company.cover_image) || getMediaUrl(company.logo);
    const badge = getCompanyBadge(company);
    const rating = company.rating;
    const reviewsCount = Number(company.reviews_count ?? 0);
    const services = Array.isArray(company.services) ? company.services : [];
    const hasCleaning = services.includes('cleaning') || services.includes('both');
    const hasDecoration = services.includes('decoration') || services.includes('both');
    const city = company.location ? String(company.location).split(',')[0].trim() : '';

    return (
        <div className="mp-card">
            <div className="mp-card-photo">
                {photoUrl ? (
                    <img src={photoUrl} alt={company.name} />
                ) : (
                    <div className="mp-card-photo-placeholder">
                        <span className="mp-placeholder-icon"><Building2 size={22} strokeWidth={1.5} /></span>
                        <span>{(company.name || 'C').charAt(0).toUpperCase()}</span>
                    </div>
                )}

                {badge && (() => {
                    const BadgeIcon = BADGE_ICONS[badge.tone];
                    return (
                        <span className={`mp-badge mp-badge-${badge.tone}`}>
                            {BadgeIcon && <BadgeIcon size={11} />} {badge.label}
                        </span>
                    );
                })()}

                <button
                    type="button"
                    className={`mp-heart-btn ${isFavorite ? 'active' : ''}`}
                    aria-label={isFavorite ? 'Remove from saved companies' : 'Save company'}
                    onClick={(event) => {
                        event.stopPropagation();
                        onToggleFavorite?.(company);
                    }}
                >
                    <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
            </div>

            <div className="mp-card-body">
                <div className="mp-card-name-row">
                    <h3 className="mp-card-name" title={company.name}>{company.name}</h3>
                    {rating !== null && rating !== undefined && reviewsCount > 0 ? (
                        <span className="mp-card-rating">
                            <Star size={13} fill="currentColor" /> {rating} <small>({reviewsCount})</small>
                        </span>
                    ) : (
                        <span className="mp-card-rating muted">No reviews yet</span>
                    )}
                </div>

                {city && <div className="mp-card-location"><MapPin size={13} /> {city}</div>}

                <p className="mp-card-desc">{company.description || 'No description provided yet.'}</p>

                <div className="mp-card-tags">
                    {hasCleaning && (
                        <span className="mp-tag mp-tag-cleaning"><Droplets size={12} /> Cleaning</span>
                    )}
                    {hasDecoration && (
                        <span className="mp-tag mp-tag-decoration"><PartyPopper size={12} /> Decoration</span>
                    )}
                </div>

                <div className="mp-card-divider" />

                <button
                    type="button"
                    className="mp-view-profile-btn"
                    onClick={() => navigate(`/companies/${company.id}`)}
                >
                    View Profile
                </button>
            </div>
        </div>
    );
}
