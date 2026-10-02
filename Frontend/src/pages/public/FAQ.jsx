import { Sparkles } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import FAQSection from '../../components/FAQSection';
import '../../styles/home.css';

export default function FAQ() {
    return (
        <PublicLayout>
            <section className="how-it-works-section">
                <div className="container">
                    <div className="how-header">
                        <div className="how-header-badge">
                            <Sparkles size={15} aria-hidden="true" />
                            <span>Frequently Asked Questions</span>
                        </div>
                        <h2>Got Questions? We've Got Answers</h2>
                        <p className="how-subtitle">
                            Everything universities, apartment managers, and service companies need to know about using SafiLink.
                        </p>
                    </div>
                </div>
            </section>

            <FAQSection showCta={false} />
        </PublicLayout>
    );
}
