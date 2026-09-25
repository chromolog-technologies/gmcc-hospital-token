import React from 'react';
import { ExternalLink, Cpu, Code2, Smartphone, Cloud, Sparkles } from 'lucide-react';

const TechnologyPartnerSection = () => {
  return (
    <section 
      id="technology-partner" 
      className="tech-partner-section"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
        borderTop: '1px solid #e2e8f0',
        borderBottom: '1px solid #e2e8f0',
        padding: '4rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="container">
        <div 
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
            border: '1px solid #e2e8f0',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* Badge */}
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '50px',
                background: 'rgba(255, 0, 136, 0.08)',
                color: 'var(--primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '1rem'
              }}
            >
              <Sparkles size={14} /> Technology Partner
            </div>

            {/* Subtitle / Intro */}
            <p 
              style={{
                color: '#475569',
                fontSize: '0.95rem',
                maxWidth: '680px',
                lineHeight: 1.6,
                marginBottom: '1.25rem'
              }}
            >
              This digital token management platform is supported by modern software technology and digital solutions from Chromolog Technologies.
            </p>

            {/* Main Company Heading */}
            <h3 
              style={{
                fontSize: '1.875rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                marginBottom: '0.75rem'
              }}
            >
              Chromolog Technologies
            </h3>

            {/* Service Pillars / Badges */}
            <div 
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.75rem',
                color: '#64748b',
                fontSize: '0.825rem',
                fontWeight: 600
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#f1f5f9', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
                <Cpu size={14} style={{ color: 'var(--primary)' }} /> AI
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#f1f5f9', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
                <Code2 size={14} style={{ color: 'var(--primary)' }} /> Web Development
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#f1f5f9', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
                <Smartphone size={14} style={{ color: 'var(--primary)' }} /> Mobile Apps
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#f1f5f9', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
                <Cloud size={14} style={{ color: 'var(--primary)' }} /> SaaS &amp; Cloud Solutions
              </span>
            </div>

            {/* External Link CTA */}
            <a
              href="https://chromologtechnologies.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chromolog Technologies - Technology Partner"
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--primary)',
                color: '#ffffff',
                padding: '0.75rem 1.75rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px var(--primary-shadow)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px var(--primary-shadow)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px var(--primary-shadow)';
              }}
            >
              Visit Chromolog Technologies <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnologyPartnerSection;
