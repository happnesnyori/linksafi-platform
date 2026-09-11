import React, { useState, useCallback, useEffect, useContext, createContext } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import './Toast.css';

let toastId = 0;

const ToastContext = createContext(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const ToastContainer = ({ toasts, removeToast }) => (
    <div className="toast-container">
        {toasts.map((toast) => (
            <div
                key={toast.id}
                className={`toast toast-${toast.type}`}
                role="alert"
            >
                <div className="toast-icon">
                    {toast.type === 'success' && <CheckCircle size={18} />}
                    {toast.type === 'error' && <XCircle size={18} />}
                    {toast.type === 'warning' && <AlertTriangle size={18} />}
                    {toast.type === 'info' && <Info size={18} />}
                </div>
                <div className="toast-content">
                    <p className="toast-message">{toast.message}</p>
                </div>
                <button
                    className="toast-close"
                    onClick={() => removeToast(toast.id)}
                    aria-label="Close notification"
                >
                    <X size={16} />
                </button>
                <div className="toast-progress" />
            </div>
        ))}
    </div>
);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'info') => {
        const id = ++toastId;
        const newToast = { id, message, type };

        setToasts((prev) => [...prev, newToast]);

        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export default ToastProvider;