import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import image2 from '../../assets/images/imag 2.jpg';
import '../../styles/home.css';

export default function HowItWorks() {
    const navigate = useNavigate();

    const steps = [
        {
            number: '01',
            title: 'Select Your Space & Required Service',
            desc: 'Specify whether you manage a University Campus (lecture halls, student dorms, and labs) or an Apartment Complex (tenant units, common areas, and private hostels). Then choose Cleaning, Decoration, or Both.'
        },
        {
            number: '02',
            title: 'Compare Vetted Commercial Specialists',
            desc: 'Browse certified partners with transparent track records, insurance compliance, rapid dispatch, and verified client ratings across Tanzania.'
        },
        {
            number: '03',
            title: 'Submit Requirements & Schedule',
            desc: "Directly submit your institution's schedule — exam-break turnovers, lease changeovers, or ceremonial event dates — with no middleman delays."
        },
        {
            number: '04',
            title: 'Guaranteed Execution & Compliance',
            desc: 'Certified crews execute with commercial-grade checklists and eco-friendly products. Every service includes our satisfaction and rectification guarantee.'
        },
    ];

    return (
        <PublicLayout>
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

                    <div className="how-grid">
                        <div className="how-visual">
                            <img
                                src={image2}
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

                        <div className="how-content">
                            <div className="how-steps-list">
                                {steps.map((step) => (
                                    <div key={step.number} className="step-card">
                                        <div className="step-number">{step.number}</div>
                                        <div>
                                            <h3 className="step-title">{step.title}</h3>
                                            <p className="step-desc">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="btn-primary-pill" onClick={() => navigate('/companies')}>
                                Browse Verified Companies
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
