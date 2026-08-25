import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

const HospitalLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        document.title = 'Admin Login — GMCC Hospital Thrissur';
    }, []);

    // If already logged in, redirect away
    const token = sessionStorage.getItem('token');
    const hospital = sessionStorage.getItem('hospital');
    if (token && hospital) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    const from = location.state?.from?.pathname || '/admin/dashboard';

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/hospital/login', { email, password });
            if (response.data.success) {
                sessionStorage.setItem('token', response.data.data.token);
                sessionStorage.setItem('hospital', JSON.stringify(response.data.data.hospital));
                navigate(from, { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: '#fafafa',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
            {/* ── Left Panel (Brand) ── */}
            <div style={{
                display: 'none',
                flex: 1,
                background: 'linear-gradient(145deg, #ff0088 0%, #c4006a 100%)',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '3rem',
                position: 'relative',
                overflow: 'hidden'
            }} className="login-brand-panel">
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

                {/* Logo */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
                        <img src="/images/g11.png" alt="GMCCH Logo" style={{ height: '44px', width: '44px', borderRadius: '50%', overflow: 'hidden', background: 'white', padding: '2px', objectFit: 'contain' }} />
                        <div>
                            <div style={{ color: 'white', fontWeight: 900, fontSize: '1rem', lineHeight: 1 }}>GMCCH</div>
                            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Portal</div>
                        </div>
                    </div>

                    <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '1rem' }}>
                        Hospital<br />Management<br />Portal
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '320px' }}>
                        Manage doctors, patients, and hospital units from one secure dashboard.
                    </p>
                </div>

                {/* Bottom Info */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {[
                        { icon: '🏥', text: 'Government Medical College Chest and Cancer Hospital' },
                        { icon: '📍', text: 'Mulamkunnathukavu, Thrissur, Kerala' },
                        { icon: '📞', text: '0487 2200310 · 0487 2200610' },
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 500 }}>{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Right Panel (Form) ── */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                minHeight: '100vh'
            }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>

                    {/* Mobile logo (shown only when left panel is hidden) */}
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }} className="login-mobile-logo">
                        <img src="/images/g11.png" alt="GMCCH" style={{ height: '52px', width: '52px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #f1f5f9', padding: '2px', objectFit: 'contain', margin: '0 auto 0.75rem', display: 'block' }} />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>GMCCH Admin Portal</h2>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Government Medical College Chest & Cancer Hospital</p>
                    </div>

                    {/* Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        padding: '2.5rem',
                        boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
                        border: '1px solid #f1f5f9'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.4rem' }}>
                            Sign in
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '2rem' }}>
                            Enter your credentials to access the dashboard
                        </p>

                        {/* Error Banner */}
                        {error && (
                            <div style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '10px',
                                padding: '0.85rem 1rem',
                                marginBottom: '1.5rem',
                                fontSize: '0.85rem',
                                color: '#ef4444',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin}>
                            {/* Email Field */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Email Address
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        type="email"
                                        placeholder="admin@hospital.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.85rem 1rem 0.85rem 2.75rem',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '12px',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                            fontFamily: 'inherit',
                                            boxSizing: 'border-box',
                                            background: '#fafafa'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#ff0088'}
                                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.85rem 3rem 0.85rem 2.75rem',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '12px',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                            fontFamily: 'inherit',
                                            boxSizing: 'border-box',
                                            background: '#fafafa'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#ff0088'}
                                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '0.95rem',
                                    background: loading ? '#f1a8d0' : '#ff0088',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '0.95rem',
                                    fontWeight: 800,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    transition: 'background 0.2s, transform 0.1s',
                                    fontFamily: 'inherit',
                                    letterSpacing: '0.02em'
                                }}
                                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#d40073'; }}
                                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#ff0088'; }}
                            >
                                {loading ? (
                                    <>
                                        <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                                        Verifying...
                                    </>
                                ) : (
                                    <>Sign In <ArrowRight size={17} /></>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Back to site */}
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                        <Link to="/" style={{ color: '#ff0088', fontWeight: 700, textDecoration: 'none' }}>
                            ← Back to Hospital Website
                        </Link>
                    </p>

                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (min-width: 768px) {
                    .login-brand-panel { display: flex !important; }
                    .login-mobile-logo { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default HospitalLogin;
