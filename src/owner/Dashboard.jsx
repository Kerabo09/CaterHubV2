import { Link } from 'react-router-dom';
import { GREET, useOwner } from './OwnerLayout';
import { Arrow } from '../shared/Icons';
import { gate, ok, shortDay, today, useLoad } from '../shared/lib';
import { sb } from '../shared/supabase';
export function Overview() {
  const { c } = useOwner();
  const s = useLoad(
    async () =>
      ok(
        await sb
          .from('inquiries')
          .select('*,customers(name)')
          .eq('caterer_id', c.caterer_id)
          .order('created_at', { ascending: false }),
      ),
    [c.caterer_id],
  );
  const g = gate(s);
  if (g) return g;
  const all = s.data,
    n = (st) => all.filter((i) => i.status === st).length,
    pending = all.filter((i) => i.status === 'Pending'),
    soon = all
      .filter((i) => ['Pending', 'Replied', 'Available'].includes(i.status) && i.event_date >= today())
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
      .slice(0, 3);
  return (
    <>
      <div className="row-between" style={{ alignItems: 'center' }}>
        <div>
          <h1>
            {GREET()}, {c.business_name.replace(/\.$/, '')}.
          </h1>
          <p className="sub">Here's what needs your attention today.</p>
        </div>
        <Link className="btn" to="/owner/inq">
          View inquiries <Arrow />
        </Link>
      </div>
      <div className="stats3 own">
        <div className="stat">
          <span>Pending</span>
          <b>{n('Pending')}</b>
          <span>Needs your response</span>
        </div>
        <div className="stat">
          <span>Replied</span>
          <b>{n('Replied')}</b>
          <span>Conversation started</span>
        </div>
        <div className="stat">
          <span>Available</span>
          <b>{n('Available')}</b>
          <span>Awaiting final agreement</span>
        </div>
      </div>
      <div className="stats-strip" style={{ justifyContent: 'space-between' }}>
        <span>
          <b>{n('Unavailable')}</b> Unavailable
        </span>
        <span>
          <b>{n('Confirmed Outside System')}</b> Confirmed outside system
        </span>
        <span>
          <b>{n('Cancelled')}</b> Cancelled
        </span>
      </div>
      <div className="two">
        <div className="card">
          <h3 className="h3" style={{ marginBottom: 14 }}>
            Needs your attention
          </h3>
          {pending.length === 0 && <p className="mut small">Nothing is waiting for a response. New inquiries will appear here.</p>}
          {pending.slice(0, 4).map((i) => (
            <div className="attn" key={i.inquiry_id}>
              <div>
                <span className="tiny mut">{i.ref}</span>
                <b>{i.customers?.name || 'Customer'}</b>
                <span className="small mut">
                  {shortDay(i.event_date)} · {i.event_type} · {i.guests} guests
                </span>
              </div>
              <Link className="lnk" to={'/owner/inq/' + i.ref}>
                Review →
              </Link>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 className="h3" style={{ marginBottom: 14 }}>
            Coming up
          </h3>
          {soon.length === 0 && <p className="mut small">No upcoming dates yet.</p>}
          {soon.map((i) => (
            <div className="upc" key={i.inquiry_id}>
              <div className="d">{shortDay(i.event_date).toUpperCase()}</div>
              <b>
                {i.event_type} · {i.guests} guests
              </b>
              <span className="small mut">
                {i.status === 'Pending' ? 'Pending · Check availability' : i.status + ' inquiry · Not reserved'}
              </span>
            </div>
          ))}
          <p style={{ marginTop: 16 }}>
            <Link className="lnk small" to="/owner/av">
              Open calendar →
            </Link>
          </p>
        </div>
      </div>
      <div className="box rust" style={{ marginTop: 24, padding: '22px 26px' }}>
        <h3 style={{ fontSize: 17, fontWeight: 600 }}>Inquiries aren't bookings.</h3>
        <p className="small mut" style={{ margin: 0 }}>
          Confirm quotations, deposits, and agreements directly. Then update the inquiry and reserve the date yourself.
        </p>
      </div>
    </>
  );
}
