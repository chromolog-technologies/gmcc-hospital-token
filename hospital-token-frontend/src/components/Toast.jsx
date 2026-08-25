import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ── Context ────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

let _idCounter = 0;
const nextId = () => ++_idCounter;

// ── Provider ───────────────────────────────────────────────────────────────
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        // Remove from DOM after exit animation
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320);
    }, []);

    const toast = useCallback((message, type = 'info', duration = 4000) => {
        const id = nextId();
        setToasts(prev => [...prev, { id, message, type, exiting: false }]);
        if (duration > 0) {
            setTimeout(() => dismiss(id), duration);
        }
        return id;
    }, [dismiss]);

    // Convenience shorthands
    toast.success = (msg, dur)  => toast(msg, 'success', dur);
    toast.error   = (msg, dur)  => toast(msg, 'error',   dur);
    toast.warning = (msg, dur)  => toast(msg, 'warning', dur);
    toast.info    = (msg, dur)  => toast(msg, 'info',    dur);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
};

// ── Hook ───────────────────────────────────────────────────────────────────
/**
 * useToast — returns a toast function with .success / .error / .warning / .info shorthands.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('User created!');
 *   toast.error('Something went wrong.');
 */
export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
};

// ── Toast Container ────────────────────────────────────────────────────────
const ToastContainer = ({ toasts, onDismiss }) => (
    <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        pointerEvents: 'none',   // let clicks pass through gaps
        maxWidth: '380px',
        width: 'calc(100vw - 3rem)',
    }}>
        {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
    </div>
);

// ── Single Toast Item ──────────────────────────────────────────────────────
const VARIANTS = {
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', Icon: CheckCircle,    iconColor: '#22c55e' },
    error:   { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', Icon: XCircle,         iconColor: '#ef4444' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#b45309', Icon: AlertTriangle,   iconColor: '#f59e0b' },
    info:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', Icon: Info,            iconColor: '#3b82f6' },
};

const ToastItem = ({ toast, onDismiss }) => {
    const v = VARIANTS[toast.type] || VARIANTS.info;
    return (
        <div
            role="alert"
            aria-live="polite"
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.9rem 1rem',
                background: v.bg,
                border: `1px solid ${v.border}`,
                borderRadius: '14px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                pointerEvents: 'all',
                animation: toast.exiting
                    ? 'toastOut 0.3s ease forwards'
                    : 'toastIn 0.3s ease forwards',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
        >
            {/* Icon */}
            <v.Icon size={18} style={{ color: v.iconColor, flexShrink: 0, marginTop: '1px' }} />

            {/* Message */}
            <p style={{
                margin: 0,
                flex: 1,
                fontSize: '0.875rem',
                fontWeight: 600,
                color: v.text,
                lineHeight: 1.5,
            }}>
                {toast.message}
            </p>

            {/* Dismiss button */}
            <button
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: v.text,
                    opacity: 0.5,
                    padding: '1px',
                    display: 'flex',
                    flexShrink: 0,
                }}
            >
                <X size={15} />
            </button>
        </div>
    );
};

// ── Keyframe Animations (injected once) ───────────────────────────────────
const styleTag = document.createElement('style');
styleTag.textContent = `
    @keyframes toastIn  { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
    @keyframes toastOut { from { opacity: 1; transform: translateX(0);    } to { opacity: 0; transform: translateX(100%); } }
`;
document.head.appendChild(styleTag);
