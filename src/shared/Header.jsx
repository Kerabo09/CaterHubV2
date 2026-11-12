import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { sb } from './supabase';
export const Brand = ({ to = '/' }) => (
  <Link className="brand" to={to}>
    <img src="/logo-icon.png" alt="" />
    <span>
      Cater<b>Hub</b>
    </span>
  </Link>
);
export function Header() {
  const { me, logout } = useAuth();
  const loc = useLocation();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [loc.pathname]);
  useEffect(() => {
    if (me?.role !== 'Customer') return;
    const load = () =>
      sb
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', me.id)
        .eq('is_read', false)
        .then((r) => setUnread(r.count || 0));
    load();
    window.addEventListener('caterhub:notes', load);
    return () => window.removeEventListener('caterhub:notes', load);
  }, [me, loc.pathname]);
  const on = ({ isActive }) => (isActive ? 'on' : '');
  return (
    <header className="nav" id="top">
      <div className="nav-in">
        <Brand />
        <button className="nav-toggle" type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? 'Close' : 'Menu'}
        </button>
        <nav className={'nav-links' + (open ? ' open' : '')}>
          <NavLink to="/caterers" className={on}>
            Browse caterers
          </NavLink>
          {!me && (
            <>
              <Link to="/#how" className="mutlink">
                How it works
              </Link>
              <NavLink to="/login" className={on}>
                Log in
              </NavLink>
              <Link className="nav-btn" to="/signup">
                Sign up
              </Link>
            </>
          )}
          {me?.role === 'Customer' && (
            <>
              <NavLink to="/my" className={on}>
                My inquiries
              </NavLink>
              <NavLink to="/notes" className={on}>
                Notifications
                {unread > 0 && <span className="cnt">{unread}</span>}
              </NavLink>
            </>
          )}
          {me && (
            <button type="button" className="nl nav-out" onClick={logout}>
              Log out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="foot">
      <div className="foot-in">
        <div>
          <Brand />
          <p>Local flavors. Memorable gatherings.</p>
        </div>
        <div>
          <div className="foot-links">
            <Link to="/caterers">Browse caterers</Link>
            <Link to="/#how">How it works</Link>
            <Link to="/signup">List your business</Link>
          </div>
        </div>
        <div className="foot-copy" style={{ gridColumn: 2 }}>
          <span>© {new Date().getFullYear()} CaterHub</span>
          <span>·</span>
          <span>Calbayog City, Samar</span>
        </div>
      </div>
    </footer>
  );
}
