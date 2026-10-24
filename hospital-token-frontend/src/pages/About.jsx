import React from 'react';
import { Link } from 'react-router-dom';
import ContentPage from '../components/ContentPage';

const About = () => (
  <ContentPage
    title="About | GMC Chest and Cancer Hospital Thrissur Online Token System"
    description="About Government Medical College Chest and Cancer Hospital, Thrissur and its online OP token booking and queue management system."
    eyebrow="About"
    heading="About the Hospital and the Token System"
    intro="Government Medical College Chest and Cancer Hospital, Thrissur, and the online system that helps its patients book outpatient tokens."
  >
    <img
      src="/images/Chest-Hospital.jpg"
      alt="Government Medical College Chest and Cancer Hospital building, Thrissur"
      style={{ width: '100%', height: 'auto', borderRadius: '12px', marginBottom: '1.5rem' }}
    />

    <h2>The hospital</h2>
    <p>
      Government Medical College Chest and Cancer Hospital, Thrissur was inaugurated on 1 April 1982 by the Governor of
      Kerala, Jothi Venkatachalam. It began functioning at Mannuthy and moved to its permanent campus at
      Mulamkunnathukavu, near Government Medical College Thrissur, by March 1983.
    </p>
    <p>
      The hospital treats patients with respiratory illness and cancer. Its outpatient units see a large number of
      patients every clinic day for chemotherapy and follow-up reviews, many of whom travel from across central Kerala.
    </p>

    <h2>Why an online token system</h2>
    <p>
      Outpatient care at the hospital is organised by tokens: each patient gets a number and is seen in that order.
      Collecting a paper token meant arriving very early and waiting in long queues, which is hard for patients who
      are unwell or undergoing chemotherapy. The online token system was introduced so patients can reserve their
      token from home and arrive closer to their turn.
    </p>

    <h2>What the system does</h2>
    <ul>
      <li>Lets registered patients book chemotherapy and follow-up tokens for the next clinic day from an Android app.</li>
      <li>Keeps a share of tokens for patients booked by staff and for walk-in patients, so nobody is left out.</li>
      <li>Gives doctors a live view of their unit's queue so they can call the next patient.</li>
      <li>Sends patients a phone notification when their token is called, and shares hospital announcements.</li>
      <li>Gives hospital staff a dashboard to manage units, doctors, bookings and notices.</li>
    </ul>
    <p>
      To start using it, read <Link to="/how-to-book">how to book a token</Link>.
    </p>

    <h2>Who runs this website</h2>
    <p>
      This website and the token system are developed and maintained for the hospital by its technology partner,{' '}
      <a href="https://chromologtechnologies.com/" target="_blank" rel="noopener noreferrer">Chromolog Technologies</a>.
      Medical services, appointments and treatment decisions remain with the hospital and its doctors. For questions
      about your treatment, speak to your doctor or the hospital directly; see the <Link to="/contact">contact page</Link>.
    </p>
  </ContentPage>
);

export default About;
