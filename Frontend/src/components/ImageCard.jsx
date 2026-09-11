export default function ImageCard({
    id,
    icon: Icon,
    title,
    description,
    variant = 'cleaning',
    height = 'md',
    onClick,
    actionLabel,
}) {
    const classes = [
        'ls-image-card',
        `ls-image-card-${variant}`,
        `ls-image-card-${height}`,
    ].join(' ');

    return (
        <div
            className={classes}
            id={id}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className="ls-image-card-visual" aria-hidden="true">
                <div className="ls-image-card-shape ls-image-card-shape-1" />
                <div className="ls-image-card-shape ls-image-card-shape-2" />
                {Icon && (
                    <div className="ls-image-card-icon">
                        <Icon size={36} strokeWidth={1.5} />
                    </div>
                )}
                <div className="ls-image-card-tag">
                    {variant === 'cleaning' && 'Cleaning'}
                    {variant === 'decoration' && 'Decoration'}
                    {variant === 'both' && 'Cleaning + Decoration'}
                    {variant === 'university' && 'Universities'}
                    {variant === 'apartment' && 'Apartments'}
                    {variant === 'how' && 'Process'}
                </div>
            </div>
            <div className="ls-image-card-body">
                <h3 className="ls-image-card-title">{title}</h3>
                <p className="ls-image-card-description">{description}</p>
                {actionLabel && (
                    <span className="ls-image-card-action">
                        {actionLabel}
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </span>
                )}
            </div>
        </div>
    );
}
