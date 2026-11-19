import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { TABS } from './constants';
import { useAuth } from '../shared/AuthContext';
import { Brand } from '../shared/Header';
import { Up } from '../shared/Icons';
import { Badge, gate, ok, useLoad } from '../shared/lib';
import { sb } from '../shared/supabase';
export const useOwner = () => useOutletContext();
const GREET = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};
export { GREET };
export default function Owner() {
  const { me, logout } = useAuth(),
    loc = useLocation();
  const s = useLoad(
    async () =>
      ok(await sb.from('caterer_profiles').select('*,service_areas(area_name)').eq('user_id', me.id).maybeSingle()),
    [me.id],
  );
  const [unread, setUnread] = useState(0),
    [menu, setMenu] = useState(false);
  // phone menu: close when the page changes, lock page scrolling while open, close with Esc
  useEffect(() => setMenu(false), [loc.pathname]);
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    const esc = (e) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('keydown', esc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', esc);
    };
  }, [menu]);
  useEffect(() => {
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
  }, [me.id, loc.pathname]);
  const g = gate(s);
  if (g) return g;
  const c = s.data,
    path = loc.pathname.replace(/\/$/, '');
  if (!c && path !== '/owner/pf') return <Navigate to="/owner/pf" replace />;
  const seg = path.split('/')[2] || '',
    crumb = {
      '': 'Overview',
      inq: 'Inquiries',
      av: 'Availability',
      pk: 'Packages',
      pf: c?.status === 'Draft' ? 'Business profile' : 'Business profile',
      nt: 'Notifications',
    }[seg];
  const setup = !c || c.status === 'Draft';
  return (
    <div className="shell">
      <div className="m-bar">
        <Brand to="/owner" />
        <button className="m-menu" aria-expanded={menu} aria-controls="owner-side" onClick={() => setMenu(true)}>
          Menu
          {unread > 0 && <span className="cnt">{unread}</span>}
        </button>
      </div>
      <div className={'scrim' + (menu ? ' on' : '')} onClick={() => setMenu(false)} />
      <aside id="owner-side" className={'side' + (menu ? ' open' : '')}>
        <button className="side-x" aria-label="Close menu" onClick={() => setMenu(false)}>
          ×
        </button>
        <Brand to="/owner" />
        <div className="ws">Owner workspace</div>
        <nav>
          {TABS.map(([k, l]) => (
            <NavLink key={k} end={k === ''} to={'/owner' + (k ? '/' + k : '')} className={({ isActive }) => (isActive ? 'on' : '')}>
              {k === 'pf' && setup ? 'Set up your business' : l}
              {k === 'nt' && unread > 0 && <span className="cnt">{unread}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="biz">
          <h4>{c?.business_name || 'No profile yet'}</h4>
          <Badge s={c?.status || 'Draft'} />
          {c?.status === 'Published' && (
            <Link className="lnk" to={'/caterer/' + c.caterer_id}>
              View public profile <Up />
            </Link>
          )}
          <div className="small mut" style={{ marginTop: c?.status === 'Published' ? 0 : 12 }}>
            {c?.service_areas?.[0]?.area_name || 'Calbayog City'}
          </div>
        </div>
        <div className="foot-l">
          <Link to="/owner/pf" className="mut">
            Account settings
          </Link>
          <button onClick={logout}>Log out</button>
        </div>
      </aside>
      <div className="main">
        <div className="top">
          <span>
            {c?.business_name || 'Your business'} / {crumb}
          </span>
          <b>Caterer owner</b>
        </div>
        <div className="mbody">
          <Outlet context={{ c, reload: s.reload }} />
        </div>
      </div>
    </div>
  );
}
