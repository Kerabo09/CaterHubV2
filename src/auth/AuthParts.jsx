import { useState } from 'react';
import { Arrow } from '../shared/Icons';
export const RolePick = ({ v, set }) => (
  <div className="role-pick" role="radiogroup" aria-label="Account type">
    {[
      ['Customer', 'Customer', 'Find catering for an event'],
      ['Caterer Owner', 'Caterer owner', 'Manage one catering business'],
    ].map(([k, t, d]) => (
      <button key={k} type="button" role="radio" aria-checked={v === k} className={'role' + (v === k ? ' on' : '')} onClick={() => set(k)}>
        <b>{t}</b>
        <span>{d}</span>
      </button>
    ))}
  </div>
);
export const Password = ({ label, hint, ...p }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label className="l" htmlFor={p.name}>
        {label}
      </label>
      <div className="pwd">
        <input id={p.name} {...p} type={show ? 'text' : 'password'} />
        <button type="button" className="show" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
};
export const Submit = ({ children }) => (
  <button className="btn block" style={{ padding: '14px 22px' }}>
    {children} <Arrow />
  </button>
);
export const Shell = ({ title, sub, children }) => (
  <div className="auth">
    <aside className="auth-side">
      <h2>
        A little less planning.
        <br />A lot more celebrating.
      </h2>
      <p className="mut" style={{ marginTop: 18 }}>
        Your next event starts with the right people.
      </p>
      <img src="/images/auth-side.jpg" alt="A table of local dishes" />
      <p className="mut">
        Discover local menus. Keep every inquiry together.
        <br />
        Finalize your event directly with your caterer.
      </p>
      <div className="foot-t">Made for gatherings in Calbayog City</div>
    </aside>
    <main className="auth-main">
      <h1>{title}</h1>
      <p className="mut">{sub}</p>
      {children}
    </main>
  </div>
);
