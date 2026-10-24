import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useAdSense, usePageMeta } from '../lib/adsense';

/**
 * Shared layout for public, text-based information pages
 * (About, How to Book, FAQ, Contact, Terms).
 */
const ContentPage = ({ title, description, eyebrow, heading, intro, children }) => {
  useAdSense();
  usePageMeta(title, description);

  return (
    <div className="home-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Header />

      <main style={{ flex: 1, padding: '3rem 0' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              padding: '2.5rem',
              borderRadius: '16px',
              marginBottom: '2rem',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)'
            }}
          >
            {eyebrow && (
              <div style={{ color: '#ff0088', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                {eyebrow}
              </div>
            )}
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
              {heading}
            </h1>
            {intro && <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>{intro}</p>}
          </div>

          <article className="content-article">
            {children}
          </article>
        </div>
      </main>

      <Footer />

      <style>{`
        .content-article {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 2rem;
          color: #334155;
          line-height: 1.75;
          font-size: 0.975rem;
        }
        .content-article h2 {
          font-size: 1.4rem; font-weight: 800; color: #0f172a;
          margin: 2rem 0 0.75rem; padding-bottom: 0.4rem; border-bottom: 2px solid #f1f5f9;
        }
        .content-article h2:first-child { margin-top: 0; }
        .content-article h3 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 1.5rem 0 0.5rem; }
        .content-article p { margin: 0 0 1rem; }
        .content-article ul, .content-article ol { margin: 0 0 1rem 1.25rem; }
        .content-article li { margin-bottom: 0.4rem; }
        .content-article a { color: var(--primary); font-weight: 600; }
        .content-article table { width: 100%; border-collapse: collapse; margin: 0 0 1rem; font-size: 0.9rem; }
        .content-article th, .content-article td { border: 1px solid #e2e8f0; padding: 0.6rem 0.75rem; text-align: left; vertical-align: top; }
        .content-article th { background: #f8fafc; color: #0f172a; }
        .content-note {
          background: #fff7fb; border-left: 4px solid var(--primary);
          padding: 1rem 1.25rem; border-radius: 8px; margin: 0 0 1rem;
        }
        @media (max-width: 600px) { .content-article { padding: 1.25rem; } }
      `}</style>
    </div>
  );
};

export default ContentPage;
