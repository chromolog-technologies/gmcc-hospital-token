import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Star, ShieldCheck, HeartPulse, Download, Quote, ExternalLink } from 'lucide-react';

// Actual Google Reviews for Government Medical College Chest and Cancer Hospital, Thrissur
const REVIEWS = [
  {
    name: "Nikhil", initials: "N", avatarColor: "#4285F4",
    role: "Local Guide · 15 reviews · 65 photos", rating: 3, date: "6 months ago",
    text: "There are very capable doctors here, but patients have to spend a lot of time waiting to see them.",
  },
  {
    name: "Rahul Ranjith", initials: "RR", avatarColor: "#34A853",
    role: "Local Guide · 939 reviews · 6534 photos", rating: 3, date: "3 years ago",
    text: "The chest and cancer division in medical college. People can apply for karunya insurance scheme for the treatment. The patients need their ration card, aadhar card, income certificate, 2 photos, medical details, scan & xray details. Within 24 hrs you will get the card. Friendly doctors. Neethi medical shop is there.",
  },
  {
    name: "Binya Francis", initials: "BF", avatarColor: "#EA4335",
    role: "Local Guide · 10 reviews · 2 photos", rating: 4, date: "a year ago",
    text: "Doctors were good but the nurses can be a little more nice. Cleanliness is okay-okay. What's sad is that we can see street dogs and cats even inside the hospital, which are so unhygienic.",
  },
  {
    name: "Alwin James", initials: "AJ", avatarColor: "#FBBC05",
    role: "Local Guide · 15 reviews · 7 photos", rating: 4, date: "2 years ago",
    text: "The Government Medical College Chest Hospital is one of the oldest Hospitals in Kerala. The Hospital is situated near to the New Medical College Hospital & Dental College.",
  },
  {
    name: "Biju Ravi", initials: "BR", avatarColor: "#4285F4",
    role: "247 reviews", rating: 4, date: "2 years ago",
    text: "One of the best service from government. Cancer treatment one roof is on way at Govt. Medical College in Thrissur where, patients undergoing cancer treatment will no longer have to go to multiple hospitals.",
  },
  {
    name: "Rahul VP", initials: "RV", avatarColor: "#34A853",
    role: "Local Guide · 153 reviews · 189 photos", rating: 4, date: "8 years ago",
    text: "Government hospital. Good doctors. Obviously crowded. Staffs also good. Office staffs has to improve their behaviour to patients and their relatives. Neethi medical store should be able to provide all medicines.",
  },
  {
    name: "Bhasi Bahuleyan", initials: "BB", avatarColor: "#EA4335",
    role: "Local Guide · 1,951 reviews · 20298 photos", rating: 4, date: "8 years ago",
    text: "More building structures needed urgently.",
  },
  {
    name: "Sachin PS", initials: "SP", avatarColor: "#FBBC05",
    role: "Local Guide · 7 reviews · 16 photos", rating: 1, date: "8 months ago",
    text: "I'm really disappointed with the Karunya insurance policy services at Thrissur Chest Hospital. While the doctors and nurses are top-notch, the insurance department is a different story altogether. The waiting time is ridiculously long.",
  },
];

// ── Pure presentational sub-components ────────────────────────────────────

/**
 * SvgAvatar — self-hosted alternative to pravatar.cc.
 * Renders a colored SVG circle with initials. Zero network requests.
 */
const DOCTOR_AVATARS = [
  { initials: 'AK', bg: '#4f46e5' },
  { initials: 'SR', bg: '#0891b2' },
  { initials: 'PM', bg: '#059669' },
  { initials: 'VN', bg: '#d97706' },
];

const SvgAvatar = ({ initials, bg }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44" width="44" height="44">
    <circle cx="22" cy="22" r="22" fill={bg} />
    <text
      x="22" y="22"
      dominantBaseline="central"
      textAnchor="middle"
      fill="white"
      fontSize="13"
      fontWeight="800"
      fontFamily="Plus Jakarta Sans, sans-serif"
    >
      {initials}
    </text>
  </svg>
);

const StarRating = ({ count }) => (
  <div className="star-row">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={14} fill={i <= count ? '#FBBF24' : 'transparent'} color={i <= count ? '#FBBF24' : '#D1D5DB'} />
    ))}
  </div>
);

