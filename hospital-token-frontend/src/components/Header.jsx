import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Menu, X, Smartphone } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* ── Top Info Bar ── */}
      <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0.4rem 0', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.02em' }}>
          Government Medical College Chest and Cancer Hospital, Thrissur
        </p>
      </div>

      {/* ── Main Navbar ── */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div className="container" style={{ padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

            {/* Logo + Name */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <img src="/images/g11.png" alt="GMCCH Logo" style={{ height: '40px', width: 'auto' }} />
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#0f172a', lineHeight: 1, letterSpacing: '-0.01em' }}>GMCCH THRISSUR</div>
                <div style={{ fontWeight: 700, fontSize: '0.6rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>Chest &amp; Cancer Hospital</div>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
              <NavLink to="/" label="Home" />
              <NavLink href="#about" label="About" />
              <NavLink href="#contact" label="Contact" />
            </div>

            {/* Hamburger */}
            <button
              className="hamburger-btn"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#0f172a' }}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Emergency Bar ── */}
      <div style={{ background: 'var(--primary)', padding: '0.5rem 0' }}>
        <div className="container" style={{ padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
            <Phone size={14} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>0487-2200610</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.75, marginLeft: '0.25rem' }}>· Emergency 24/7</span>
          </div>
          <a
            href="https://play.google.com/store/apps/details?id=gmcch.vast.token"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'white', color: 'var(--primary)',
              padding: '0.35rem 1rem', borderRadius: '6px',
              fontSize: '0.75rem', fontWeight: 800, textDecoration: 'none',
              letterSpacing: '0.02em'
            }}
          >
            <Smartphone size={13} /> Book via App
          </a>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {/* Overlay */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)', zIndex: 200
          }}
        />
      )}

      {/* Drawer Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '280px',
        background: 'white',
        zIndex: 300,
        display: 'flex', flexDirection: 'column',
        transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.15)'
      }}>
        {/* Drawer Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img src="/images/g11.png" alt="Logo" style={{ height: '32px' }} />
            <div style={{ fontWeight: 900, fontSize: '0.85rem', color: '#0f172a' }}>GMCCH</div>
          </div>
          <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.25rem' }}>
            <X size={22} />
          </button>
        </div>

        {/* Nav Items */}
        <nav style={{ padding: '1rem 0', flexGrow: 1 }}>
          <DrawerLink to="/" label="Home" onClick={() => setIsMenuOpen(false)} />
          <DrawerLink href="#about" label="About Us" onClick={() => setIsMenuOpen(false)} />
          <DrawerLink href="#contact" label="Contact Us" onClick={() => setIsMenuOpen(false)} />
        </nav>

        {/* App Download */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Patient Mobile App</p>
          <a
            href="https://play.google.com/store/apps/details?id=gmcch.vast.token"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              width: '100%', padding: '0.85rem',
              background: 'var(--primary)', color: 'white',
              borderRadius: '10px', fontWeight: 800, fontSize: '0.875rem',
              textDecoration: 'none'
            }}
          >
            <Smartphone size={16} /> Download Now
          </a>
        </div>
      </div>

      <style>{`
        .desktop-nav { display: none; }
        .hamburger-btn { display: flex; }
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .hamburger-btn { display: none !important; }
        }
      `}</style>
    </>
  );
};

/* ── Sub-components ── */
const NavLink = ({ to, href, label }) => {
  const style = {
    padding: '0.5rem 0.85rem',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#475569',
    textDecoration: 'none',
    transition: 'background 0.15s, color 0.15s',
    display: 'inline-block'
  };
  if (to) return <Link to={to} style={style} onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}>{label}</Link>;
  return <a href={href} style={style} onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}>{label}</a>;
};

const DrawerLink = ({ to, href, label, onClick, highlight }) => {
  const style = {
    display: 'block', padding: '0.8rem 1.5rem',
    fontSize: '0.9rem', fontWeight: highlight ? 700 : 600,
    color: highlight ? 'var(--primary)' : '#334155',
    textDecoration: 'none',
    transition: 'background 0.15s',
    cursor: 'pointer', background: 'none', border: 'none', width: '100%', textAlign: 'left'
  };
  if (to) return <Link to={to} style={style} onClick={onClick} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>{label}</Link>;
  return <a href={href} style={style} onClick={onClick} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>{label}</a>;
};

export default Header;
