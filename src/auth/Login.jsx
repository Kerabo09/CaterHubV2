import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Password, Shell, Submit } from './AuthParts';
import { useAuth } from '../shared/AuthContext';
import { msg, run } from '../shared/lib';
import { sb } from '../shared/supabase';
// One login for everyone: the account's own role decides where it goes next.
export function Login() {
  const nav = useNavigate(),
    loc = useLocation(),
    { refresh } = useAuth(),
    [err, setErr] = useState('');
  return (
    <Shell title="Welcome back" sub="Log in to pick up where you left off.">
      <form
        style={{ marginTop: 26 }}
        onSubmit={run(async (e) => {
          setErr('');
          const f = Object.fromEntries(new FormData(e.target));
          const { error } = await sb.auth.signInWithPassword({ email: f.email.trim(), password: f.password });
          if (error) {
            setErr(/invalid/i.test(error.message) ? 'Email or password is incorrect.' : error.message);
            return;
          }
          const m = await refresh();
          if (!m) {
            await sb.auth.signOut();
            await refresh();
            setErr('Account profile not found.');
            return;
          }
          const from = loc.state?.from;
          if (m.role === 'Caterer Owner') nav(from?.startsWith('/owner') ? from : '/owner', { replace: true });
          else nav(from && !from.startsWith('/owner') ? from : '/caterers', { replace: true });
        })}
      >
        <div className="field">
          <label className="l" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        </div>
        <Password label="Password" name="password" autoComplete="current-password" placeholder="Enter your password" required />
        <div className="row-between" style={{ marginTop: -6, marginBottom: 20 }}>
          <div className="err small" role="alert" style={{ color: '#b3261e' }}>
            {err}
          </div>
          <button
            type="button"
            className="lnk small"
            onClick={run(async (e) => {
              const em = e.target.closest('form').email.value.trim();
              if (!em) throw new Error('Enter your email first.');
              const { error } = await sb.auth.resetPasswordForEmail(em);
              if (error) throw error;
              msg('Password reset email sent.');
            })}
          >
            Forgot password?
          </button>
        </div>
        <Submit>Log in</Submit>
        <p className="small" style={{ marginTop: 26 }}>
          <span className="lnk">New to CaterHub?</span> <Link className="lnk" to="/signup" style={{ marginLeft: 4 }}>
            Create an account
          </Link>
        </p>
        <p className="tiny mut" style={{ marginTop: 40 }}>
          Your inquiries and business details stay private.
        </p>
      </form>
    </Shell>
  );
}
