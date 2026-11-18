import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Password, Shell, Submit } from './AuthParts';
import { useAuth } from '../shared/AuthContext';
import { msg, run } from '../shared/lib';
import { sb } from '../shared/supabase';
// Opened from the "reset password" email. The link signs the user in, then they choose a new password.
export function ResetPassword() {
  const nav = useNavigate(),
    { me } = useAuth(),
    [err, setErr] = useState('');
  if (!me)
    return (
      <Shell title="Reset link not valid" sub="This password reset link is invalid or has expired.">
        <p style={{ marginTop: 26 }}>
          Go to <Link className="lnk" to="/login">Log in</Link>, type your email and choose <b>Forgot password?</b> to get a new link.
        </p>
      </Shell>
    );
  return (
    <Shell title="Choose a new password" sub="Enter a new password for your CaterHub account.">
      <form
        style={{ marginTop: 26 }}
        onSubmit={run(async (e) => {
          const f = Object.fromEntries(new FormData(e.target));
          setErr('');
          if (f.password !== f.confirm) {
            setErr('The two passwords do not match.');
            return;
          }
          const { error } = await sb.auth.updateUser({ password: f.password });
          if (error) throw error;
          msg('Password updated.');
          nav(me.role === 'Caterer Owner' ? '/owner' : '/caterers', { replace: true });
        })}
      >
        <Password label="New password *" name="password" minLength={8} autoComplete="new-password" placeholder="At least 8 characters" required />
        <Password label="Confirm new password *" name="confirm" minLength={8} autoComplete="new-password" placeholder="Type it again" required />
        {err && (
          <div className="small" role="alert" style={{ color: '#b3261e', marginBottom: 14 }}>
            {err}
          </div>
        )}
        <Submit>Update password</Submit>
      </form>
    </Shell>
  );
}
