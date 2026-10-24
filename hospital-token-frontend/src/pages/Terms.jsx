import React from 'react';
import { Link } from 'react-router-dom';
import ContentPage from '../components/ContentPage';

const Terms = () => (
  <ContentPage
    title="Terms of Use and Disclaimer | GMC Chest Hospital Thrissur Online Token"
    description="Terms of use and medical disclaimer for the GMC Chest and Cancer Hospital, Thrissur online token website and patient app."
    eyebrow="Legal"
    heading="Terms of Use and Disclaimer"
    intro="Please read these terms before using this website or the patient token app."
  >
    <h2>Use of the service</h2>
    <p>
      This website and the patient app provide information about the hospital and let registered patients book
      outpatient tokens. By using them you agree to these terms. Book tokens only for yourself, or for a patient you
      care for with their permission, and use your own CR number and password.
    </p>

    <h2>Tokens and appointments</h2>
    <ul>
      <li>A token reserves a place in the outpatient queue for one clinic day. It is not a guarantee of a fixed consultation time.</li>
      <li>The hospital may change unit days, cancel clinics or reorder patients when clinically necessary.</li>
      <li>Bookings made with false details, or repeated bookings that are not used, may be cancelled by the hospital.</li>
    </ul>

    <h2>Medical disclaimer</h2>
    <p>
      Information on this website is general and is not medical advice. It does not replace consultation with a
      doctor. Do not delay seeking treatment because of anything you read here. In an emergency, go to the casualty
      department or call 108.
    </p>

    <h2>Advertising</h2>
    <p>
      Some public pages of this website show advertisements served by Google. Advertisements are not endorsements by
      the hospital, and the hospital does not recommend any product or service shown in them. Advertising is not
      shown in the hospital staff portal. See the{' '}
      <Link to="/privacy">privacy policy</Link> for how advertising cookies are used.
    </p>

    <h2>Availability</h2>
    <p>
      We try to keep the service available at all times but cannot guarantee it. If the app is unavailable, tokens can
      still be collected at the hospital counter.
    </p>

    <h2>Changes</h2>
    <p>
      These terms may be updated from time to time. Questions can be sent through the <Link to="/contact">contact page</Link>.
    </p>
  </ContentPage>
);

export default Terms;
