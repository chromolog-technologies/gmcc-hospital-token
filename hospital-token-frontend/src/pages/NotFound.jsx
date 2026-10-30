import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NotFound = () => {
  useEffect(() => {
    document.title = 'Page Not Found | GMC Chest Hospital Thrissur';
    // Tell crawlers not to index unknown URLs as duplicates of the home page
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <div className="home-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: '5rem 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>Page not found</h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>The page you are looking for does not exist or has moved.</p>
          <Link to="/" className="btn btn-primary">Go to the home page</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
