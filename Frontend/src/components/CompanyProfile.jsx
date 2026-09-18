import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    BadgeCheck,
    MapPin,
    Phone,
    Mail,
    Star,
    Clock,
    Sparkles,
    Images,
    MessageCircle,
    CalendarDays,
} from 'lucide-react';
import { getCompanyReviews } from '../services/companyService';
import { formatService, getMediaUrl } from '../utils/helpers';
import '../styles/companyProfile.css';

const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'services', label: 'Services' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'reviews', label: 'Reviews' },
];

const StarRating = ({ rating }) => (
    <span className="profile-star-rating" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                size={15}
                fill={index < Math.round(Number(rating)) ? 'currentColor' : 'none'}
                color="currentColor"
            />
        ))}
    </span>
);

export default function CompanyProfile({ company }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    useEffect(() => {
        if (!company?.id) return;
        let active = true;
        setReviewsLoading(true);
        getCompanyReviews(company.id)
            .then((data) => {
                if (active) setReviews(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                if (active) setReviews([]);
            })
            .finally(() => {
                if (active) setReviewsLoading(false);
            });
        return () => {
            active = false;
        };
    }, [company?.id]);

    if (!company) return null;

    const serviceItems = Array.isArray(company.service_items) ? company.service_items : [];
    const services = Array.isArray(company.services) ? company.services : [];
    const gallery = Array.isArray(company.gallery_images) ? company.gallery_images : [];
    const specialties = Array.isArray(company.specialties) ? company.specialties : [];
    const serviceAreas = Array.isArray(company.service_areas) ? company.service_areas : [];
    const rating = company.rating ?? company.average_rating;
    const reviewCount = Number(company.reviews_count ?? company.review_count ?? reviews.length);
    const isVerified = company.verification_status === 'verified' || company.verified === true;
    const logoUrl = getMediaUrl(company.logo || company.logoUrl);
    const coverUrl = getMediaUrl(company.cover_image || company.coverImageUrl);
    const companyServices = serviceItems.length
        ? serviceItems
        : services.map((service) => ({ name: formatService(service), category: service, description: '' }));

    const formatDate = (dateValue) => {
        if (!dateValue) return '';
        return new Date(dateValue).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const contactHref = company.email ? `mailto:${company.email}` : null;
    const phoneHref = company.phone ? `tel:${company.phone}` : null;

    return (
        <div className="company-profile-page">
            <div className="container">
                <button className="company-profile-back" type="button" onClick={() => navigate('/companies')}>
                    <ArrowLeft size={16} /> Back to companies
                </button>

                <section className="company-profile-hero">
                    {coverUrl && <img className="company-profile-cover" src={coverUrl} alt="" />}
                    <div className="company-profile-hero-content">
                        <div className="company-profile-logo">
                            {logoUrl ? <img src={logoUrl} alt={`${company.name} logo`} /> : <span>{company.name?.charAt(0) || 'C'}</span>}
                        </div>
                        <div className="company-profile-heading">
                            <div className="company-profile-title-row">
                                <h1>{company.name}</h1>
                                {isVerified && <span className="verified-badge"><BadgeCheck size={16} /> Verified Company</span>}
                            </div>
                            {company.tagline && <p className="company-profile-tagline">{company.tagline}</p>}
                            <div className="company-profile-meta-row">
                                {company.location && <span><MapPin size={15} /> {company.location}</span>}
                                {rating !== null && rating !== undefined && reviewCount > 0 && (
                                    <span className="company-profile-rating"><Star size={15} /> {rating} <small>({reviewCount} reviews)</small></span>
                                )}
                                {(!rating || reviewCount === 0) && <span className="company-profile-no-reviews">No reviews yet</span>}
                            </div>
                            {isVerified && (
                                <div className="company-profile-status-row">
                                    <span className="status-badge status-verified">Verified</span>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <div className="company-profile-actions">
                    <button className="btn btn-primary" type="button" onClick={() => navigate(`/request-service/${company.id}`)}>
                        <CalendarDays size={17} /> Request Service
                    </button>
                    {(contactHref || phoneHref) && (
                        <a className="btn btn-secondary" href={contactHref || phoneHref}>
                            <MessageCircle size={17} /> Contact Company
                        </a>
                    )}
                </div>

                <div className="company-profile-tabs" role="tablist">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            className={activeTab === tab.id ? 'active' : ''}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <section className="company-profile-tab-panel">
                        <div className="company-profile-section">
                            <h2>About Us</h2>
                            <p>{company.description || 'No description provided.'}</p>
                        </div>
                        <div className="company-profile-section-grid">
                            <div className="company-profile-section">
                                <h2>Specialties</h2>
                                {specialties.length ? (
                                    <ul className="company-profile-list">{specialties.map((specialty) => <li key={specialty}>{specialty}</li>)}</ul>
                                ) : <p className="muted-text">No specialties added.</p>}
                            </div>
                            <div className="company-profile-section">
                                <h2>Service Areas</h2>
                                {serviceAreas.length ? (
                                    <ul className="company-profile-list">{serviceAreas.map((area) => <li key={area}>{area}</li>)}</ul>
                                ) : <p className="muted-text">No service areas added.</p>}
                            </div>
                        </div>
                        {(company.phone || company.email || company.working_hours) && (
                            <div className="company-profile-section company-profile-contact">
                                <h2>Contact Information</h2>
                                <div className="company-profile-contact-grid">
                                    {company.phone && <span><Phone size={16} /> <a href={phoneHref}>{company.phone}</a></span>}
                                    {company.email && <span><Mail size={16} /> <a href={contactHref}>{company.email}</a></span>}
                                    {company.location && <span><MapPin size={16} /> {company.location}</span>}
                                    {company.working_hours && <span><Clock size={16} /> {company.working_hours}</span>}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'services' && (
                    <section className="company-profile-tab-panel">
                        <div className="company-profile-section">
                            <h2>Our Services</h2>
                            {companyServices.length ? (
                                <div className="company-service-grid">
                                    {companyServices.map((service, index) => (
                                        <article className="company-service-card" key={`${service.id || service.name || index}`}>
                                            <Sparkles size={20} />
                                            <h3>{service.name || formatService(service.category || service)}</h3>
                                            {service.description && <p>{service.description}</p>}
                                            {service.category && <span className="service-category">{formatService(service.category)}</span>}
                                        </article>
                                    ))}
                                </div>
                            ) : <p className="muted-text">No services added yet.</p>}
                        </div>
                    </section>
                )}

                {activeTab === 'gallery' && (
                    <section className="company-profile-tab-panel">
                        <div className="company-profile-section">
                            <h2>Gallery</h2>
                            {gallery.length ? (
                                <div className="company-gallery-grid">
                                    {gallery.map((image) => (
                                        <figure className="company-gallery-item" key={image.id}>
                                            <img src={getMediaUrl(image.image)} alt={image.title || `${company.name} work`} />
                                            {(image.title || image.description) && (
                                                <figcaption>
                                                    {image.title && <strong>{image.title}</strong>}
                                                    {image.description && <p>{image.description}</p>}
                                                </figcaption>
                                            )}
                                        </figure>
                                    ))}
                                </div>
                            ) : (
                                <div className="company-profile-empty"><Images size={30} /><p>No gallery images yet.</p></div>
                            )}
                        </div>
                    </section>
                )}

                {activeTab === 'reviews' && (
                    <section className="company-profile-tab-panel">
                        <div className="company-profile-section">
                            <h2>Client Reviews</h2>
                            {reviewsLoading ? <p className="muted-text">Loading reviews...</p> : reviews.length ? (
                                <div className="company-reviews-grid">
                                    {reviews.map((review) => (
                                        <article className="company-review-card" key={review.id}>
                                            <div className="company-review-heading">
                                                <StarRating rating={review.rating} />
                                                <span>{formatDate(review.created_at || review.date)}</span>
                                            </div>
                                            <p className="company-review-comment">"{review.comment || review.text}"</p>
                                            <div className="company-review-author">
                                                <strong>{review.customer_name || review.customer?.name || 'Client'}</strong>
                                                {(review.service_name || review.service) && <span>{review.service_name || formatService(review.service)}</span>}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : <div className="company-profile-empty"><Star size={30} /><p>No reviews yet</p></div>}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
