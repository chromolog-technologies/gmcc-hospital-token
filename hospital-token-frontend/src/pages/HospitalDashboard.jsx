import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { dashboardCache, CACHE_KEYS } from '../lib/dashboardCache';
import { LayoutDashboard, Users, Stethoscope, Layers, LogOut, RefreshCw, Menu as MenuIcon, X } from 'lucide-react';

import OverviewTab from '../components/dashboard/OverviewTab';
import UserTab     from '../components/dashboard/UserTab';
import DoctorTab   from '../components/dashboard/DoctorTab';
import UnitTab     from '../components/dashboard/UnitTab';
import BookingTab  from '../components/dashboard/BookingTab';

const NAV = [
    { id: 'overview', label: 'Overview',        icon: LayoutDashboard },
    { id: 'users',    label: 'Users',            icon: Users           },
    { id: 'doctors',  label: 'Doctors',          icon: Stethoscope     },
    { id: 'units',    label: 'Units',            icon: Layers          },
    { id: 'bookings', label: 'Bookings',         icon: LayoutDashboard },
];

const HospitalDashboard = () => {
    const [hospital,    setHospital]    = useState(null);
    const [summary,     setSummary]     = useState(null);
    const [units,       setUnits]       = useState([]);
    const [activeTab,   setActiveTab]   = useState('overview');
    const [mobileOpen,  setMobileOpen]  = useState(false);
    const [loadError,   setLoadError]   = useState(false);
    const [refreshing,  setRefreshing]  = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [bookingRefreshKey, setBookingRefreshKey] = useState(0);

    const navigate = useNavigate();

    const fetchData = useCallback(async (force = false) => {
        if (!force) {
            const cachedSummary = dashboardCache.get(CACHE_KEYS.SUMMARY);
            const cachedUnits   = dashboardCache.get(CACHE_KEYS.UNITS);
            if (cachedSummary && cachedUnits) {
                setSummary(cachedSummary);
                setUnits(cachedUnits);
                setLoadError(false);
                const age = dashboardCache.getAge(CACHE_KEYS.SUMMARY);
                if (age !== null) setLastUpdated(new Date(Date.now() - age * 1000));
                return;
            }
        }
        setRefreshing(true);
        try {
            const [sumRes, unitRes] = await Promise.all([
                api.get('/hospital/dashboard/summary'),
                api.get('/hospital/dashboard/units'),
            ]);
            const summaryData = sumRes.data.success  ? sumRes.data.data  : null;
            const unitsData   = unitRes.data.success ? unitRes.data.data : [];
            if (summaryData) { dashboardCache.set(CACHE_KEYS.SUMMARY, summaryData); setSummary(summaryData); }
            dashboardCache.set(CACHE_KEYS.UNITS, unitsData);
            setUnits(unitsData);
            setLoadError(false);
            setLastUpdated(new Date());
        } catch {
            setLoadError(true);
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        document.title = 'Admin Dashboard — GMCC Hospital Thrissur';
        const stored = sessionStorage.getItem('hospital');
        if (!stored) { navigate('/'); return; }
        setHospital(JSON.parse(stored));
        fetchData();
    }, [navigate, fetchData]);

    const handleMutation = useCallback(() => {
        dashboardCache.invalidate(CACHE_KEYS.SUMMARY);
        dashboardCache.invalidate(CACHE_KEYS.UNITS);
        fetchData(true);
    }, [fetchData]);

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            console.error('Logout failed:', e);
        } finally {
            dashboardCache.invalidateAll();
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('hospital');
            navigate('/Adminlogin');
        }
    };

    const handleManualRefresh = () => {
        dashboardCache.invalidate(CACHE_KEYS.SUMMARY);
        dashboardCache.invalidate(CACHE_KEYS.UNITS);
        fetchData(true);
        // Also trigger a fresh fetch inside BookingTab if it's active
        setBookingRefreshKey(k => k + 1);
        setMobileOpen(false);
    };

    const switchTab = (id) => {
        setActiveTab(id);
        setMobileOpen(false);
    };

    if (!hospital) return <LoadingScreen />;
    if (loadError)  return <ErrorScreen onRetry={() => fetchData(true)} onLogout={handleLogout} />;

    return (
        <div style={css.shell}>

            {/* ══════════════════ HORIZONTAL TOP NAVBAR ══════════════════ */}
            <header style={css.navbar}>
                {/* Left — Logo */}
                <div style={css.navLeft}>
                    <img src="/images/g11.png" alt="GMCCH Logo" style={{ height: '34px', flexShrink: 0 }} />
                    <div>
                        <div style={css.brandName}>GMCCH</div>
                        <div style={css.brandSub}>Admin Panel</div>
                    </div>
                </div>

                {/* Centre — Nav tabs (desktop) */}
                <nav style={css.navTabs}>
                    {NAV.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => switchTab(id)}
                            style={{ ...css.tab, ...(activeTab === id ? css.tabActive : {}) }}
                        >
                            <Icon size={15} />
                            {label}
                        </button>
                    ))}
                </nav>

                {/* Right — Refresh + last updated + logout (desktop) */}
                <div style={css.navRight}>
                    {lastUpdated && (
                        <span style={css.updatedText}>Updated {formatAge(lastUpdated)}</span>
                    )}
                    <button
                        onClick={handleManualRefresh}
                        disabled={refreshing}
                        style={css.refreshBtn}
                        title="Refresh data"
                    >
                        <RefreshCw size={14} style={{ animation: refreshing ? 'dashSpin 0.8s linear infinite' : 'none' }} />
                        {refreshing ? 'Refreshing…' : 'Refresh'}
                    </button>
                    <button onClick={handleLogout} style={css.logoutBtn} title="Sign out">
                        <LogOut size={15} />
                        Sign Out
                    </button>
                    {/* Mobile hamburger */}
                    <button onClick={() => setMobileOpen(o => !o)} style={css.hamburger} className="dash-hamburger">
                        {mobileOpen ? <X size={20} /> : <MenuIcon size={20} />}
                    </button>
                </div>
            </header>

            {/* ══════════════════ MOBILE DROPDOWN NAV ══════════════════ */}
            {mobileOpen && (
                <div style={css.mobileMenu} className="dash-mobile-menu">
                    {NAV.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => switchTab(id)}
                            style={{ ...css.mobileItem, ...(activeTab === id ? css.mobileItemActive : {}) }}
                        >
                            <Icon size={16} /> {label}
                        </button>
                    ))}
                    <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0.25rem 0' }} />
                    <button onClick={handleManualRefresh} style={css.mobileItem} disabled={refreshing}>
                        <RefreshCw size={16} style={{ animation: refreshing ? 'dashSpin 0.8s linear infinite' : 'none' }} />
                        {refreshing ? 'Refreshing…' : 'Refresh Data'}
                    </button>
                    <button onClick={handleLogout} style={{ ...css.mobileItem, color: '#ef4444' }}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            )}

            {/* ══════════════════ MAIN CONTENT ══════════════════════════ */}
            <main style={css.main}>
                {!summary ? (
                    <p style={{ color: '#94a3b8', padding: '2rem' }}>Loading data…</p>
                ) : (
                    <>
                        {activeTab === 'overview' && <OverviewTab hospital={hospital} summary={summary} units={units} />}
                        {activeTab === 'users'    && <UserTab />}
                        {activeTab === 'doctors'  && <DoctorTab units={units} onDoctorAdded={handleMutation} />}
                        {activeTab === 'units'    && <UnitTab units={units} onUnitAdded={handleMutation} />}
                        {activeTab === 'bookings' && <BookingTab onBookingChanged={handleMutation} refreshKey={bookingRefreshKey} />}
                    </>
                )}
            </main>

            <style>{`
                @keyframes dashSpin { to { transform: rotate(360deg); } }

                /* Hide hamburger on desktop, show nav tabs */
                .dash-hamburger    { display: none !important; }
                .dash-mobile-menu  { display: none !important; }

                @media (max-width: 768px) {
                    .dash-hamburger   { display: flex !important; }
                    .dash-mobile-menu { display: flex !important; }
                    /* Hide desktop nav + right controls (except hamburger) */
                    [data-desk]       { display: none !important; }
                }
            `}</style>
        </div>
    );
};

