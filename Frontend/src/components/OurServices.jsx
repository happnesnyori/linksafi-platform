import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/ourServices.css';

const SERVICES = [
    {
        id: 'cleaning',
        badge: 'Most requested',
        badgeVariant: 'teal',
        title: 'Cleaning',
        description:
            'Verified cleaning companies for homes, offices, hostels, and campuses — from routine upkeep to deep sanitation.',
        checklist: [
            'Verified & rated companies',
            'Home, office & campus cleaning',
            'Fast response turnaround',
        ],
    },
    {
        id: 'decoration',
        badge: 'Event ready',
        badgeVariant: 'amber',
        title: 'Decoration',
        description:
            'Verified decoration companies for university events, apartment functions, and venue styling — from setup to teardown.',
        checklist: [
            'Verified & rated companies',
            'Event, venue & apartment decoration',
            'Flexible booking for one-off events',
        ],
    },
    {
        id: 'both',
        badge: 'Full package',
        badgeVariant: 'navy',
        title: 'Combined Services',
        description:
            'Companies that handle multiple service types together — one booking, one team, less coordination.',
        checklist: [
            'One company, multiple services',
            'Ideal for large properties & events',
            'Simplified booking & billing',
        ],
    },
];

export default function OurServices({ onServiceClick }) {
    const navigate = useNavigate();

    const handleClick = (service) => {
        if (onServiceClick) {
            onServiceClick(service);
        } else {
            navigate(`/companies?service=${service.id}`);
        }
    };

    return (
        <section className="our-services-section">
            <div className="our-services-inner">
                <span className="our-services-pill">LINK SAFI</span>
                <h2 className="our-services-title">Our Services</h2>
                <p className="our-services-subtitle">
                    Find the right verified company for your cleaning, decoration, or combined service needs.
                </p>

                <div className="our-services-grid">
                    {SERVICES.map((service) => (
                        <article
                            key={service.title}
                            className={`our-services-card card-${service.badgeVariant} clickable`}
                            onClick={() => handleClick(service)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleClick(service);
                                }
                            }}
                            aria-label={`View ${service.title} companies`}
                        >
                            <div className="our-services-card-header">
                                <span className={`badge badge-${service.badgeVariant}`}>
                                    {service.badge}
                                </span>
                                <button
                                    type="button"
                                    className="our-services-arrow"
                                    aria-label={`Learn more about ${service.title}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClick(service);
                                    }}
                                >
                                    <ArrowUpRight size={16} />
                                </button>
                            </div>

                            <h3 className="our-services-card-title">{service.title}</h3>
                            <p className="our-services-card-desc">{service.description}</p>

                            <div className="our-services-divider" />

                            <ul className="our-services-checklist">
                                {service.checklist.map((item) => (
                                    <li key={item} className="our-services-check-item">
                                        <span className="our-services-check-icon">
                                            <CheckCircle2 size={14} />
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

OurServices.defaultProps = {
    onServiceClick: null,
};