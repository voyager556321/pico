import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – Pico",
  description: "How Pico handles the data you share when joining the waitlist.",
};

const EMAIL = "taskquoteam@gmail.com";

export default function PrivacyPage() {
  return (
    <div className="pico-landing pk-legal">
      <main className="pk-wrap">
        <article className="pk-legal-doc">
          <a href="/" className="pk-legal-back">pico</a>
          <h1>Privacy Policy</h1>
          <p className="pk-legal-updated">Last updated: October 20, 2026</p>

          <p>
            Pico is a pre-launch marketplace for short freelance tasks, run by the Pico team. This page explains
            what data we collect when you join our waitlist, why, and what you can do about it.
          </p>

          <h2>What we collect</h2>
          <p>When you join the waitlist, we store:</p>
          <ul>
            <li>your email address;</li>
            <li>whether you joined as a client or a specialist;</li>
            <li>what you are interested in, if you choose to tell us;</li>
            <li>the site language you used and which form you signed up from;</li>
            <li>your consent to receive emails and the time you joined.</li>
          </ul>
          <p>We do not use advertising or tracking cookies. We use Vercel Web Analytics to count anonymous page views; it does not use cookies and does not identify you.</p>

          <h2>Why we use it</h2>
          <p>
            Only to email you about Pico&apos;s launch. You can unsubscribe at any time. We do not sell your data or
            share it for marketing.
          </p>

          <h2>Legal basis</h2>
          <p>Your consent, given when you join the waitlist. You can withdraw it at any time.</p>

          <h2>Where it is stored</h2>
          <p>
            The waitlist is stored in a Postgres database hosted by Supabase. The website is hosted on Vercel. These
            providers process data on our behalf to run the service.
          </p>

          <h2>How long we keep it</h2>
          <p>
            Until we stop sending launch-related emails, or until you ask us to delete it, whichever comes first.
          </p>

          <h2>Your rights</h2>
          <p>Under the GDPR, you can:</p>
          <ul>
            <li>ask for a copy of the data we hold about you;</li>
            <li>ask us to correct it;</li>
            <li>ask us to delete it;</li>
            <li>withdraw your consent at any time;</li>
            <li>complain to your local data protection supervisory authority.</li>
          </ul>

          <h2>Contact</h2>
          <p>
            For any request or question about your data, email us at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
          </p>
        </article>
      </main>
    </div>
  );
}
