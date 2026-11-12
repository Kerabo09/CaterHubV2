import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Arrow } from '../shared/Icons';
import { Badge, gate, ok, shortDay, today, useLoad } from '../shared/lib';
import { sb } from '../shared/supabase';
const PAGE = 5;
const MORE = ['Unavailable', 'Confirmed Outside System', 'Cancelled'];
export function My() {
  const [tab, setTab] = useState('All');
  const [pg, setPg] = useState(1);
  const [cal, setCal] = useState(false);
  const [m, setM] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [pick, setPick] = useState(null);
  const s = useLoad(
    async () =>
      ok(await sb.from('inquiries').select('*,caterer_profiles(business_name)').order('created_at', { ascending: false })),
    [],
  );
  const g = gate(s);
  if (g) return g;
  const all = s.data,
    count = (st) => all.filter((i) => i.status === st).length,
    rows = tab === 'All' ? all : all.filter((i) => i.status === tab),
    pages = Math.max(1, Math.ceil(rows.length / PAGE)),
    cur = Math.min(pg, pages),
    view = rows.slice((cur - 1) * PAGE, cur * PAGE);
  const go = (t) => {
    setTab(t);
    setPg(1);
  };
  const y = m.getFullYear(),
    mo = m.getMonth(),
    n = new Date(y, mo + 1, 0).getDate(),
    f = new Date(y, mo, 1).getDay(),
    key = (d) => `${y}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    byDay = {};
  all.filter((i) => i.status !== 'Cancelled').forEach((i) => (byDay[i.event_date] = [...(byDay[i.event_date] || []), i]));
  return (
    <div className="wrap page">
      <div className="row-between" style={{ alignItems: 'center' }}>
        <div>
          <h1 className="h1" style={{ fontSize: 38 }}>
            Your gatherings, all together.
          </h1>
          <p className="sub">Track replies, check statuses, and keep your plans moving.</p>
        </div>
        <Link className="btn" to="/caterers">
          Find a caterer <Arrow />
        </Link>
      </div>
      <div className="stats3">
        <div className="stat">
          <b>{all.length}</b>
          <span>All inquiries</span>
        </div>
        <div className="stat">
          <b>{count('Pending')}</b>
          <span>Awaiting a reply</span>
        </div>
        <div className="stat">
          <b>{count('Available')}</b>
          <span>Available</span>
        </div>
      </div>
      <div className="tabs" style={{ alignItems: 'center' }}>
        {['All', 'Pending', 'Replied', 'Available'].map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => go(t)}>
            {t === 'All' ? 'All inquiries' : t}
          </button>
        ))}
        <details className="dd" style={{ marginBottom: -1 }}>
          <summary style={{ border: 0, padding: '12px 22px 12px 0', backgroundPosition: 'right 0 center', color: MORE.includes(tab) ? 'var(--rust)' : 'var(--mut)', fontSize: 14 }}>
            {MORE.includes(tab) ? tab : 'More statuses'}
          </summary>
          <div className="card" style={{ position: 'absolute', zIndex: 5, padding: 8, minWidth: 220 }}>
            {MORE.map((t) => (
              <button key={t} style={{ display: 'block', width: '100%', textAlign: 'left', border: 0, background: 'none', padding: '10px 12px', cursor: 'pointer' }} onClick={(e) => { go(t); e.target.closest('details').open = false; }}>
                {t} ({count(t)})
              </button>
            ))}
          </div>
        </details>
        <span style={{ flex: 1 }} />
        <button className={cal ? 'on' : ''} onClick={() => setCal(!cal)}>
          {cal ? 'Hide calendar' : 'Calendar view'}
        </button>
      </div>
      {cal && (
        <div className="card calcard" style={{ marginBottom: 22 }}>
          <div className="cal-h">
            <h3>{m.toLocaleString('en', { month: 'long', year: 'numeric' })}</h3>
            <div className="nv">
              <button onClick={() => setM(new Date(y, mo - 1, 1))} aria-label="Previous month">
                ‹
              </button>
              <button onClick={() => setM(new Date(y, mo + 1, 1))} aria-label="Next month">
                ›
              </button>
            </div>
          </div>
          <div className="cal7">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div className="wd" key={d}>
                {d}
              </div>
            ))}
            {Array.from({ length: f }, (_, i) => (
              <div className="cd blank" key={'e' + i} />
            ))}
            {Array.from({ length: n }, (_, i) => {
              const d = i + 1,
                k = key(d),
                di = byDay[k] || [];
              return (
                <button key={d} type="button" className={'cd ' + (k < today() ? 'past ' : '') + (pick === k ? 'sel' : '')} onClick={() => setPick(k)}>
                  {d}
                  {di.length > 0 && (
                    <>
                      <small className="inq">{(di[0].caterer_profiles?.business_name || 'Caterer').split(' ')[0]}</small>
                      <small>
                        {di[0].status}
                        {di.length > 1 ? ` +${di.length - 1}` : ''}
                      </small>
                    </>
                  )}
                </button>
              );
            })}
          </div>
          {pick && (
            <div style={{ marginTop: 20 }}>
              <b>{shortDay(pick)}</b>
              {(byDay[pick] || []).map((i) => (
                <div className="attn" key={i.inquiry_id}>
                  <div>
                    <span className="tiny mut">{i.ref}</span>
                    <b>{i.caterer_profiles?.business_name}</b>
                    <Badge s={i.status} />
                  </div>
                  <Link className="lnk" to={'/my/' + i.ref}>
                    View →
                  </Link>
                </div>
              ))}
              {!(byDay[pick] || []).length && <p className="mut small">No inquiries on this date.</p>}
            </div>
          )}
        </div>
      )}
      <div className="card" style={{ padding: '22px 22px 14px' }}>
        {rows.length === 0 ? (
          <div className="empty-state" style={{ boxShadow: 'none' }}>
            <h3>{all.length ? 'No inquiries with this status' : 'A fresh start for your plans'}</h3>
            <p>{all.length ? 'Try another status tab.' : 'No inquiries yet? Find your caterer and send your first one.'}</p>
            <Link className="btn" to="/caterers">
              Explore caterers
            </Link>
          </div>
        ) : (
          <div className="tbl" style={{ '--cols': '2.2fr 2fr 1.1fr 0.7fr' }}>
            <div className="th">
              <span>Reference / Caterer</span>
              <span>Event</span>
              <span>Status</span>
              <span />
            </div>
            {view.map((i) => (
              <div className="tr" key={i.inquiry_id}>
                <div>
                  <div className="ref">{i.ref}</div>
                  <b>{i.caterer_profiles?.business_name}</b>
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {i.event_type} · {shortDay(i.event_date)} {new Date(i.event_date + 'T00:00').getFullYear()}
                  </div>
                  <div className="tiny mut">{i.guests} guests</div>
                </div>
                <div>
                  <Badge s={i.status} />
                </div>
                <Link className="lnk small" to={'/my/' + i.ref}>
                  View →
                </Link>
              </div>
            ))}
            <div className="pager">
              <span>
                Showing {(cur - 1) * PAGE + 1}–{(cur - 1) * PAGE + view.length} of {rows.length}
              </span>
              <span className="pg">
                <button className={cur === 1 ? 'off' : ''} onClick={() => setPg(cur - 1)}>
                  Previous
                </button>
                {Array.from({ length: pages }, (_, k) => (
                  <button key={k} className={cur === k + 1 ? 'cur' : ''} onClick={() => setPg(k + 1)}>
                    {k + 1}
                  </button>
                ))}
                <button className={cur === pages ? 'off' : ''} onClick={() => setPg(cur + 1)}>
                  Next →
                </button>
              </span>
            </div>
          </div>
        )}
      </div>
      <p className="tiny mut" style={{ marginTop: 14 }}>
        Only Pending inquiries can be cancelled. An Available status does not reserve your date.
      </p>
    </div>
  );
}
