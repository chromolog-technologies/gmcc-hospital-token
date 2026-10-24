import React from 'react';
import { Link } from 'react-router-dom';
import ContentPage from '../components/ContentPage';

const FAQS = [
  {
    q: 'Who can book a token online?',
    a: 'Any patient who is already registered at Government Medical College Chest and Cancer Hospital, Thrissur and has a CR number and an app password. New patients must first register at the hospital registration counter.',
  },
  {
    q: 'Where do I find my CR number?',
    a: 'Your CR (registration) number is printed on the hospital card or OP ticket you received at your first visit. Hospital staff can also look it up for you.',
  },
  {
    q: 'I forgot my password. What should I do?',
    a: 'Passwords are managed by the hospital. Ask the staff at the registration or token counter to reset it for you, then log in again with your CR number.',
  },
  {
    q: 'Can I book a token for today?',
    a: 'No. Online tokens are always booked for the next clinic day of your unit. Tokens for the same day are issued at the hospital counter.',
  },
  {
    q: 'Why is my unit not available on the day I want?',
    a: 'Each unit runs on fixed days of the week. The app only offers days on which your unit is working. If you think a day is missing by mistake, check with the unit or the hospital office.',
  },
  {
    q: 'What is the difference between a Chemo and a Followup token?',
    a: 'Chemo tokens (numbers 1 to 150) are for chemotherapy sessions. Followup tokens (numbers 151 to 300) are for review visits with the doctor. Choose the type your doctor asked you to come for.',
  },
  {
    q: 'My booking says "pending". Is it confirmed?',
    a: 'Pending means the hospital has received your request and your token number is reserved. It becomes "active" once approved, which happens automatically about an hour after booking when auto-approval is switched on.',
  },
  {
    q: 'Why are online token numbers not in a straight sequence?',
    a: 'Some chemotherapy numbers are set aside for patients booked by hospital staff and for walk-in patients, so online numbers skip those values. Your turn is still decided by your token number.',
  },
  {
    q: 'Can I book more than one token a day?',
    a: 'No. Each patient can hold only one token per day, whether it was booked online or at the counter.',
  },
  {
    q: 'How do I cancel a booking?',
    a: 'Open "My Token" in the app and cancel it. The app allows cancellation within one hour of booking. After that, contact the hospital. Cancelled numbers are reused for other patients.',
  },
  {
    q: 'How will I know when my token is called?',
    a: 'The app sends a notification to your phone when your token is called. Keep notifications turned on for the app and keep an eye on the display at the unit as well.',
  },
  {
    q: 'Is there an iPhone app?',
    a: 'The patient app is currently available for Android phones on Google Play. Patients without an Android phone can continue to collect tokens at the hospital counter.',
  },
  {
    q: 'Is my information safe?',
    a: 'The app uses your CR number and booking details only to manage the queue. Read the privacy policy for full details of what is collected and how it is used.',
    link: { to: '/privacy', label: 'Read the privacy policy' },
  },
];

const Faq = () => (
  <ContentPage
    title="Frequently Asked Questions | GMC Chest Hospital Thrissur Online Token"
    description="Answers to common questions about online OP token booking at GMC Chest and Cancer Hospital, Thrissur: CR number, passwords, token types, cancellation and notifications."
    eyebrow="Help"
    heading="Frequently Asked Questions"
    intro="Quick answers to the questions patients and caregivers ask most often about the online token system."
  >
    {FAQS.map(({ q, a, link }) => (
      <section key={q}>
        <h3>{q}</h3>
        <p>
          {a}
          {link && <> <Link to={link.to}>{link.label}</Link>.</>}
        </p>
      </section>
    ))}

    <h2>Still need help?</h2>
    <p>
      See the full <Link to="/how-to-book">booking guide</Link> or the <Link to="/contact">contact page</Link>.
    </p>
  </ContentPage>
);

export default Faq;
