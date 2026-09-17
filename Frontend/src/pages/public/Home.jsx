import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles,
    ArrowRight,
    ShieldCheck,
    Search,
    Plus,
    Award,
    CalendarCheck,
    Leaf,
} from 'lucide-react';

import PublicLayout from '../../layouts/PublicLayout';
import imag1 from '../../assets/images/imag 1.jpg';
import imag2 from '../../assets/images/imag 2.jpg';
import { TESTIMONIALS } from '../../data/mockTestimonials';
import OurServices from '../../components/OurServices';
import '../../styles/home.css';

export default function Home() {
    const navigate = useNavigate();

    // FAQ Accordion State
    const [openFaq, setOpenFaq] = useState(-1);

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
                    3. OUR SERVICES (3 category cards)
                ========================================================== */}
                <OurServices />


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