// Avatar background color is dynamic (per reviewer) so we keep only that one inline style
const InitialsAvatar = ({ initials, color }) => (
  <div className="initials-avatar" style={{ background: color }}>
    {initials}
  </div>
);

const GOOGLE_LOGO = "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%20height%3D%2224%22%3E%3Cpath%20fill%3D%22%234285F4%22%20d%3D%22M22.56%2012.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26%201.37-1.04%202.53-2.21%203.31v2.77h3.57c2.08-1.92%203.28-4.74%203.28-8.09z%22%2F%3E%3Cpath%20fill%3D%22%2334A853%22%20d%3D%22M12%2023c2.97%200%205.46-.98%207.28-2.66l-3.57-2.77c-.98.66-2.23%201.06-3.71%201.06-2.86%200-5.29-1.93-6.16-4.53H2.18v2.84C3.99%2020.53%207.7%2023%2012%2023z%22%2F%3E%3Cpath%20fill%3D%22%23FBBC05%22%20d%3D%22M5.84%2014.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43%208.55%201%2010.22%201%2012s.43%203.45%201.18%204.94l2.85-2.22.81-.63z%22%2F%3E%3Cpath%20fill%3D%22%23EA4335%22%20d%3D%22M12%205.38c1.62%200%203.06.56%204.21%201.64l3.15-3.15C17.45%202.09%2014.97%201%2012%201%207.7%201%203.99%203.47%202.18%207.06l3.66%202.84c.87-2.6%203.3-4.52%206.16-4.52z%22%2F%3E%3C%2Fsvg%3E";
const REVIEW_URL  = "https://www.google.com/search?sca_esv=55117bfb786c3fb6&si=AL3DRZHrmvnFAVQPOO2Bzhf8AX9KZZ6raUI_dT7DG_z0kV2_x7N5Kx8xRdty5DVShoC9uzqQ8WTLIROeDOA8B6_hbwiRnyRXRk8KcYdVL-gNKm8V1fMekpMfD9m0KEUDhVZnK6qBfHkJftEg9sHztrxMGLqAxWHhhfr6uXkPr7cT89F1MLvkIS26UOzTrh9VvYXUm_xJaRKT&q=Government+Medical+College+Chest+and+cancer+Hospital,+Thrissur+Reviews&sa=X&ved=2ahUKEwjproLJwqyUAxVlS3ADHegnMvIQ0bkNegQILhAH";

