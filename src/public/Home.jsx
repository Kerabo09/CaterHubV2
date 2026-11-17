import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Arrow, Up } from '../shared/Icons';
import { EVENTS, coverOf, fromPrice, gate, ok, peso, useLoad } from '../shared/lib';
import { sb } from '../shared/supabase';
import { BUDGETS } from './CatererList';
const STEPS = [
  ['01', 'Find your caterer', 'Filter by location, budget, event type, and guest count.'],
  ['02', 'Send a complete inquiry', 'Share your date, venue, package, and special requests.'],
  ['03', 'Connect and make it yours', 'Review their reply, then finalize details directly.'],
];
export function Home() {
  const nav = useNavigate();
  const { hash } = useLocation();
  const s = useLoad(
    async () =>
      ok(
        await sb
          .from('caterer_profiles')
          .select('*,service_areas(area_name),catering_packages(price,is_active,package_photos(image_url))')
          .eq('status', 'Published')
          .order('business_name'),
      ),
    [],
  );
  const g = gate(s);
  // "How it works" in the menu jumps to that section
  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
  }, [hash, g]);
  const all = s.data || [];
  const areas = [...new Set(all.flatMap((c) => c.service_areas.map((a) => a.area_name.trim())))].sort();
  const events = [...new Set([...EVENTS, ...all.flatMap((c) => c.event_types)])];
  const featured = all.slice(0, 3);
  const find = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const q = new URLSearchParams(Object.entries(f).filter(([, v]) => String(v).trim()));
    nav('/caterers' + (q.toString() ? '?' + q : ''));
  };
  return (
    <>
      <div className="wrap">
        <section className="hero">
          <div>
            <span className="eyebrow">Local catering. Thoughtfully connected.</span>
            <h1>
              A great event
              <br />
              starts with
              <br />
              great food.
            </h1>
            <p className="lead">
              Find the right caterer in Calbayog City. Explore menus, compare packages, and ask about your
              date—all in one place.
            </p>
          </div>
          <div className="hero-img">
            <img src="/images/hero.jpg" alt="A table set with local dishes" />
            <div className="hero-card">
              <b>Made for your kind of gathering</b>
              <span>Weddings, birthdays, and everything between.</span>
            </div>
          </div>
        </section>
        <form className="search" onSubmit={find}>
          <label className="sf">
            <span>Location</span>
            <select name="area" key={areas.join()} defaultValue={areas.includes('Calbayog City') ? 'Calbayog City' : ''}>
              <option value="">Any location</option>
              {areas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label className="sf">
            <span>Event type</span>
            <select name="event" defaultValue="">
              <option value="">Choose an occasion</option>
              {events.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </label>
          <label className="sf">
            <span>Budget per guest</span>
            <select name="budget" defaultValue="">
              {BUDGETS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="sf">
            <span>Guests</span>
            <input type="number" name="guests" min="1" placeholder="How many guests?" />
          </label>
          <button className="btn">
            Find caterers <Arrow />
          </button>
        </form>
        <section>
          <div className="sec-head">
            <div>
              <h2 className="h2">Good food. Local people.</h2>
              <p className="mut" style={{ margin: '6px 0 0' }}>
                Explore local catering for your next celebration.
              </p>
            </div>
            <Link className="lnk" to="/caterers">
              Browse all caterers →
            </Link>
          </div>
          {g ? (
            <p className="mut">Loading caterers…</p>
          ) : featured.length === 0 ? (
            <div className="empty-state">
              <h3>No caterers yet</h3>
              <p>Caterers will appear here as soon as they publish their profile.</p>
            </div>
          ) : (
            <div className="cards3">
              {featured.map((c, i) => {
                const cv = coverOf(c, i),
                  p = fromPrice(c);
                return (
                  <Link className="cv" to={'/caterer/' + c.caterer_id} key={c.caterer_id}>
                    <div className="ph">
                      <img src={cv.src} alt="" style={cv.isLogo ? { objectFit: 'contain', background: '#fff' } : null} />
                    </div>
                    <h3>{c.business_name}</h3>
                    <div className="meta">
                      {c.service_areas[0]?.area_name || 'Calbayog City'} · {c.event_types.slice(0, 2).join(' & ')}
                    </div>
                    <div className="foot-row">
                      <span>{p ? `From ${peso(p)} / guest` : 'Packages on request'}</span>
                      <span className="lnk small">
                        View profile <Up />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
      <section className="band" id="how">
        <div className="wrap">
          <h2 className="h2">Less searching. More celebrating.</h2>
          <div className="how">
            {STEPS.map(([n, t, d]) => (
              <div key={n}>
                <div className="n">{n}</div>
                <h4>{t}</h4>
                <p className="mut small">{d}</p>
              </div>
            ))}
          </div>
          <p className="mut tiny" style={{ margin: 0 }}>
            An inquiry is not a booking. Final quotations, deposits, and agreements are arranged directly with the
            caterer.
          </p>
        </div>
      </section>
      <section className="cta-band">
        <div className="wrap in">
          <div>
            <h2>
              Your food deserves
              <br />a bigger table.
            </h2>
            <p className="mut">List your catering business and manage inquiries in one calm workspace.</p>
          </div>
          <Link className="btn" to="/signup?role=owner">
            Join as a caterer <Arrow />
          </Link>
        </div>
      </section>
    </>
  );
}
