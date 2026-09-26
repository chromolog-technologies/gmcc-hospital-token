import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ExternalLink, ShieldCheck, Server, Smartphone, Monitor, Code2, Sparkles, CheckCircle2 } from 'lucide-react';

const ProjectInformation = () => {
  useEffect(() => {
    document.title = 'System & Technology Information | GMC Chest Hospital Token Management System';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Header />

      <main style={{ flex: 1, padding: '3rem 0' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          
          {/* Header Banner */}
          <div 
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              padding: '2.5rem',
              borderRadius: '16px',
              marginBottom: '2.5rem',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)'
            }}
          >
            <span 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '50px',
                background: 'rgba(255, 0, 136, 0.2)',
                color: '#ff0088',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '1rem'
              }}
            >
              System Information &amp; Attribution
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
              GMC Chest Hospital Token Management System
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, maxWidth: '750px', margin: 0 }}>
              The digital token management platform designed to support remote token booking, walk-in token generation, and live Outpatient Department (OPD) queue management for Government Medical College Chest and Cancer Hospital, Thrissur.
            </p>
          </div>

          {/* Grid Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            
            {/* System Overview Card */}
            <div 
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '1.75rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck style={{ color: 'var(--primary)' }} size={22} /> Platform Overview
              </h2>
              <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                The GMC Chest Hospital Token Management System provides structured digital queue management to minimize patient wait times and optimize consultation workflows for healthcare staff.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#334155' }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} /> Remote Token Booking via Patient Mobile App
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#334155' }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} /> Real-time OPD Queue Visibility
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#334155' }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} /> Doctor Queue Progress &amp; Call Interface
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#334155' }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} /> Centralized Admin Operations Dashboard
                </li>
              </ul>
            </div>

            {/* Architecture Card */}
            <div 
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '1.75rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Server style={{ color: 'var(--primary)' }} size={22} /> Platform Subsystems
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Smartphone style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} size={18} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Mobile Application</strong>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>Cross-platform mobile app for patients to book tokens and track queue status.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Monitor style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} size={18} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Web Administration Portal</strong>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>Web dashboard for hospital administration and offline token generation.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Code2 style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} size={18} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Centralized API Gateway</strong>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>Secure RESTful backend providing role-based access control and transactional integrity.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Technology Partner Dedicated Section */}
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '2.5rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Sparkles style={{ color: 'var(--primary)' }} size={22} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Technology &amp; Software Development
              </h2>
            </div>
            
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              The GMC Chest Hospital Thrissur Token Management System provides digital token and queue-management functionality. The software technology and development support for the platform is provided by <strong>Chromolog Technologies</strong>.
            </p>

            <div 
              style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #cbd5e1',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                  Chromolog Technologies
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>
                  Software Development &amp; Technology Partner
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                  AI • Web Development • Mobile Apps • SaaS • Cloud Solutions
                </p>
              </div>

              <a
                href="https://chromologtechnologies.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chromolog Technologies - Technology Partner"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  padding: '0.65rem 1.35rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px var(--primary-shadow)'
                }}
              >
                Visit Official Website <ExternalLink size={15} />
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectInformation;
