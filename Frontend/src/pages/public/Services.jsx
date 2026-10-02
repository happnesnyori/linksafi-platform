import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import OurServices from '../../components/OurServices';
import '../../styles/home.css';

export default function Services() {
    const navigate = useNavigate();

    return (
        <PublicLayout>
            <OurServices />

            <section className="cta-section">
                <div className="container">
                    <div className="cta-wrapper">
                        <div className="cta-banner">
                            <h2>Ready to Book a Verified Company?</h2>
                            <p>
                                Browse cleaning and decoration companies vetted for universities,
                                apartments, and event spaces across Tanzania.
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
        </PublicLayout>
    );
}
