import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    BadgeCheck,
    CheckCircle2,
    MapPin,
    Phone,
    Mail,
    Star,
    Clock,
    Images,
    MessageCircle,
    CalendarDays,
    Droplets,
    PartyPopper,
    X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import Lightbox from './Lightbox';
import { getCompanyReviews } from '../services/companyService';
import { requestService } from '../services/requestService';
import { formatService, getMediaUrl } from '../utils/helpers';
import '../styles/companyProfile.css';

const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'services', label: 'Services' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'reviews', label: 'Reviews' },
];

const PROPERTY_TYPES = [
    { value: 'university', label: 'University' },
    { value: 'apartment', label: 'Apartment Property' },
    { value: 'office', label: 'Office' },
    { value: 'event', label: 'Event Venue' },
];

const StarRating = ({ rating }) => (
    <span className="cpp-star-rating" aria-label={`${rating} out of 5 stars`}>
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
    const { isAuthenticated, role, user } = useAuth();
    const { addToast } = useToast();
    const [view, setView] = useState('profile');
    const [activeTab, setActiveTab] = useState('overview');
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);
    const [lightboxGroupIndex, setLightboxGroupIndex] = useState(null);
    const [galleryHighlightId, setGalleryHighlightId] = useState(null);
    const pendingGalleryScrollId = useRef(null);
    const gallerySectionRefs = useRef({});

    const [requestForm, setRequestForm] = useState({ service: '', property_type: '', description: '', preferred_contact: 'email' });
    const [requestSubmitting, setRequestSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');

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

    useEffect(() => {
        if (activeTab !== 'gallery' || pendingGalleryScrollId.current == null) return;
        const targetId = pendingGalleryScrollId.current;
        pendingGalleryScrollId.current = null;
        const node = gallerySectionRefs.current[targetId];
        if (node) {
            node.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setGalleryHighlightId(targetId);
            const timer = setTimeout(() => setGalleryHighlightId(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [activeTab]);

    if (!company) return null;

    const serviceItems = Array.isArray(company.service_items) ? company.service_items : [];
    const services = Array.isArray(company.services) ? company.services : [];
    const gallery = Array.isArray(company.gallery_images) ? company.gallery_images : [];
    const lightboxGroups = gallery.map((image) => ({
        id: image.id,
        title: image.title,
        items: [
            { src: getMediaUrl(image.image), title: image.title, description: image.description },
            ...(image.sub_images || []).map((sub) => ({
                src: getMediaUrl(sub.image),
                title: image.title,
                description: sub.description || image.description,
            })),
        ],
    }));
    const specialties = Array.isArray(company.specialties) ? company.specialties : [];
    const serviceAreas = Array.isArray(company.service_areas) ? company.service_areas : [];
    const rating = company.rating ?? company.average_rating;
    const reviewCount = Number(company.reviews_count ?? company.review_count ?? reviews.length);
    const isApproved = company.status === 'approved';
    const isVerified = company.verification_status === 'verified' || company.verified === true;
    const logoUrl = getMediaUrl(company.logo || company.logoUrl);
    const companyServices = serviceItems.length
        ? serviceItems
        : services
            .filter((service) => service !== 'both')
            .map((service) => ({ name: formatService(service), category: service, description: '' }));

    const galleryByServiceId = gallery.reduce((acc, image) => {
        const key = image.service ?? 'other';
        acc[key] = acc[key] || [];
        acc[key].push(image);
        return acc;
    }, {});
    const gallerySections = [
        ...companyServices
            .filter((service) => service.id != null && galleryByServiceId[service.id]?.length)
            .map((service) => ({ id: service.id, title: service.name, images: galleryByServiceId[service.id] })),
        ...(galleryByServiceId.other?.length
            ? [{ id: 'other', title: 'Other Photos', images: galleryByServiceId.other }]
            : []),
    ];

    const openLightboxFor = (imageId) => {
        const index = lightboxGroups.findIndex((group) => group.id === imageId);
        if (index >= 0) setLightboxGroupIndex(index);
    };

    const handleViewServiceGallery = (service) => {
        if (service.id == null || !galleryByServiceId[service.id]?.length) return;
        pendingGalleryScrollId.current = service.id;
        setActiveTab('gallery');
    };

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

    const handleRequestServiceClick = () => {
        if (isAuthenticated && role === 'organization') {
            setRequestForm({ service: '', property_type: '', description: '', preferred_contact: 'email' });
            setRequestError('');
            setView('request');
        } else {
            navigate(`/request-service/${company.id}`);
        }
    };

    const handleRequestSubmit = async (event) => {
        event.preventDefault();
        setRequestError('');
        if (!requestForm.service || !requestForm.property_type || !requestForm.description.trim()) {
            setRequestError('Please fill in all required fields.');
            return;
        }
        if (requestForm.preferred_contact === 'phone' && !user?.phone) {
            setRequestError('Add a phone number to your account to receive responses by phone, or choose email instead.');
            return;
        }
        setRequestSubmitting(true);
        try {
            await requestService.createRequest(company.id, {
                service: requestForm.service,
                property_type: requestForm.property_type,
                description: requestForm.description.trim(),
                preferred_contact: requestForm.preferred_contact,
            });
            addToast('Request sent to the company', 'success');
            setView('profile');
        } catch (err) {
            setRequestError(err.message || 'Failed to submit request');
        } finally {
            setRequestSubmitting(false);
        }
    };

    return (
        <div className="company-profile-page">
            <div className="container">
                <button className="cpp-back" type="button" onClick={() => navigate('/companies')}>
                    <ArrowLeft size={16} /> Back to companies
                </button>

                {/* ===== Cover / identity block ===== */}
                <section className="cpp-cover">
                    <div className="cpp-cover-tile">
                        {logoUrl ? <img src={logoUrl} alt={`${company.name} logo`} /> : <span>{company.name?.charAt(0) || 'C'}</span>}
                    </div>
                    <div className="cpp-cover-info">
                        <div className="cpp-cover-name-row">
                            <h1>{company.name}</h1>
                            {isVerified && <span className="cpp-gold-badge"><BadgeCheck size={14} /> Verified</span>}
                        </div>
                        {company.tagline && <p className="cpp-tagline">{company.tagline}</p>}
                        <div className="cpp-cover-meta">
                            {isApproved && (
                                <span className="cpp-mint-pill"><CheckCircle2 size={13} /> Verified Company</span>
                            )}
                            {company.location && <span className="cpp-meta-item"><MapPin size={14} /> {company.location}</span>}
                            {rating !== null && rating !== undefined && reviewCount > 0 ? (
                                <span className="cpp-meta-item cpp-rating"><Star size={14} fill="currentColor" /> {rating} <small>({reviewCount} reviews)</small></span>
                            ) : (
                                <span className="cpp-meta-item cpp-muted">No reviews yet</span>
                            )}
                        </div>
                    </div>
                </section>

                {view === 'profile' ? (
                    <>
                        {/* ===== Action row ===== */}
                        <div className="cpp-actions">
                            <button className="cpp-btn cpp-btn-primary" type="button" onClick={handleRequestServiceClick}>
                                <CalendarDays size={17} /> Request Service
                            </button>
                            <button className="cpp-btn cpp-btn-outline" type="button" onClick={() => setContactOpen(true)}>
                                <MessageCircle size={17} /> Contact Company
                            </button>
                        </div>

                        {/* ===== Tabs ===== */}
                        <div className="cpp-tabs" role="tablist">
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
                            <section className="cpp-tab-panel">
                                <div className="cpp-section">
                                    <h2>About Us</h2>
                                    <p>{company.description || 'No description provided.'}</p>
                                </div>
                                <div className="cpp-section-grid">
                                    <div className="cpp-section">
                                        <h2>Specialties</h2>
                                        {specialties.length ? (
                                            <ul className="cpp-list">{specialties.map((specialty) => <li key={specialty}>{specialty}</li>)}</ul>
                                        ) : <p className="cpp-muted-text">No specialties added.</p>}
                                    </div>
                                    <div className="cpp-section">
                                        <h2>Service Areas</h2>
                                        {serviceAreas.length ? (
                                            <ul className="cpp-list">{serviceAreas.map((area) => <li key={area}>{area}</li>)}</ul>
                                        ) : <p className="cpp-muted-text">No service areas added.</p>}
                                    </div>
                                </div>
                                <div className="cpp-section cpp-contact-card">
                                    <h2>Contact Information</h2>
                                    <div className="cpp-contact-grid">
                                        <span><Phone size={16} /> {company.phone ? <a href={phoneHref}>{company.phone}</a> : 'Not provided'}</span>
                                        <span><Mail size={16} /> {company.email ? <a href={contactHref}>{company.email}</a> : 'Not provided'}</span>
                                        <span><MapPin size={16} /> {company.location || 'Not provided'}</span>
                                        <span><Clock size={16} /> {company.working_hours || 'Not provided'}</span>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'services' && (
                            <section className="cpp-tab-panel">
                                <div className="cpp-section">
                                    <h2>Our Services</h2>
                                    {companyServices.length ? (
                                        Object.entries(
                                            companyServices.reduce((groups, service) => {
                                                const category = service.category || service || 'other';
                                                groups[category] = groups[category] || [];
                                                groups[category].push(service);
                                                return groups;
                                            }, {})
                                        ).map(([category, items]) => {
                                            const isCleaning = category === 'cleaning';
                                            const Icon = isCleaning ? Droplets : PartyPopper;
                                            return (
                                                <div className="cpp-service-group" key={category}>
                                                    <h3 className="cpp-service-group-title">{formatService(category)}</h3>
                                                    <div className="cpp-service-grid">
                                                        {items.map((service, index) => {
                                                            const photoCount = service.id != null ? (galleryByServiceId[service.id]?.length || 0) : 0;
                                                            const clickable = photoCount > 0;
                                                            return (
                                                                <article
                                                                    className={`cpp-service-card ${clickable ? 'cpp-service-card-clickable' : ''}`}
                                                                    key={`${service.id || service.name || index}`}
                                                                    role={clickable ? 'button' : undefined}
                                                                    tabIndex={clickable ? 0 : undefined}
                                                                    onClick={clickable ? () => handleViewServiceGallery(service) : undefined}
                                                                    onKeyDown={clickable ? (e) => { if (e.key === 'Enter') handleViewServiceGallery(service); } : undefined}
                                                                >
                                                                    <span className={`cpp-service-icon ${isCleaning ? 'cleaning' : 'decoration'}`}>
                                                                        <Icon size={18} />
                                                                    </span>
                                                                    <h3>{service.name || formatService(category)}</h3>
                                                                    {service.description && <p>{service.description}</p>}
                                                                    {clickable && (
                                                                        <span className="cpp-service-photo-link">
                                                                            <Images size={13} /> {photoCount} photo{photoCount === 1 ? '' : 's'} · View
                                                                        </span>
                                                                    )}
                                                                </article>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : <p className="cpp-muted-text">No services added yet.</p>}
                                </div>
                            </section>
                        )}

                        {activeTab === 'gallery' && (
                            <section className="cpp-tab-panel">
                                <div className="cpp-section">
                                    <h2>Gallery</h2>
                                    {gallerySections.length ? (
                                        gallerySections.map((section) => (
                                            <div
                                                key={section.id}
                                                ref={(el) => { gallerySectionRefs.current[section.id] = el; }}
                                                className={`cpp-gallery-section ${galleryHighlightId === section.id ? 'cpp-gallery-section-highlight' : ''}`}
                                            >
                                                <h3 className="cpp-gallery-section-title">
                                                    {section.title} <span>({section.images.length})</span>
                                                </h3>
                                                <div className="cpp-gallery-grid">
                                                    {section.images.map((image) => (
                                                        <figure className="cpp-gallery-item" key={image.id}>
                                                            <button
                                                                type="button"
                                                                className="cpp-gallery-item-trigger"
                                                                onClick={() => openLightboxFor(image.id)}
                                                                aria-label={`View ${image.title || 'gallery image'} full size`}
                                                            >
                                                                <img src={getMediaUrl(image.image)} alt={image.title || `${company.name} work`} />
                                                                {image.sub_images?.length > 0 && (
                                                                    <span className="cpp-gallery-item-badge">+{image.sub_images.length}</span>
                                                                )}
                                                            </button>
                                                            {(image.title || image.description) && (
                                                                <figcaption>
                                                                    {image.title && <strong>{image.title}</strong>}
                                                                    {image.description && <p>{image.description}</p>}
                                                                </figcaption>
                                                            )}
                                                        </figure>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="cpp-empty"><Images size={30} /><p>No photos added.</p></div>
                                    )}
                                </div>
                            </section>
                        )}

                        {activeTab === 'reviews' && (
                            <section className="cpp-tab-panel">
                                <div className="cpp-section">
                                    <h2>Client Reviews</h2>
                                    {reviewsLoading ? <p className="cpp-muted-text">Loading reviews...</p> : reviews.length ? (
                                        <div className="cpp-reviews-grid">
                                            {reviews.map((review) => (
                                                <article className="cpp-review-card" key={review.id}>
                                                    <div className="cpp-review-heading">
                                                        <StarRating rating={review.rating} />
                                                        <span>{formatDate(review.created_at || review.date)}</span>
                                                    </div>
                                                    <p className="cpp-review-comment">"{review.comment || review.text}"</p>
                                                    <div className="cpp-review-author">
                                                        <strong>{review.customer_name || review.customer?.name || 'Client'}</strong>
                                                        {(review.service_name || review.service) && <span>{review.service_name || formatService(review.service)}</span>}
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="cpp-empty">
                                            <Star size={30} />
                                            <p>No reviews yet. Reviews appear here once organizations complete a service with this company.</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </>
                ) : (
                    /* ===== Request Service view ===== */
                    <section className="cpp-request-view">
                        <div className="cpp-request-summary">
                            <h2>{company.name}</h2>
                            <p>{company.description || 'No description provided.'}</p>
                            <div className="cpp-request-summary-field">
                                <span>Location</span>
                                <strong>{company.location || 'Not provided'}</strong>
                            </div>
                            <div className="cpp-request-summary-field">
                                <span>Email</span>
                                <strong>{company.email || 'Not provided'}</strong>
                            </div>
                            <div className="cpp-request-summary-field">
                                <span>Phone</span>
                                <strong>{company.phone || 'Not provided'}</strong>
                            </div>
                        </div>

                        <form className="cpp-request-form" onSubmit={handleRequestSubmit}>
                            <h2>Request Service</h2>
                            {requestError && <div className="cpp-form-error">{requestError}</div>}

                            <div className="cpp-form-group">
                                <label>Service Type *</label>
                                <select
                                    value={requestForm.service}
                                    onChange={(e) => setRequestForm((cur) => ({ ...cur, service: e.target.value }))}
                                    required
                                >
                                    <option value="">Select a service offered by this company</option>
                                    {companyServices.map((service, index) => {
                                        const value = service.category || service;
                                        return (
                                            <option key={`${value}-${index}`} value={value}>
                                                {service.name || formatService(value)}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="cpp-form-group">
                                <label>Property Type *</label>
                                <select
                                    value={requestForm.property_type}
                                    onChange={(e) => setRequestForm((cur) => ({ ...cur, property_type: e.target.value }))}
                                    required
                                >
                                    <option value="">Select property type</option>
                                    {PROPERTY_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="cpp-form-group">
                                <label>Description *</label>
                                <textarea
                                    value={requestForm.description}
                                    onChange={(e) => setRequestForm((cur) => ({ ...cur, description: e.target.value }))}
                                    placeholder="Describe what you need..."
                                    required
                                />
                            </div>

                            <div className="cpp-form-group">
                                <label>How should the company respond? *</label>
                                <select
                                    value={requestForm.preferred_contact}
                                    onChange={(e) => setRequestForm((cur) => ({ ...cur, preferred_contact: e.target.value }))}
                                    required
                                >
                                    <option value="email">Email {user?.email ? `(${user.email})` : ''}</option>
                                    <option value="phone">Phone {user?.phone ? `(${user.phone})` : '(add a phone number to your profile)'}</option>
                                </select>
                            </div>

                            <div className="cpp-form-actions">
                                <button type="button" className="cpp-btn cpp-btn-outline" onClick={() => setView('profile')} disabled={requestSubmitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="cpp-btn cpp-btn-primary" disabled={requestSubmitting}>
                                    {requestSubmitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </section>
                )}
            </div>

            {contactOpen && (
                <div className="cpp-modal-overlay" onClick={() => setContactOpen(false)}>
                    <div className="cpp-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cpp-modal-head">
                            <h3>Contact {company.name}</h3>
                            <button className="cpp-modal-close" onClick={() => setContactOpen(false)} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="cpp-modal-body">
                            {phoneHref ? (
                                <a className="cpp-contact-link" href={phoneHref}><Phone size={16} /> {company.phone}</a>
                            ) : null}
                            {contactHref ? (
                                <a className="cpp-contact-link" href={contactHref}><Mail size={16} /> {company.email}</a>
                            ) : null}
                            {!phoneHref && !contactHref && (
                                <p className="cpp-muted-text">This company hasn't added contact details yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Lightbox
                groups={lightboxGroups}
                groupIndex={lightboxGroupIndex}
                onClose={() => setLightboxGroupIndex(null)}
                onNavigateGroup={setLightboxGroupIndex}
            />
        </div>
    );
}
