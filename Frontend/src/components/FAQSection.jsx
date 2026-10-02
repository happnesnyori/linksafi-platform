import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';

const faqList = [
    {
        q: "How does SafiLink work for universities and campus facilities?",
        a: "SafiLink connects university procurement officers, estate managers, and hall wardens directly with certified commercial cleaning contractors. You can review background-checked credentials, schedule semester turnover deep cleaning, and book end-of-event sanitation with transparent contractual quotes."
    },
    {
        q: "How does it help apartment owners and property managers?",
        a: "For apartment buildings and student hostels, SafiLink streamlines move-in / move-out turnover cleanings and routine stairway and corridor sanitization. This ensures prompt deposit returns for outgoing tenants and immediate readiness for new occupants."
    },
    {
        q: "Are the companies on SafiLink verified and insured?",
        a: "Every service company listed on SafiLink undergoes credential verification, including business registration, safety compliance, public liability insurance, and background checks on their operational staff."
    },
    {
        q: "What if the service does not meet our required hygiene standard?",
        a: "All bookings are backed by our Quality & Compliance Standard. Providers work from structured inspection checklists, and any missed area is promptly re-cleaned or corrected at no additional charge."
    }
];

export default function FAQSection({ showCta = true }) {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(-1);

    return (
        <section className="faq-section">
            <div className="container">
                <div className="faq-grid">

                    {/* Left Side: Callout Card */}
                    <div className="faq-left-card">
                        <h3>Frequently Asked Questions</h3>
                        <p>
                            Everything you need to know about booking vetted cleaning companies for universities and apartments.
                        </p>
                        {showCta && (
                            <div>
                                <button
                                    className="btn-primary-pill"
                                    onClick={() => navigate('/companies')}
                                >
                                    Find Companies Now
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        )}
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
    );
}
