import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Arrow, Bookmark, Swap } from '../shared/Icons';
import { DIETARY, EVENTS, coverOf, fromPrice, gate, msg, ok, peso, shortDay, useLoad } from '../shared/lib';
import { COMPARE_MAX, useList } from '../shared/saved';
import { sb } from '../shared/supabase';
export const BUDGETS = [
  ['', 'Any budget'],
  ['0-200', 'Up to ₱200 / guest'],
  ['200-500', '₱200 – ₱500 / guest'],
  ['500-', '₱500 and up / guest'],
];
const SORTS = [
  ['name', 'Name A–Z'],
  ['low', 'Price: low to high'],
  ['high', 'Price: high to low'],
];
const budgetLabel = (v) => (BUDGETS.find((b) => b[0] === v) || [])[1] || v;
// keep the choices a visitor made (date, guests, dietary) when they open a profile
export const carry = (q) => {
  const p = new URLSearchParams();
  ['date', 'guests', 'diet'].forEach((k) => q[k] && p.set(k, q[k]));
  return p.toString() ? '?' + p : '';
};
export function matches(c, q, blocked) {
  const prices = c.catering_packages.filter((p) => p.is_active).map((p) => +p.price),
    mn = prices.length ? Math.min(...prices) : null,
    n = parseInt(q.guests);
  let [a, b] = (q.budget || '').split('-').map((x) => (x === '' || x === undefined ? NaN : parseFloat(x)));
  return (
    (!q.name || c.business_name.toLowerCase().includes(q.name.toLowerCase())) &&
    (!q.area ||
      c.out_of_town ||
      c.service_areas.some((x) => x.area_name.trim().toLowerCase() === q.area.toLowerCase())) &&
    (!q.event || c.event_types.some((e) => e.toLowerCase().includes(q.event.trim().toLowerCase()))) &&
    (!n || (n >= c.min_guests && n <= c.max_guests)) &&
    (isNaN(a) || (mn !== null && mn >= a)) &&
    (isNaN(b) || (mn !== null && mn <= b)) &&
    !blocked.has(c.caterer_id)
  );
}
export function List() {
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const q = Object.fromEntries(sp);
  const [saved, toggleSaved] = useList('saved');
  const [cmp, toggleCmp] = useList('compare');
  const s = useLoad(
    async () =>
      ok(
        await sb
          .from('caterer_profiles')
          .select('*,service_areas(area_name),catering_packages(price,is_active,is_customizable,package_photos(image_url))')
          .eq('status', 'Published')
          .order('business_name'),
      ),
    [],
  );
  // caterers that already have this date marked Reserved or Unavailable
  const bl = useLoad(async () => {
    if (!q.date) return [];
    const r = await sb
      .from('caterer_availability')
      .select('caterer_id')
      .eq('day', q.date)
      .in('status', ['Reserved', 'Unavailable']);
    return r.error ? [] : r.data.map((x) => x.caterer_id);
  }, [q.date]);
  const g = gate(s);
  if (g) return g;
  const all = s.data,
    blocked = new Set(bl.data || []);
  const areas = [...new Set(all.flatMap((c) => c.service_areas.map((a) => a.area_name.trim())))].sort();
  const events = [...new Set([...EVENTS, ...all.flatMap((c) => c.event_types)])];
  const sort = q.sort || 'name';
  const rows = all
    .filter((c) => matches(c, q, blocked))
    .sort((x, y) =>
      sort === 'name'
        ? x.business_name.localeCompare(y.business_name)
        : ((fromPrice(x) ?? 1e9) - (fromPrice(y) ?? 1e9)) * (sort === 'low' ? 1 : -1),
    );
  const set = (obj) => {
    const n = { ...q, ...obj };
    Object.keys(n).forEach((k) => !n[k] && delete n[k]);
    setSp(n);
  };
  const apply = (e) => {
    e.preventDefault();
    const f = new FormData(e.target),
      diet = f.getAll('diet').join(',');
    const n = {};
    ['area', 'event', 'budget', 'guests', 'date'].forEach((k) => (n[k] = String(f.get(k) || '').trim()));
    n.diet = diet;
    if (q.name) n.name = q.name;
    if (q.sort) n.sort = q.sort;
    Object.keys(n).forEach((k) => !n[k] && delete n[k]);
    setSp(n);
  };
  const chips = [
    q.name && ['name', `"${q.name}"`],
    q.area && ['area', q.area],
    q.event && ['event', q.event],
    q.guests && ['guests', `${q.guests} guests`],
    q.budget && ['budget', budgetLabel(q.budget)],
    q.date && ['date', shortDay(q.date)],
    q.diet && ['diet', q.diet.split(',').join(', ')],
  ].filter(Boolean);
  const diet = (q.diet || '').split(',').filter(Boolean);
  const pickCompare = (id) => {
    if (!toggleCmp(id)) msg(`You can compare up to ${COMPARE_MAX} caterers. Remove one first.`, 1);
  };
  return (
    <div className="wrap page">
      <h1 className="h1">Find your kind of caterer.</h1>
      <p className="sub">Local kitchens, thoughtful menus, and a package for every gathering.</p>
      <form
        style={{ marginTop: 26 }}
        onSubmit={(e) => {
          e.preventDefault();
          set({ name: String(new FormData(e.target).get('name') || '').trim() });
        }}
      >
        <label className="l" htmlFor="nm" style={{ fontSize: 12, fontWeight: 500 }}>
          Search by business name
        </label>
        <div className="dir-search">
          <input id="nm" name="name" type="search" defaultValue={q.name || ''} placeholder="Search caterers…" />
          <button className="btn">Search</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <Link className="btn out sm" to="/saved" style={{ minWidth: 170 }}>
            Saved caterers ({saved.length})
          </Link>
        </div>
      </form>
      <div className="dir-grid" style={{ marginTop: 6 }}>
        <form className="filters" onSubmit={apply} key={sp.toString()}>
          <div className="row-between" style={{ alignItems: 'center', marginBottom: 18 }}>
            <h3>Filters</h3>
            <button type="button" className="lnk small" onClick={() => nav('/caterers')}>
              Reset
            </button>
          </div>
          <div className="field">
            <label className="l">Location</label>
            <select name="area" defaultValue={q.area || ''}>
              <option value="">Any location</option>
              {areas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="l">Event type</label>
            <input name="event" list="dir-events" defaultValue={q.event || ''} placeholder="Type or pick an event" autoComplete="off" />
            <datalist id="dir-events">
              {events.map((e) => (
                <option key={e} value={e} />
              ))}
            </datalist>
          </div>
          <div className="field">
            <label className="l">Budget per guest</label>
            <select name="budget" defaultValue={q.budget || ''}>
              {BUDGETS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="l">Guest count</label>
            <input type="number" name="guests" min="1" defaultValue={q.guests || ''} placeholder="e.g. 100" />
          </div>
          <div className="field">
            <label className="l">Event date (optional)</label>
            <input type="date" name="date" defaultValue={q.date || ''} />
            <p className="hint tiny mut" style={{ marginTop: 8 }}>
              Dates are indicative. Ask the caterer to confirm availability.
            </p>
          </div>
          <div className="field">
            <label className="l">Dietary preferences</label>
            <details className="dd" open={diet.length > 0}>
              <summary>{diet.length ? diet.join(', ') : 'Choose preferences'}</summary>
              <div className="dd-body">
                {DIETARY.map((d) => (
                  <label className="check" key={d}>
                    <input type="checkbox" name="diet" value={d} defaultChecked={diet.includes(d)} /> {d}
                  </label>
                ))}
              </div>
            </details>
            <p className="hint tiny mut" style={{ marginTop: 8 }}>
              Selected as a request. Caterers confirm availability.
            </p>
          </div>
          <button className="btn block">Apply filters</button>
          <div className="hr" />
          <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Planning out of town?</h4>
          <p className="mut small" style={{ margin: 0 }}>
            Check service areas and travel notes on each caterer's profile.
          </p>
        </form>
        <div>
          <div className="results-head">
            <b>
              {rows.length} caterer{rows.length === 1 ? '' : 's'} match{rows.length === 1 ? 'es' : ''} your event
            </b>
            <label className="small mut">
              Sort:{' '}
              <select value={sort} onChange={(e) => set({ sort: e.target.value === 'name' ? '' : e.target.value })}>
                {SORTS.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {chips.length > 0 && (
            <div className="chips" style={{ marginBottom: 18 }}>
              {chips.map(([k, l]) => (
                <button key={k} type="button" className="tag" onClick={() => set({ [k]: '' })}>
                  {l} <span aria-hidden>×</span>
                </button>
              ))}
            </div>
          )}
          {rows.length === 0 && (
            <div className="empty-state">
              <h3>No caterers found</h3>
              <p>Try a wider budget, fewer guests, or a different event type.</p>
              <button className="btn" onClick={() => nav('/caterers')}>
                Reset filters
              </button>
            </div>
          )}
          {rows.map((c, i) => {
            const cv = coverOf(c, i),
              p = fromPrice(c),
              isSaved = saved.includes(c.caterer_id),
              isCmp = cmp.includes(c.caterer_id),
              custom = c.catering_packages.some((x) => x.is_active && x.is_customizable);
            return (
              <article className="cat" key={c.caterer_id}>
                <div className={'ph' + (cv.isLogo ? ' logo' : '')}>
                  <img src={cv.src} alt="" />
                  <div className="cat-actions">
                    <button type="button" className={'tog' + (isSaved ? ' on' : '')} onClick={() => toggleSaved(c.caterer_id)}>
                      <Bookmark on={isSaved} /> {isSaved ? 'Saved' : 'Save'}
                    </button>
                    <button type="button" className={'tog' + (isCmp ? ' on' : '')} onClick={() => pickCompare(c.caterer_id)}>
                      <Swap /> {isCmp ? 'Selected' : 'Compare'}
                    </button>
                  </div>
                </div>
                <div>
                  <h3>{c.business_name}</h3>
                  <div className="meta">
                    {c.service_areas[0]?.area_name || 'Calbayog City'} · {c.event_types.join(', ')}
                  </div>
                  {c.tagline && <p style={{ marginBottom: 6 }}>{c.tagline}</p>}
                  <div className="small mut">
                    {c.min_guests}–{c.max_guests} guests · {custom ? 'Customizable packages' : 'Set packages'}
                  </div>
                  <div className="bot">
                    <span className="price">{p ? `From ${peso(p)} / guest` : 'Packages on request'}</span>
                    <Link className="lnk" to={'/caterer/' + c.caterer_id + carry(q)}>
                      View profile →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
          {cmp.length > 0 && (
            <div className="tray">
              <span>
                <span className="num">{cmp.length}</span>
                {cmp.length} caterer{cmp.length === 1 ? '' : 's'} selected
              </span>
              <Link className="lnk small" to="/compare">
                Compare <Arrow />
              </Link>
            </div>
          )}
          <p className="tiny mut" style={{ marginTop: 14 }}>
            Showing {rows.length} of {all.length} caterers
          </p>
        </div>
      </div>
    </div>
  );
}
