import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" style={{ background: '#ffffff', color: '#0f172a', paddingTop: '2rem', paddingBottom: '2.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif", borderTop: '1px solid #e2e8f0' }}>
      <div className="container">
        <h2 style={{ textAlign: 'center', fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '0.15em' }}>Contact Us</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', marginBottom: '4rem', alignItems: 'center' }}>
          
          {/* Map Column */}
          <div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)', height: '350px', border: '4px solid #f1f5f9', marginBottom: '1rem' }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3922.3789498263544!2d76.216667!3d10.516667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba7ee0f91882d25%3A0xc33e5c94294e1e0a!2sGovernment%20Medical%20College%20Thrissur!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Hospital Map"
              ></iframe>
            </div>
            <a
              href="https://maps.app.goo.gl/pjxg31QMgRpSj66U9"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#64748b',
                transition: 'color 0.15s',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
            >
              <MapPin size={14} /> View Precise Location on Google Maps
            </a>
          </div>

          {/* Contact Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Address</h4>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <MapPin size={18} style={{ color: 'var(--primary)', marginTop: '0.25rem', flexShrink: 0 }} />
                <p style={{ color: '#334155', fontWeight: 500, fontSize: '0.875rem', lineHeight: '1.625', margin: 0 }}>
                  Department of Radiotherapy Government Medical College Mulamkunnathukavu, Thrissur
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Mail size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <p style={{ color: '#334155', fontWeight: 500, fontSize: '0.875rem', margin: 0 }}>suptmcch@gmail.com</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Phone size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <p style={{ color: '#334155', fontWeight: 500, fontSize: '0.875rem', margin: 0 }}>0487 2200310</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem' }}>
              <Phone size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <p style={{ color: '#334155', fontWeight: 500, fontSize: '0.875rem', margin: 0 }}>0487 2200610</p>
            </div>

            <div>
              <Link to="/privacy" style={{ fontSize: '0.75rem', color: '#64748b', transition: 'color 0.15s', textDecoration: 'underline' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>Privacy Policy</Link>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <a href="https://www.facebook.com/mcchtsr/" target="_blank" rel="noopener noreferrer" style={{ width: '2.5rem', height: '2.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', transition: 'all 0.15s', borderRadius: '8px', color: '#475569', textDecoration: 'none' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'white'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}>
                <span style={{ fontWeight: 900, fontSize: '0.75rem' }}>FB</span>
              </a>
              <a href="#" style={{ width: '2.5rem', height: '2.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', transition: 'all 0.15s', borderRadius: '8px', color: '#475569', textDecoration: 'none' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'white'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}>
                <span style={{ fontWeight: 900, fontSize: '0.75rem' }}>G+</span>
              </a>
            </div>
          </div>
        </div>

        <hr style={{ borderColor: '#e2e8f0', marginBottom: '2rem', borderTopWidth: '1px', borderStyle: 'solid' }} />

        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
          <p style={{ marginBottom: '0.5rem' }}>Copyright © 2021, Government Medical College Chest and Cancer Hospital, Thrissur.</p>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <a href="#" style={{ color: '#64748b', textDecoration: 'underline' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>Privacy Policy</a>
            <a href="#" style={{ color: '#64748b', textDecoration: 'underline' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
