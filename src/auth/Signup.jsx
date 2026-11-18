import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Password, RolePick, Shell, Submit } from './AuthParts';
import { useAuth } from '../shared/AuthContext';
import { msg, run } from '../shared/lib';
import { sb } from '../shared/supabase';
import { PRIVACY_VERSION } from '../shared/legal';
// The account type (customer or caterer owner) is chosen here, once, when the account is created.
export function Signup() {
  const nav = useNavigate(),
    [sp] = useSearchParams(),
    { refresh } = useAuth(),
    [role, setRole] = useState(sp.get('role') === 'owner' ? 'Caterer Owner' : 'Customer'),
    [err, setErr] = useState('');
  return (
    <Shell title="Create your account" sub="Find your caterer, or grow your catering business.">
      <RolePick v={role} set={setRole} />
      <form
        onSubmit={run(async (e) => {
          const f = Object.fromEntries(new FormData(e.target));
          setErr('');
          if (!f.consent) {
            setErr('Please accept the Privacy Notice to create an account.');
            return;
          }
          const { data, error } = await sb.auth.signUp({
            email: f.email.trim(),
            password: f.password,
            options: {
              data: {
                name: f.name.trim(),
                phone: f.phone.trim(),
                role,
                privacy_consent: { version: PRIVACY_VERSION, accepted_at: new Date().toISOString() },
              },
            },
          });
          if (error) {
            if (/registered/i.test(error.message)) {
              setErr('This email is already registered. Use your existing login.');
              return;
            }
            throw error;
          }
          if (data.user?.identities && !data.user.identities.length) {
            setErr('This email is already registered. Use your existing login.');
            return;
          }
          if (!data.session) {
            msg('Account created. Check your email to confirm, then log in.');
            nav('/login');
            return;
          }
          const m = await refresh();
          msg('Welcome to CaterHub!');
          nav(m?.role === 'Caterer Owner' ? '/owner/pf' : '/caterers');
        })}
      >
        <div className="field">
          <label className="l" htmlFor="name">
            Full name *
          </label>
          <input id="name" name="name" autoComplete="name" placeholder="Juan Dela Cruz" required />
        </div>
        <div className="field">
          <label className="l" htmlFor="email">
            Email *
          </label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        </div>
        <div className="field">
          <label className="l" htmlFor="phone">
            Contact number *
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="09xx xxx xxxx" required />
        </div>
        <Password
          label="Password *"
          name="password"
          minLength={8}
          autoComplete="new-password"
          placeholder="Create a password"
          hint="Use at least 8 characters. Keep your password private."
          required
        />
        <label className="check" style={{ alignItems: 'flex-start', margin: '2px 0 18px' }}>
          <input type="checkbox" name="consent" required style={{ marginTop: 3, flex: 'none' }} />
          <span className="small">
            I have read the{' '}
            <Link className="lnk" to="/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Notice
            </Link>{' '}
            and I agree that CaterHub may collect, use and store my personal information (name, email, contact number and inquiry details) as
            described.
          </span>
        </label>
        {err && (
          <div className="small" role="alert" style={{ color: '#b3261e', marginBottom: 14 }}>
            {err}
          </div>
        )}
        <Submit>Create account</Submit>
        <p className="tiny mut" style={{ marginTop: 20 }}>
          Caterer owners continue to business-profile setup after login.
        </p>
        <p className="small" style={{ marginTop: 24 }}>
          <span className="lnk">Already have an account?</span> <Link className="lnk" to="/login" style={{ marginLeft: 4 }}>
            Log in
          </Link>
        </p>
      </form>
    </Shell>
  );
}
