export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    className = '',
    ...props
}) {
    const baseClass = 'button';
    const variantClass = `button-${variant}`;
    const sizeClass = `button-${size}`;
    const widthClass = fullWidth ? 'button-full-width' : '';

    const classes = [baseClass, variantClass, sizeClass, widthClass, className]
        .filter(Boolean)
        .join(' ');

    return (
        <button className={classes} disabled={disabled} {...props}>
            {children}
        </button>
    );
}
