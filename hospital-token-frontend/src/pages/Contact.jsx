import React from 'react';
import { Link } from 'react-router-dom';
import ContentPage from '../components/ContentPage';

const Contact = () => (
  <ContentPage
    title="Contact | GMC Chest and Cancer Hospital Thrissur"
    description="Address, phone numbers and email for Government Medical College Chest and Cancer Hospital, Thrissur, and for support with the online token app."
    eyebrow="Contact"
    heading="Contact Us"
    intro="How to reach the hospital, and who to contact for help with the online token app."
  >
    <h2>Hospital</h2>
    <p>
      Government Medical College Chest and Cancer Hospital<br />
      Department of Radiotherapy, Government Medical College<br />
      Mulamkunnathukavu, Thrissur, Kerala
    </p>
    <ul>
      <li>Phone: <a href="tel:04872200310">0487 2200310</a></li>
      <li>Phone (24/7 emergency): <a href="tel:04872200610">0487 2200610</a></li>
      <li>Email: <a href="mailto:suptmcch@gmail.com">suptmcch@gmail.com</a></li>
      <li>
        Location: <a href="https://maps.app.goo.gl/pjxg31QMgRpSj66U9" target="_blank" rel="noopener noreferrer">open in Google Maps</a>
      </li>
    </ul>

    <h2>Help with the token app or this website</h2>
    <p>
      For problems with the app, booking errors, or questions about this website and its{' '}
      <Link to="/privacy">privacy policy</Link>, email{' '}
      <a href="mailto:gmcchtsrtokenproject@gmail.com">gmcchtsrtokenproject@gmail.com</a>. Please include your CR number
      and a short description of the problem, but never your password.
    </p>
    <p>
      Password resets and corrections to your hospital registration are handled by staff at the hospital counter.
    </p>

    <div className="content-note">
      This website cannot give medical advice and the email addresses above are not monitored for emergencies. In an
      emergency, go to the casualty department or call 108.
    </div>
  </ContentPage>
);

export default Contact;
