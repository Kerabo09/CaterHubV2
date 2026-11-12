import { useState } from 'react';
import { sb } from './supabase';
import { useLoad, today } from './lib';

export const BLOCKED = ['Reserved', 'Unavailable'];

// Loads the caterer's Reserved / Unavailable dates: { map: { 'YYYY-MM-DD': status }, failed }
export function useAvail(id) {
  return useLoad(async () => {
    const r = await sb.from('caterer_availability').select('day,status').eq('caterer_id', id);
    if (r.error) return { map: {}, failed: true };
    return { map: Object.fromEntries(r.data.map((x) => [x.day, x.status])), failed: false };
  }, [id]);
}

// Month calendar of a caterer's availability. Pass onPick to let the customer choose a free date.
export function AvailCalendar({ avail, value, onPick, title = true }) {
  const [m, setM] = useState(() => {
    const d = value ? new Date(value + 'T00:00') : new Date();
    d.setDate(1);
    return d;
  });
  const av = avail?.map || {},
    t = today(),
    y = m.getFullYear(),
    mo = m.getMonth(),
    n = new Date(y, mo + 1, 0).getDate(),
    f = new Date(y, mo, 1).getDay(),
    k = (d) => `${y}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const go = (d) => setM(new Date(y, mo + d, 1));
  return (
    <>
      <div className="cal-h">
        <h3>{m.toLocaleString('en', { month: 'long', year: 'numeric' })}</h3>
        <div className="nv">
          <button type="button" onClick={() => go(-1)} aria-label="Previous month">
            ‹
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next month">
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
            key = k(d),
            st = av[key],
            blocked = BLOCKED.includes(st),
            past = key < t;
          return (
            <button
              type="button"
              key={d}
              disabled={!onPick}
              className={`cd ${st || ''} ${past ? 'past' : ''} ${value === key ? 'sel' : ''}`}
              onClick={() => onPick && !blocked && !past && onPick(key)}
            >
              {d}
              <small>{st || 'Available'}</small>
            </button>
          );
        })}
      </div>
      <div className="legend">
        <span>
          <i />
          Available
        </span>
        <span>
          <i className="u" />
          Unavailable
        </span>
        <span>
          <i className="r" />
          Reserved
        </span>
      </div>
      {avail?.failed && (
        <p className="tiny mut" style={{ marginTop: 10 }}>
          Availability is not shown yet. The caterer will confirm the date when replying.
        </p>
      )}
    </>
  );
}
