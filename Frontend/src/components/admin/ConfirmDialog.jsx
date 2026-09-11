import { X, AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    loading = false,
    onConfirm,
    onClose,
}) => {
    if (!isOpen) return null;

    const variantClass = {
        danger: 'admin-btn-danger',
        primary: 'admin-btn-primary',
        warning: 'admin-btn-amber',
    }[variant] || 'admin-btn-primary';

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal admin-confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <div className="admin-confirm-icon">
                        <AlertTriangle size={24} />
                    </div>
                    <h3>{title}</h3>
                    <button className="admin-modal-close" onClick={onClose} aria-label="Close confirm dialog">
                        <X size={18} />
                    </button>
                </div>
                {message && (
                    <div className="admin-modal-body">
                        <p className="admin-confirm-message">{message}</p>
                    </div>
                )}
                <div className="admin-modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className={`admin-btn ${variantClass} admin-btn-sm`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
