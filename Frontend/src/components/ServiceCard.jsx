export default function ServiceCard({ id, icon: Icon, title, description }) {
    return (
        <div className="service-card" id={id}>
            {Icon && (
                <div className="service-icon">
                    <Icon size={28} />
                </div>
            )}
            <h3 className="service-title">{title}</h3>
            <p className="service-description">{description}</p>
        </div>
    );
}