// ── Helpers ────────────────────────────────────────────────────────────────
function formatAge(date) {
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 10)  return 'just now';
    if (s < 60)  return `${s}s ago`;
    if (s < 120) return '1 min ago';
    return `${Math.floor(s / 60)} mins ago`;
}

// ── Screens ────────────────────────────────────────────────────────────────
const LoadingScreen = () => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#94a3b8' }}>Loading dashboard…</p>
    </div>
);

const ErrorScreen = ({ onRetry, onLogout }) => (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <p style={{ color: '#ef4444', fontWeight: 700 }}>⚠️ Could not connect to the server.</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={onRetry}  style={{ padding: '0.6rem 1.25rem', background: '#ff0088', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Retry</button>
            <button onClick={onLogout} style={{ padding: '0.6rem 1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Logout</button>
        </div>
    </div>
);

// ── Styles ─────────────────────────────────────────────────────────────────
const css = {
    shell: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#f8fafc',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
    },

    /* ── Top Navbar ── */
    navbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '0 1.5rem',
        height: '60px',
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },

    navLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        flexShrink: 0,
    },
    brandName: { fontWeight: 900, fontSize: '0.9rem', color: '#0f172a', lineHeight: 1.1 },
    brandSub:  { fontSize: '0.58rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' },

    /* Horizontal nav tabs */
    navTabs: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        flex: 1,
        justifyContent: 'center',
    },
    tab: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.45rem 0.9rem',
        borderRadius: '8px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        color: '#64748b',
        fontSize: '0.82rem',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        transition: 'background 0.15s, color 0.15s',
    },
    tabActive: {
        background: '#ff0088',
        color: 'white',
        boxShadow: '0 3px 10px rgba(255,0,136,0.25)',
    },

    navRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexShrink: 0,
    },
    updatedText: {
        fontSize: '0.68rem',
        color: '#94a3b8',
        whiteSpace: 'nowrap',
    },
    refreshBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.4rem 0.85rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        background: '#f8fafc',
        cursor: 'pointer',
        color: '#475569',
        fontWeight: 600,
        fontSize: '0.75rem',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
    },
    logoutBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.4rem 0.85rem',
        border: '1px solid #fee2e2',
        borderRadius: '8px',
        background: '#fff5f5',
        cursor: 'pointer',
        color: '#ef4444',
        fontWeight: 700,
        fontSize: '0.75rem',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
    },
    hamburger: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#475569',
        padding: '0.3rem',
        display: 'flex',
    },

    /* Mobile dropdown */
    mobileMenu: {
        flexDirection: 'column',
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.5rem 1rem',
        gap: '0.1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    },
    mobileItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        width: '100%',
        padding: '0.7rem 0.75rem',
        border: 'none',
        borderRadius: '8px',
        background: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        color: '#475569',
        fontSize: '0.875rem',
        fontFamily: 'inherit',
        textAlign: 'left',
    },
    mobileItemActive: {
        background: '#fff5fa',
        color: '#ff0088',
    },

    /* Main content — full width, no offset needed */
    main: {
        flex: 1,
        padding: '1.75rem 1.5rem',
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
    },
};

export default HospitalDashboard;
