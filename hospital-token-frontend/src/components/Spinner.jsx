import React from 'react';

/**
 * Spinner — lightweight animated SVG ring for use inside buttons.
 *
 * Usage:
 *   <Spinner size={16} color="white" />
 *   <Spinner size={14} color="#ff0088" />
 *
 * Props:
 *   size  — diameter in px (default 16)
 *   color — stroke color   (default "currentColor")
 */
const Spinner = ({ size = 16, color = 'currentColor' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animation: 'spinnerRing 0.75s linear infinite', flexShrink: 0 }}
        aria-label="Loading"
        role="status"
    >
        {/* Track ring */}
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.25" />
        {/* Active arc */}
        <path
            d="M12 2 A10 10 0 0 1 22 12"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
        />

        <style>{`
            @keyframes spinnerRing {
                from { transform: rotate(0deg);   }
                to   { transform: rotate(360deg); }
            }
        `}</style>
    </svg>
);

/**
 * LoadingButton — a button that automatically shows a spinner and
 * disables itself while `loading` is true.
 *
 * Usage:
 *   <LoadingButton
 *       loading={loading.add}
 *       label="Create User"
 *       loadingLabel="Creating…"
 *       style={...}
 *   />
 *
 * Props:
 *   loading      — boolean
 *   label        — text shown when idle
 *   loadingLabel — text shown while loading (default: label + '…')
 *   spinnerColor — color of the spinner ring (default: 'white')
 *   type         — button type (default: 'submit')
 *   style        — additional styles
 *   onClick      — click handler
 *   disabled     — additional disabled conditions (on top of `loading`)
 */
export const LoadingButton = ({
    loading,
    label,
    loadingLabel,
    spinnerColor = 'white',
    type = 'submit',
    style = {},
    onClick,
    disabled = false,
}) => {
    const isDisabled = loading || disabled;
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: isDisabled ? 0.65 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
                ...style,
            }}
        >
            {loading && <Spinner size={15} color={spinnerColor} />}
            {loading ? (loadingLabel ?? `${label}…`) : label}
        </button>
    );
};

export default Spinner;
