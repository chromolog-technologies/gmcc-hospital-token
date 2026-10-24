import React from 'react';
import { Link } from 'react-router-dom';
import ContentPage from '../components/ContentPage';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=gmcch.vast.token';

const HowToBook = () => (
  <ContentPage
    title="How to Book an OP Token Online | GMC Chest Hospital Thrissur"
    description="Step-by-step guide to booking a chemotherapy or follow-up OP token at Government Medical College Chest and Cancer Hospital, Thrissur using the patient app."
    eyebrow="Patient Guide"
    heading="How to Book Your OP Token Online"
    intro="A step-by-step guide for patients and caregivers on booking a chemotherapy or follow-up token at Government Medical College Chest and Cancer Hospital, Thrissur, without standing in the early-morning queue."
  >
    <h2>Why online tokens?</h2>
    <p>
      Patients attending the chest and cancer outpatient units at Thrissur often travel long distances and used to
      arrive before dawn to collect a paper token. The online token system lets you reserve your place in the queue
      from home the day before your visit, so you can plan your travel and spend less time waiting at the hospital.
      Online tokens sit alongside the counter tokens issued by hospital staff, so patients who cannot use a phone can
      still be seen as before.
    </p>

    <h2>What you need before you start</h2>
    <ul>
      <li>An Android phone with internet access.</li>
      <li>
        Your hospital <strong>CR number</strong> (the registration number printed on your hospital card). The app uses
        the CR number to identify you, so you must already be registered at the hospital.
      </li>
      <li>The password given to you by the hospital when your account was created.</li>
      <li>The name of the unit (department) you have been asked to attend and whether your visit is for chemotherapy or a follow-up review.</li>
    </ul>

    <h2>Step-by-step booking</h2>
    <ol>
      <li>
        <strong>Install the app.</strong> Download the official patient app from{' '}
        <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">Google Play</a>.
      </li>
      <li><strong>Log in</strong> with your CR number and password.</li>
      <li>
        <strong>Choose your unit.</strong> The home screen lists the hospital units. Each unit works on fixed days of the
        week, and the app only allows a booking for a day on which your unit is running.
      </li>
      <li>
        <strong>Select the visit type</strong>: <em>Chemo</em> for a chemotherapy session, or <em>Followup</em> for a review
        visit.
      </li>
      <li>
        <strong>Check availability and confirm.</strong> Online bookings are made for the <strong>next clinic day</strong>,
        not for the same day. If a token is free, the app shows your token number straight away.
      </li>
      <li>
        <strong>Wait for approval.</strong> A new online booking starts as <em>pending</em>. Hospital staff approve it, and
        where automatic approval is switched on it becomes <em>active</em> about an hour after booking.
      </li>
      <li>
        <strong>Attend on the day.</strong> Open <em>My Token</em> to see your number. You will get a notification on your
        phone when your token is called, so keep notifications turned on.
      </li>
    </ol>

    <h2>How token numbers work</h2>
    <p>Each unit has its own set of tokens for each clinic day:</p>
    <table>
      <thead>
        <tr><th>Visit type</th><th>Token range</th><th>Who issues them</th></tr>
      </thead>
      <tbody>
        <tr><td>Chemotherapy</td><td>1 to 150</td><td>Shared between online bookings, hospital staff and walk-in patients</td></tr>
        <tr><td>Follow-up</td><td>151 to 300</td><td>Issued in order to all patients, online or at the counter</td></tr>
      </tbody>
    </table>
    <p>
      Because some chemotherapy numbers are kept for staff and walk-in patients, online chemotherapy token numbers are
      not always consecutive. This is normal and does not change your place in the queue.
    </p>

    <h2>Rules to keep in mind</h2>
    <ul>
      <li><strong>One token per patient per day.</strong> You cannot hold two tokens for the same day, online or at the counter.</li>
      <li>
        <strong>The booking day changes at 6:00 AM.</strong> Until 6:00 AM, the system still treats it as the previous day,
        so a booking made at 2:00 AM is for the clinic day after that day.
      </li>
      <li>
        <strong>Cancel if you cannot come.</strong> You can cancel a pending or active booking from <em>My Token</em>. The app
        allows cancellation within one hour of booking; after that, contact the hospital. A cancelled number is given to
        the next patient, so cancelling early helps others.
      </li>
      <li><strong>Bring your hospital card and documents</strong> to every visit, just as you would with a counter token.</li>
    </ul>

    <div className="content-note">
      The token system only manages the outpatient queue. It is not a way to contact a doctor, and it is not for
      emergencies. In an emergency, go directly to the casualty department or call 108.
    </div>

    <h2>Having trouble?</h2>
    <p>
      Common problems such as a forgotten password or a unit not showing are answered in the{' '}
      <Link to="/faq">frequently asked questions</Link>. For anything else, see the{' '}
      <Link to="/contact">contact page</Link>.
    </p>
  </ContentPage>
);

export default HowToBook;
