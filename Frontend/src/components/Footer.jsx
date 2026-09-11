import { useState } from "react";
import {
    Sparkles,
    Search,
    MapPin,
    Mail,
    Clock,
    Phone,
    GraduationCap,
    Building2,
    ShieldCheck,
    Globe,
    Camera,
    Briefcase,
    MessageCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/footer.css";

export default function Footer() {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/companies?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate("/companies");
        }
    };

    return (
        <footer className="footer">
            {/* TOP LOCATOR BAR (Molly Maid style postal/campus finder) */}
            <div className="footer-locator-band">
                <div className="footer-locator-container">
                    <div className="footer-locator-text">
                        <span className="footer-locator-tag">Direct Facility Dispatch</span>
                        <h3>Find vetted cleaning & decor partners for your institution</h3>
                        <p>Search by university campus, hostel zone, or city across Tanzania.</p>
                    </div>

                    <form className="footer-locator-form" onSubmit={handleSearch}>
                        <div className="footer-input-wrapper">
                            <MapPin size={18} className="footer-input-icon" />
                            <input
                                type="text"
                                placeholder="Enter campus or city (e.g. UDSM, Mwenge, Dodoma)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="footer-search-btn">
                            <Search size={16} />
                            <span>Find Providers</span>
                        </button>
                    </form>
                </div>
            </div>

            <div className="footer-container">
                {/* BRAND */}
                <div className="footer-brand">
                    <Link to="/" className="footer-logo">
                        <div className="logo-icon-wrap footer-icon-wrap">
                            <Sparkles size={16} />
                        </div>
                        Link<span>Safi</span>
                    </Link>

                    <p className="footer-description">
                        The institutional discovery and booking platform connecting universities,
                        student halls, and apartment complexes with certified, insured cleaning
                        and decoration service companies.
                    </p>

                    <div className="footer-trust-badges">
                        <span className="footer-trust-badge">
                            <ShieldCheck size={14} /> 100% Insured & Vetted
                        </span>
                        <span className="footer-trust-badge">
                            <GraduationCap size={14} /> Higher-Ed Ready
                        </span>
                    </div>

                    <div className="footer-socials">
                        <button type="button" aria-label="Website">
                            <Globe size={16} />
                        </button>
                        <button type="button" aria-label="Instagram">
                            <Camera size={16} />
                        </button>
                        <button type="button" aria-label="LinkedIn">
                            <Briefcase size={16} />
                        </button>
                        <button type="button" aria-label="WhatsApp">
                            <MessageCircle size={16} />
                        </button>
                    </div>
                </div>

                {/* FOR UNIVERSITIES */}
                <div className="footer-column">
                    <div className="footer-col-header">
                        <GraduationCap size={18} className="footer-col-icon" />
                        <h3>For Universities</h3>
                    </div>
                    <Link to="/companies?service=cleaning">
                        Student Hall Turnover Cleans
                    </Link>
                    <Link to="/companies?service=cleaning">
                        Lecture Theatre & Lab Hygiene
                    </Link>
                    <Link to="/companies?service=decoration">
                        Graduation Ceremony Staging
                    </Link>
                    <Link to="/companies?service=both">
                        Full Campus Facility Contracts
                    </Link>
                    <Link to="/how-it-works">Institutional Procurement Flow</Link>
                </div>

                {/* FOR APARTMENTS */}
                <div className="footer-column">
                    <div className="footer-col-header">
                        <Building2 size={18} className="footer-col-icon" />
                        <h3>For Apartments</h3>
                    </div>
                    <Link to="/companies?service=cleaning">
                        Move-In / Move-Out Cleans
                    </Link>
                    <Link to="/companies?service=cleaning">
                        Common Corridor & Stairwell Care
                    </Link>
                    <Link to="/companies?service=decoration">
                        Lobby & Residential Staging
                    </Link>
                    <Link to="/companies?service=both">
                        Hostel Maintenance Bundles
                    </Link>
                    <Link to="/companies?service=cleaning">Waste & Facade Sanitization</Link>
                </div>

                {/* CONTACT & LEGAL */}
                <div className="footer-column">
                    <div className="footer-col-header">
                        <Phone size={18} className="footer-col-icon" />
                        <h3>Contact & Support</h3>
                    </div>
                    <div className="footer-contact-block">
                        <div className="footer-contact-item">
                            <Phone size={14} />
                            <span>+255 (0) 700 000 000</span>
                        </div>
                        <div className="footer-contact-item">
                            <Mail size={14} />
                            <span>institutions@linksafi.com</span>
                        </div>
                        <div className="footer-contact-item">
                            <Clock size={14} />
                            <span>Mon - Sat 7am - 8pm</span>
                        </div>
                    </div>
                    <Link to="/register">Register as a Company</Link>
                    <Link to="/login">Provider Portal Login</Link>
                    <Link to="/how-it-works">Provider Standards & Vetting</Link>
                </div>
            </div>

            {/* BOTTOM BAR */}
            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <p>© 2026 LinkSafi Ltd. All Rights Reserved. Empowering Universities & Residential Communities.</p>
                    <div className="footer-bottom-links">
                        <Link to="/how-it-works">Terms of Service</Link>
                        <Link to="/how-it-works">Privacy Policy</Link>
                        <Link to="/how-it-works">Hygiene Standards</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}