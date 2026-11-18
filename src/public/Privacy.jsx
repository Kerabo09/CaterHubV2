import { Link } from 'react-router-dom';
import { CONTACT_EMAIL, PRIVACY_UPDATED, PRIVACY_VERSION } from '../shared/legal';
const H = ({ children }) => (
  <h2 className="h3" style={{ marginTop: 34, marginBottom: 10 }}>
    {children}
  </h2>
);
const L = ({ items }) => (
  <ul style={{ paddingLeft: 20, margin: '8px 0', display: 'grid', gap: 6 }}>
    {items.map((t) => (
      <li key={t}>{t}</li>
    ))}
  </ul>
);
// Privacy notice written for Republic Act No. 10173 (Data Privacy Act of 2012).
export function Privacy() {
  return (
    <div className="wrap page">
      <div style={{ maxWidth: 780, lineHeight: 1.65 }}>
        <h1 style={{ fontSize: 40, marginBottom: 8 }}>Privacy Notice</h1>
        <p className="mut small">
          Version {PRIVACY_VERSION} · Last updated {PRIVACY_UPDATED}
        </p>
        <p style={{ marginTop: 20 }}>
          CaterHub respects your privacy. This notice explains what personal information we collect, why we collect it, who can see it, and
          what rights you have under the Philippine Data Privacy Act of 2012 (Republic Act No. 10173).
        </p>

        <H>1. Who we are</H>
        <p>
          CaterHub is a catering discovery and inquiry system built by Group 3 as a school project at Northwest Samar State University,
          Calbayog City. The CaterHub project team acts as the personal information controller. To reach us, write to{' '}
          <a className="lnk" href={'mailto:' + CONTACT_EMAIL}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>

        <H>2. What we collect</H>
        <L
          items={[
            'Account details: your name, email address, contact number and password. Your password is stored only as a secure hash, never as plain text.',
            'If you are a customer: your inquiries (event date, event type, location, guest count, budget, special requests) and the messages you send to caterers.',
            'If you are a caterer owner: your business name, description, contact details, address, logo and photos, service areas, packages, availability dates and your private calendar notes.',
            'Technical data needed to keep you signed in, such as a login session stored in your browser. Your saved and compared caterers stay on your own device.',
          ]}
        />

        <H>3. Why we collect it</H>
        <L
          items={[
            'To create and manage your account and let you log in.',
            'To show published caterer profiles, packages and photos to visitors.',
            'To send your inquiry to the caterer you choose, and to send you in-app notifications and replies.',
            'To keep a history of each inquiry and its status.',
            'To protect the system and fix problems.',
          ]}
        />
        <p>We do not sell your personal information, we do not use it for advertising, and CaterHub does not process payments.</p>

        <H>4. Who can see your information</H>
        <L
          items={[
            'The caterer you send an inquiry to can see your name, contact number, email address, event details and messages for that inquiry.',
            'Visitors and other customers can see only the published business information that caterer owners choose to show. They cannot see customer details or private notes.',
            'Our service providers store and process data for us: Supabase (database, login and file storage) and the company that hosts the website. They may keep data on servers outside the Philippines.',
            'Project team members may access records only to run, test or support the system.',
            'We may disclose information when the law requires it.',
          ]}
        />

        <H>5. How we protect it</H>
        <p>
          Passwords are hashed, the website uses HTTPS when deployed online, and access rules in the database let each user see only their own
          records. No online system is completely secure, so please keep your password private and log out on shared devices.
        </p>

        <H>6. How long we keep it</H>
        <p>
          We keep your information while your account is active, and for as long as the project needs inquiry records. You can ask us to
          delete your account and personal information at any time.
        </p>

        <H>7. Your rights</H>
        <p>Under the Data Privacy Act you have the right to:</p>
        <L
          items={[
            'be informed about how your personal information is processed;',
            'access the personal information we hold about you;',
            'object to processing, or withdraw your consent;',
            'correct information that is wrong or out of date;',
            'ask us to erase or block your information;',
            'receive your information in a common electronic format (data portability);',
            'claim compensation for damages caused by inaccurate, unlawfully obtained or misused information;',
            'file a complaint with the National Privacy Commission at privacy.gov.ph.',
          ]}
        />
        <p>To use any of these rights, contact us at the email address above.</p>

        <H>8. Your consent</H>
        <p>
          When you create an account, you tick a box to confirm that you read this notice and agree to the processing described here. We record
          the date and the version of the notice you accepted. You may withdraw your consent at any time. CaterHub cannot work without the
          information above, so withdrawing consent means we will close your account.
        </p>

        <H>9. Changes to this notice</H>
        <p>If we change this notice, we will post the new version on this page and update the date above.</p>

        <p style={{ marginTop: 40 }}>
          <Link className="lnk" to="/signup">
            ← Back to sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
