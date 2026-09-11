import { useState } from 'react';
import { MapPin, ShieldCheck, Star, ArrowRight, Sparkles, Clock, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatService } from '../utils/helpers';
import '../styles/companyCard.css';

export default function CompanyCard({ company }) {
    const [saved, setSaved] = useState(false);

    if (!company) return null;

    const rating = company.rating || 4.9;
    const reviews = company.reviewsCount || 45;
    const isVerified = company.verified !== false;
    const turnover = company.turnoverSpeed || "24-48h Dispatch";

    return (
        <div className="company-card">
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

            {/* Top Card Banner */}
            <div className="company-card-top-bar">
                <div className="company-avatar-group">
                    {company.logo ? (
                        <img src={company.logo} alt={company.name} className="company-logo-img" />
                    ) : (
                        <div className="company-logo-placeholder">
                            {company.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                    )}
                    <div className="company-identity">
                        <div className="company-title-row">
                            <h3 className="company-name">{company.name}</h3>
                            {isVerified && (
                                <span className="verified-badge-pill" title="Verified & Insured Enterprise">
                                    <ShieldCheck size={14} /> Verified
                                </span>
                            )}
                        </div>
                        {company.location && (
                            <div className="company-location">
                                <MapPin size={14} />
                                <span>{company.location}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="company-rating-box">
                    <Star size={14} className="star-icon" />
                    <span className="rating-score">{rating}</span>
                    <span className="rating-count">({reviews})</span>
                </div>
            </div>

            {/* Content & Tagline */}
            <div className="company-card-content">
                <p className="company-description">
                    {company.tagline || company.description || "Professional facility partner for institutions and residential properties."}
                </p>

                {/* Services Provided */}
                {company.services && (
                    <div className="company-services">
                        {(Array.isArray(company.services) ? company.services : [company.services])
                            .map((service, i) => (
                                <span key={i} className={`service-tag service-${service}`}>
                                    <Sparkles size={12} />
                                    {formatService(service)}
                                </span>
                            ))}
                    </div>
                )}

                {/* Meta tags */}
                <div className="company-meta-tags">
                    <span className="turnover-tag">
                        <Clock size={13} /> {turnover}
                    </span>
                </div>

                {/* Specialties preview if available */}
                {company.specialties && company.specialties.length > 0 && (
                    <div className="company-specialties-preview">
                        <span className="specialties-title">Key Capabilities:</span>
                        <p className="specialties-snippet">
                            {company.specialties.slice(0, 2).join(" • ")}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer action buttons */}
            <div className="company-card-footer">
                <Link to={`/companies/${company.id}`} className="card-view-btn">
                    <span>View Profile</span>
                    <ArrowRight size={15} />
                </Link>
                <Link to={`/request-service/${company.id}`} className="card-request-btn">
                    Request Quote
                </Link>
            </div>
        </div>
    );
}
