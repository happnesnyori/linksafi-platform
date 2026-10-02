import { Mail, Phone, MapPin, MessageCircle, Sparkles } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import '../../styles/home.css';
import '../../styles/contact.css';

const contactMethods = [
    {
        icon: MapPin,
        label: 'Visit Us',
        value: 'Dar es Salaam, Tanzania',
    },
    {
        icon: Phone,
        label: 'Call Us',
        value: '+255 700 000 000',
        href: 'tel:+255700000000',
    },
    {
        icon: Mail,
        label: 'Email Us',
        value: 'info@linksafi.com',
        href: 'mailto:info@linksafi.com',
    },
    {
        icon: MessageCircle,
        label: 'WhatsApp',
        value: 'Chat with our team',
        href: 'https://wa.me/255700000000',
    },
];

export default function Contact() {
    return (
        <PublicLayout>
            <section className="how-it-works-section">
                <div className="container">
                    <div className="how-header">
                        <div className="how-header-badge">
                            <Sparkles size={15} aria-hidden="true" />
                            <span>We're Here to Help</span>
                        </div>
                        <h2>Contact Us</h2>
                        <p className="how-subtitle">
                            Have a question about SafiLink, a booking, or partnering as a service
                            company? Reach out and our team will respond promptly.
                        </p>
                    </div>

                    <div className="contact-methods-grid">
                        {contactMethods.map((method) => {
                            const Icon = method.icon;
                            const isExternal = method.href?.startsWith('http');
                            const content = (
                                <>
                                    <span className="contact-method-icon">
                                        <Icon size={22} />
                                    </span>
                                    <span className="contact-method-label">{method.label}</span>
                                    <span className="contact-method-value">{method.value}</span>
                                </>
                            );

                            return method.href ? (
                                <a
                                    key={method.label}
                                    href={method.href}
                                    target={isExternal ? '_blank' : undefined}
                                    rel={isExternal ? 'noopener noreferrer' : undefined}
                                    className="contact-method-card"
                                >
                                    {content}
                                </a>
                            ) : (
                                <div key={method.label} className="contact-method-card">
                                    {content}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
