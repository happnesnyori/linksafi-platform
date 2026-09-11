import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles,
    ArrowRight,
    ShieldCheck,
    Search,
    Star,
    MapPin,
    Clock,
    Heart,
    Plus,
    Award,
    CalendarCheck,
    Leaf,
    Paintbrush,
    Layers,
} from 'lucide-react';

import PublicLayout from '../../layouts/PublicLayout';
import imag1 from '../../assets/images/imag 1.jpg';
import imag2 from '../../assets/images/imag 2.jpg';
import { MOCK_COMPANIES } from '../../data/mockCompanies';
import { TESTIMONIALS } from '../../data/mockTestimonials';
import { formatService } from '../../utils/helpers';
import '../../styles/home.css';

export default function Home() {
    const navigate = useNavigate();

    // Company Directory Filter State
    const [dirService, setDirService] = useState('all');
    const [dirSearch, setDirSearch] = useState('');

    // Saved / Heart toggle state (local only)
    const [savedIds, setSavedIds] = useState([]);

    const serviceFilters = [
        { id: 'all', label: 'All services', icon: Layers },
        { id: 'cleaning', label: 'Cleaning', icon: Sparkles },
        { id: 'decoration', label: 'Decoration', icon: Paintbrush },
        { id: 'both', label: 'Cleaning + Decoration', icon: Layers },
    ];

    // FAQ Accordion State
    const [openFaq, setOpenFaq] = useState(0);

    const toggleSave = (id) => {
        setSavedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const filteredCompanies = MOCK_COMPANIES.filter(company => {
        const matchesService = dirService === 'all' ||
            company.service === dirService ||
            company.services?.includes(dirService);
        const matchesSearch = !dirSearch.trim() ||
            company.name.toLowerCase().includes(dirSearch.toLowerCase()) ||
            company.location.toLowerCase().includes(dirSearch.toLowerCase());
        return matchesService && matchesSearch;
    });

    const resetDirFilters = () => {
        setDirService('all');
        setDirSearch('');
    };

    const faqList = [
        {
            q: "How does LinkSafi work for universities and campus facilities?",
            a: "LinkSafi connects university procurement officers, estate managers, and hall wardens directly with certified commercial cleaning and decor contractors. You can review background-checked credentials, schedule semester turnover deep cleaning, or book ceremonial stage decorators with transparent contractual quotes."
        },
        {
            q: "How does it help apartment owners and property managers?",
            a: "For apartment buildings and student hostels, LinkSafi streamlines move-in / move-out turnover cleanings, routine stairway and corridor sanitization, and lobby aesthetic staging. This ensures prompt deposit returns for outgoing tenants and immediate readiness for new occupants."
        },
        {
            q: "Can we request both cleaning and decoration from one company?",
            a: "Yes! Many of our partner companies offer combined facility packages ('Both'). For example, you can book an end-to-end service for a university graduation ceremony where the team cleans and polishes the hall beforehand, styles the stage with elegant drapery, and completes post-event sanitation."
        },
        {
            q: "Are the companies on LinkSafi verified and insured?",
            a: "Every service company listed on LinkSafi undergoes credential verification, including business registration, safety compliance, public liability insurance, and background checks on their operational staff."
        },
        {
            q: "What if the service does not meet our required hygiene standard?",
            a: "All bookings are backed by our Quality & Compliance Standard. Providers work from structured inspection checklists, and any missed area is promptly re-cleaned or corrected at no additional charge."
        }
    ];

    const howSteps = [
        {
            number: "01",
            title: "Select Your Space & Required Service",
            desc: "Specify whether you manage a University Campus (lecture halls, student dorms, and labs) or an Apartment Complex (tenant units, common areas, and private hostels). Then choose Cleaning, Decoration, or Both.",
            icon: Sparkles
        },
        {
            number: "02",
            title: "Compare Vetted Commercial Specialists",
            desc: "Browse certified partners with transparent track records, insurance compliance, rapid dispatch, and verified client ratings across Tanzania.",
            icon: Search
        },
        {
            number: "03",
            title: "Submit Requirements & Schedule",
            desc: "Directly submit your institution's schedule — exam-break turnovers, lease changeovers, or ceremonial event dates — with no middleman delays.",
            icon: CalendarCheck
        },
        {
            number: "04",
            title: "Guaranteed Execution & Compliance",
            desc: "Certified crews execute with commercial-grade checklists and eco-friendly products. Every service includes our satisfaction and rectification guarantee.",
            icon: Award
        }
    ];

    const benefits = [
        {
            icon: ShieldCheck,
            title: "Trusted & Vetted Professionals",
            desc: "Experienced, background-checked cleaners and decorators who deliver commercial-grade hygiene and aesthetics with full accountability."
        },
        {
            icon: CalendarCheck,
            title: "Custom Scheduled Plans",
            desc: "They clean and stage based on your academic calendar, semester turnovers, or apartment tenancy cycles — no hassle, just results."
        },
        {
            icon: Award,
            title: "Satisfaction Guaranteed",
            desc: "Every service is backed by transparent inspection checklists. If anything isn't spotless or properly styled, partners make it right."
        },
        {
            icon: Leaf,
            title: "Eco-Conscious Standards",
            desc: "Certified partners prioritize eco-friendly, non-hazardous products that safeguard student health and preserve indoor air quality."
        }
    ];

    return (
        <PublicLayout>
            <div className="home">

                {/* ==========================================================
                     1. HERO SECTION (Deep Teal + Dot Pattern + Single Photo)
                  ========================================================== */}
                <section className="hero-wrapper dot-pattern-dark">
                    <div className="container">
                        <div className="hero-grid">

                            {/* Left Column: Headline & Action */}
                            <div className="hero-left">
                                <div className="hero-pill-badge">
                                    <Sparkles size={15} />
                                    <span>Tanzania's #1 Institutional Facility Platform</span>
                                </div>

                                <h1>
                                    Own Your Space's{' '}
                                    <span className="highlight">Cleanliness</span> &{' '}
                                    <span className="highlight">Charm</span>.
                                </h1>

                                <p className="hero-lead">
                                    LinkSafi simplifies finding and hiring verified commercial
                                    companies responsible for cleanliness activities and
                                    decoration activities for universities, student halls,
                                    and residential apartment complexes.
                                </p>

                                <div className="hero-cta-group">
                                    <button
                                        className="btn-primary-pill"
                                        onClick={() => navigate('/companies')}
                                    >
                                        Find a Company
                                        <ArrowRight size={18} />
                                    </button>

                                    <button
                                        className="btn-ghost-pill"
                                        onClick={() => navigate('/how-it-works')}
                                    >
                                        How LinkSafi Works
                                    </button>
                                </div>

                                <div className="hero-dispatch-badge">
                                    <span className="dispatch-dot" />
                                    <span>
                                        Campus-ready crews & same-day apartment turnover dispatch
                                    </span>
                                </div>
                            </div>

                            {/* Right Column: Single Hero Image */}
                            <div className="hero-visual">
                                <div className="hero-main-photo-wrapper">
                                    <img
                                        src={imag1}
                                        alt="Professional service team ready for campus and apartment cleaning"
                                        className="hero-main-photo"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </section>


                {/* ==========================================================
                    2. HOW IT WORKS (4-Step Process + Photo + Verified Card)
                ========================================================== */}
                <section id="how-it-works" className="how-it-works-section">
                    <div className="container">
                        <div className="how-header">
                            <div className="how-header-badge">
                                <Sparkles size={15} aria-hidden="true" />
                                <span>Institutional & Residential Workflow</span>
                            </div>

                            <h2>How LinkSafi Works</h2>

                            <p className="how-subtitle">
                                We&apos;ve eliminated procurement friction so universities and apartment managers
                                can book trusted cleanliness and decoration specialists in minutes.
                            </p>
                        </div>

                        {/* Image + Steps */}
                        <div className="how-grid">

                            {/* Left: Photo + Verified Badge */}
                            <div className="how-visual">
                                <img
                                    src={imag2}
                                    alt="LinkSafi verified cleaning and decoration professionals"
                                />

                                <div className="how-verified-badge">
                                    <div className="how-verified-icon">
                                        <ShieldCheck size={22} />
                                    </div>

                                    <div className="how-verified-text">
                                        <h4>Verified & Insured</h4>
                                        <p>All partners are background-checked</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Steps */}
                            <div className="how-content">

                                <div className="how-steps-list">
                                    {howSteps.map((step) => (
                                        <div key={step.number} className="step-card">
                                            <div className="step-number">
                                                {step.number}
                                            </div>

                                            <div>
                                                <h3 className="step-title">
                                                    {step.title}
                                                </h3>

                                                <p className="step-desc">
                                                    {step.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <button
                                        className="btn-primary-pill"
                                        onClick={() => navigate('/companies')}
                                    >
                                        Browse Verified Companies
                                        <ArrowRight size={16} />
                                    </button>
                                </div>

                            </div>

                        </div>
                    </div>
                </section>


                {/* ==========================================================
                    3. COMPANY DIRECTORY (6 Companies + Filters)
                ========================================================== */}
                <section className="directory-section">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-badge">Verified Commercal Partners</span>
                            <h2 className="section-title">Find Vetted Cleaning & Decoration Companies</h2>
                            <p className="section-subtitle">
                                Browse verified companies offering professional cleaning, decoration or both for your
                                property or event. Find trusted service providers ready to meet your specific needs.

                            </p>
                        </div>

                        {/* Filters */}
                        <div className="directory-filters">
                            <div className="filter-group">
                                <span className="filter-label"><Sparkles size={14} /> Service:</span>
                                {serviceFilters.map((service) => {
                                    const FilterIcon = service.icon;

                                    return (
                                        <button
                                            key={service.id}
                                            className={`filter-pill ${dirService === service.id ? 'active' : ''}`}
                                            onClick={() => setDirService(service.id)}
                                        >
                                            <FilterIcon size={14} aria-hidden="true" />
                                            {service.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="search-input-wrapper">
                                <Search size={16} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search name or city..."
                                    value={dirSearch}
                                    onChange={(e) => setDirSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Results Bar */}
                        <div className="directory-results-bar">
                            <span className="results-count">
                                Showing {filteredCompanies.length} verified company{filteredCompanies.length === 1 ? '' : 'ies'}
                            </span>
                            {(dirService !== 'all' || dirSearch) && (
                                <button className="reset-filter-btn" onClick={resetDirFilters}>
                                    Reset Filters
                                </button>
                            )}
                        </div>

                        {/* Company Cards Grid */}
                        {filteredCompanies.length === 0 ? (
                            <div className="empty-results-box">
                                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                                    No companies match your current filters.
                                </p>
                                <button className="btn-primary-pill" onClick={resetDirFilters}>
                                    Reset All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="directory-grid">
                                {filteredCompanies.map(company => (
                                    <div
                                        key={company.id}
                                        className="company-card modern-company-card"
                                        style={{ position: 'relative' }}
                                    >
                                        {/* Save / Heart Button */}
                                        <button
                                            onClick={() => toggleSave(company.id)}
                                            style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                zIndex: 5,
                                                background: 'rgba(255,255,255,0.9)',
                                                border: '1px solid var(--border-light)',
                                                borderRadius: '50%',
                                                width: '36px',
                                                height: '36px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                boxShadow: 'var(--shadow-sm)',
                                                transition: 'all var(--transition-fast)'
                                            }}
                                            aria-label={savedIds.includes(company.id) ? 'Remove from saved' : 'Save company'}
                                        >
                                            <Heart
                                                size={18}
                                                fill={savedIds.includes(company.id) ? '#E11D48' : 'none'}
                                                color={savedIds.includes(company.id) ? '#E11D48' : '#64748B'}
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
                                                        {company.verified && (
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
                                                <span className="rating-score">{company.rating || 4.9}</span>
                                                <span className="rating-count">({company.reviewsCount || 45})</span>
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
                                                    <Clock size={13} /> {company.turnoverSpeed || "24-48h Dispatch"}
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
                                            <button
                                                className="card-view-btn"
                                                onClick={() => navigate(`/companies/${company.id}`)}
                                            >
                                                <span>View Profile</span>
                                                <ArrowRight size={15} />
                                            </button>
                                            <button
                                                className="card-request-btn"
                                                onClick={() => navigate(`/request-service/${company.id}`)}
                                            >
                                                Request Quote
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>


                {/* ==========================================================
                    4. WHY LINKSAFI (4 Benefit Cards)
                ========================================================== */}
                <section className="why-section">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-badge">Why LinkSafi</span>
                            <h2 className="section-title">Built for Institutional Scale</h2>
                            <p className="section-subtitle">
                                A specialized platform tailored to commercial scale, student health, and residential peace of mind.
                            </p>
                        </div>

                        <div className="why-cards-grid">
                            {benefits.map((benefit, idx) => (
                                <div key={idx} className="benefit-card">
                                    <div className="benefit-icon-wrap">
                                        <benefit.icon size={28} />
                                    </div>
                                    <h3>{benefit.title}</h3>
                                    <p>{benefit.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* ==========================================================
                    5. TESTIMONIALS (3 Quote Cards)
                ========================================================== */}
                <section className="testimonials-section">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-badge">Testimonials</span>
                            <h2 className="section-title">Trusted by Facility Leaders</h2>
                            <p className="section-subtitle">
                                Hear from university administrators, estate managers, and facilities directors who rely on LinkSafi.
                            </p>
                        </div>

                        <div className="testimonials-grid">
                            {TESTIMONIALS.map(t => (
                                <div key={t.id} className="testimonial-card">
                                    <p className="testimonial-text">{t.quote}</p>
                                    <div className="testimonial-author">
                                        <div className="testimonial-avatar">{t.initials}</div>
                                        <div className="testimonial-info">
                                            <h4>{t.name}</h4>
                                            <p>{t.title}, {t.institution}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* ==========================================================
                    6. CTA BANNER (Warm Amber)
                ========================================================== */}
                <section className="cta-section">
                    <div className="container">
                        <div className="cta-wrapper">
                            <div className="cta-banner">
                                <h2>Ready to Elevate Your Campus or Building?</h2>
                                <p>
                                    Join hundreds of university administrators, hostel wardens, and apartment property managers
                                    who rely on LinkSafi for certified cleaning and decoration.
                                </p>
                                <button
                                    className="btn-amber-solid"
                                    onClick={() => navigate('/companies')}
                                >
                                    Browse All Verified Companies
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>


                {/* ==========================================================
                    7. FAQ ACCORDION
                ========================================================== */}
                <section className="faq-section">
                    <div className="container">
                        <div className="faq-grid">

                            {/* Left Side: Callout Card */}
                            <div className="faq-left-card">
                                <h3>Frequently Asked Questions</h3>
                                <p>
                                    Everything you need to know about booking vetted cleanliness and decoration companies for universities and apartments.
                                </p>
                                <div>
                                    <button
                                        className="btn-primary-pill"
                                        onClick={() => navigate('/companies')}
                                    >
                                        Find Companies Now
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Right Side: Accordion Items */}
                            <div className="faq-items-list">
                                {faqList.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`faq-item-box ${openFaq === idx ? 'open' : ''}`}
                                    >
                                        <button
                                            className="faq-toggle-btn"
                                            onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                                            type="button"
                                        >
                                            <span>{item.q}</span>
                                            <div className="faq-icon-rotator">
                                                <Plus size={18} />
                                            </div>
                                        </button>
                                        <div className="faq-body-content">
                                            <div className="faq-inner-text">
                                                {item.a}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </section>

            </div>
        </PublicLayout>
    );
}