// ── Page Component ─────────────────────────────────────────────────────────
const Home = () => {
  useEffect(() => {
    document.title = 'GMCC Hospital Thrissur | Token Management System';
  }, []);

  return (
  <div className="home-shell">
    <Header />

    <main className="home-main">

      {/* ─── Hero Section ─── */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">

            {/* Left — copy */}
            <div className="hero-left">
              <span className="hero-badge">Making Your Life Easy and Happy</span>

              <h1 className="hero-h1">
                For A Better <br />
                <span className="hero-h1-accent">Treatment</span>
              </h1>

              <p className="hero-desc">
                Government Medical College Chest and Cancer Hospital, Thrissur — delivering quality respiratory and oncological care since 1982.
              </p>

              <div className="hero-actions">
                <a href="https://play.google.com/store/apps/details?id=gmcch.vast.token" className="btn btn-primary hero-btn-primary">
                  Download App <Download size={18} />
                </a>
                <a href="#about" className="hero-btn-outline">
                  Learn More
                </a>
              </div>

              {/* Social proof */}
              <div className="hero-proof">
                <div className="hero-avatars">
                  {DOCTOR_AVATARS.map((doc, i) => (
                    <div key={i} className="hero-avatar">
                      <SvgAvatar initials={doc.initials} bg={doc.bg} />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="hero-proof-label">50+ Professional Doctors</p>
                  <div className="hero-star-row">
                    {[1,2,3,4,5].map(i => <Star key={i} size={13} fill="#FBBF24" color="#FBBF24" />)}
                    <span className="hero-rating-text">4.4 on Google</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — image */}
            <div className="hero-right">
              <div className="hero-glow" />
              <div className="hero-img-wrap">
                <img src="/images/doctor-banner.png" alt="Doctor at GMCCH" />
              </div>

              {/* Floating: Verified Hospital */}
              <div className="hero-badge-card hero-badge-card--tl">
                <div className="hero-badge-icon hero-badge-icon--pink"><ShieldCheck size={18} /></div>
                <div>
                  <p className="hero-badge-title">Verified Hospital</p>
                  <p className="hero-badge-sub">Govt. Accredited</p>
                </div>
              </div>

              {/* Floating: 24/7 Emergency */}
              <div className="hero-badge-card hero-badge-card--br">
                <div className="hero-badge-icon hero-badge-icon--dark"><HeartPulse size={18} /></div>
                <div>
                  <p className="hero-badge-title">24/7 Emergency</p>
                  <p className="hero-badge-sub">Always Ready</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── About Us Section ─── */}
      <section id="about" className="about-section">
        <div className="container">
          <h2 className="about-heading">About Us</h2>
          <div className="about-grid">
            <div className="about-img-wrap">
              <img src="/images/Chest-Hospital.jpg" alt="GMCCH Building" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
            </div>
            <div>
              <h3 className="about-h3">Government Medical College Chest and Cancer Hospital, Thrissur</h3>
              <p className="about-p">
                Inaugurated on 1 April 1982 by the Governor of Kerala Jothi Venkatachalam, the hospital began at Mannuthy and moved to its permanent site at Mulakunnathukavu by March 1983. Today it stands as one of Kerala's premier institutions for respiratory and oncological treatment.
              </p>
              <div className="about-accent-bar" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Google Reviews Section ─── */}
      <section className="reviews-section">
        <div className="container">

          {/* Header row */}
          <div className="reviews-header">
            <div>
              <h2 className="reviews-h2">Patient Reviews</h2>
              <div className="reviews-meta">
                <img src={GOOGLE_LOGO} alt="Google" width={22} height={22} />
                <span className="reviews-meta-text">Based on Google Reviews</span>
                <StarRating count={4} />
                <span className="reviews-rating-val">4.4</span>
                <span className="reviews-rating-count">(200+ reviews)</span>
              </div>
            </div>
            <a href={REVIEW_URL} target="_blank" rel="noopener noreferrer" className="reviews-link-btn">
              View All Reviews <ExternalLink size={15} />
            </a>
          </div>

          {/* Cards */}
          <div className="reviews-grid">
            {REVIEWS.map((review, idx) => (
              <div key={idx} className="review-card">
                <div className="review-card-top">
                  <div className="review-card-author">
                    <InitialsAvatar initials={review.initials} color={review.avatarColor} />
                    <div>
                      <p className="review-name">{review.name}</p>
                      <p className="review-role">{review.role}</p>
                      <p className="review-date">{review.date}</p>
                    </div>
                  </div>
                  <img src={GOOGLE_LOGO} alt="Google" className="review-g-logo" />
                </div>

                <StarRating count={review.rating} />

                <div className="review-quote-wrap">
                  <Quote size={18} className="review-quote-icon" />
                  <p className="review-text">{review.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Write Review CTA */}
          <div className="review-cta">
            <h3 className="review-cta-h3">Share Your Experience</h3>
            <p className="review-cta-p">Your feedback helps us improve and helps others make informed decisions.</p>
            <a
              href="https://www.google.com/search?q=Government+Medical+College+Chest+and+cancer+Hospital+Thrissur"
              target="_blank" rel="noopener noreferrer"
              className="btn btn-primary review-cta-btn"
            >
              Write a Google Review <ExternalLink size={16} />
            </a>
          </div>

        </div>
      </section>

      {/* ─── CTA Banner Section ─── */}
      <section className="cta-section">
        <div className="cta-bg-svg">
          <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
            <path d="M0 50 Q 100 0 200 50 T 400 50" stroke="white" fill="transparent" strokeWidth="1" />
            <path d="M0 70 Q 100 20 200 70 T 400 70" stroke="white" fill="transparent" strokeWidth="1" />
          </svg>
        </div>
        <div className="container cta-inner">
          <h2 className="cta-h2">Experience Better Healthcare</h2>
          <p className="cta-p">
            Join thousands of patients from across Kerala who trust GMCCH Thrissur for world-class respiratory and cancer care.
          </p>
          <a href="https://play.google.com/store/apps/details?id=gmcch.vast.token" className="cta-btn">
            Download Patient App <Download size={20} />
          </a>
        </div>
      </section>

    </main>

    <Footer />
  </div>
  );
};


export default Home;
