import { Link } from "react-router-dom";
import {
    Globe,
    Mail,
    Phone,
    MessageCircle,
    MapPin,
    Truck,
    ShieldCheck,
    Building2,
    Sparkles,
} from "lucide-react";
import "../styles/footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-accent-bar" />

            <div className="footer-container">
                {/* BRAND / ABOUT */}
                <div className="footer-brand">
                    <Link to="/" className="footer-logo" aria-label="SafiLink Home">
                        <span className="logo-icon">
                            <Sparkles size={24} />
                        </span>
                        <span className="logo-text">Safi</span><span className="logo-text-accent">Link</span>
                    </Link>

                    <p className="footer-description">
                        Connecting clients with trusted cleaning & decoration companies in Tanzania.
                    </p>

                    <div className="footer-socials" role="list" aria-label="Social media links">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-social-link">
                            <Globe size={18} />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-social-link">
                            <Mail size={18} />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="footer-social-link">
                            <Phone size={18} />
                        </a>
                    </div>
                </div>

                {/* QUICK LINKS */}
                <nav className="footer-column" aria-labelledby="quick-links-heading">
                    <h3 id="quick-links-heading">Quick Links</h3>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/companies">Find Companies</Link></li>
                        <li><Link to="/services">Services</Link></li>
                        <li><Link to="/how-it-works">How It Works</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                        <li><Link to="/faq">FAQ</Link></li>
                    </ul>
                </nav>

                {/* COMPANIES */}
                <nav className="footer-column" aria-labelledby="companies-heading">
                    <h3 id="companies-heading">Companies</h3>
                    <ul className="footer-links">
                        <li><Link to="/companies?service=cleaning">Cleaning Companies</Link></li>
                        <li><Link to="/companies?service=decoration">Decoration Companies</Link></li>
                        <li><Link to="/companies?service=both">Cleaning & Decoration</Link></li>
                        <li><Link to="/register">Register Your Company</Link></li>
                        <li><Link to="/login">Company Login</Link></li>
                        <li className="view-all"><Link to="/companies">View All Companies →</Link></li>
                    </ul>
                </nav>

                {/* CONTACT INFO */}
                <div className="footer-column footer-contact" aria-labelledby="contact-heading">
                    <h3 id="contact-heading">Contact Us</h3>
                    <address className="contact-info">
                        <div className="contact-item">
                            <MapPin size={16} />
                            <span>Dar es Salaam, Tanzania</span>
                        </div>
                        <div className="contact-item">
                            <Phone size={16} />
                            <a href="tel:+255700000000">+255 700 000 000</a>
                        </div>
                        <div className="contact-item">
                            <Mail size={16} />
                            <a href="mailto:info@linksafi.com">info@linksafi.com</a>
                        </div>
                        <a href="https://wa.me/255700000000" target="_blank" rel="noopener noreferrer" className="contact-item whatsapp-link">
                            <MessageCircle size={16} />
                            <span>Chat on WhatsApp</span>
                        </a>
                    </address>
                </div>
            </div>

            {/* BOTTOM BAR */}
            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <p className="copyright">© 2026 SafiLink. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}