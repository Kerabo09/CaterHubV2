import { useState } from 'react';
import { useAuth } from '../shared/AuthContext';
import { unreadRefs } from '../shared/Conversation';
import { Link } from 'react-router-dom';
import { STATUSES } from './constants';
import { useOwner } from './OwnerLayout';
import { Badge, gate, ok, shortDay, useLoad } from '../shared/lib';
import { sb } from '../shared/supabase';
const PAGE = 5;
export function OwnerInquiries() {
  const { c } = useOwner(),
    { me } = useAuth();
  const [q, setQ] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [tab, setTab] = useState('All');
  const [pg, setPg] = useState(1);
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
  const un = useLoad(() => unreadRefs(me.id), []);
  const g = gate(s);
  if (g) return g;
  const all = s.data,
    cnt = (st) => all.filter((i) => i.status === st).length,
    low = q.trim().toLowerCase();
  const rows = all.filter(
    (i) =>
      (tab === 'All' || i.status === tab) &&
      (!status || i.status === status) &&
      (!date || i.event_date === date) &&
      (!low || i.ref.toLowerCase().includes(low) || (i.customers?.name || '').toLowerCase().includes(low)),
  );
  const pages = Math.max(1, Math.ceil(rows.length / PAGE)),
    cur = Math.min(pg, pages),
    view = rows.slice((cur - 1) * PAGE, cur * PAGE);
  return (
    <>
      <h1>Inquiries</h1>
      <p className="sub">Review event requests and keep every reply organized.</p>
      <div className="ftools">
        <div>
          <label className="l" style={{ fontSize: 12, fontWeight: 500 }}>
            Find an inquiry
          </label>
          <input type="search" value={q} onChange={(e) => (setQ(e.target.value), setPg(1))} placeholder="Search reference or customer…" />
        </div>
        <div>
          <label className="l" style={{ fontSize: 12, fontWeight: 500 }}>
            Event date
          </label>
          <input type="date" value={date} onChange={(e) => (setDate(e.target.value), setPg(1))} />
        </div>
        <div>
          <label className="l" style={{ fontSize: 12, fontWeight: 500 }}>
            Status
          </label>
          <select value={status} onChange={(e) => (setStatus(e.target.value), setPg(1))}>
            <option value="">All statuses</option>
            {STATUSES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="tabs">
        {[
          ['All', `All ${all.length}`],
          ['Pending', `Pending ${cnt('Pending')}`],
          ['Replied', `Replied ${cnt('Replied')}`],
          ['Available', `Available ${cnt('Available')}`],
        ].map(([k, l]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => (setTab(k), setPg(1))}>
            {l}
          </button>
        ))}
      </div>
      <div className="card" style={{ padding: '22px 22px 14px' }}>
        {rows.length === 0 ? (
          <div className="empty-state" style={{ boxShadow: 'none' }}>
            <h3>{all.length ? 'No inquiries match' : 'No inquiries yet'}</h3>
            <p>{all.length ? 'Try a different search or status.' : 'New inquiries from customers will appear here.'}</p>
          </div>
        ) : (
          <div className="tbl" style={{ '--cols': '2fr 1.8fr 1.1fr 0.6fr' }}>
            <div className="th">
              <span>Customer / Reference</span>
              <span>Event / Guests</span>
              <span>Status</span>
              <span />
            </div>
            {view.map((i) => (
              <div className="tr" key={i.inquiry_id}>
                <div>
                  <b>{i.customers?.name || 'Customer'}</b>
                  <div className="ref">{i.ref}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {shortDay(i.event_date)} {new Date(i.event_date + 'T00:00').getFullYear()} · {i.event_type}
                  </div>
                  <div className="tiny mut">{i.guests} guests</div>
                </div>
                <div>
                  <Badge s={i.status} />
                  {un.data?.has(i.ref) && (
                    <div style={{ marginTop: 6 }}>
                      <span className="pill rust">New message</span>
                    </div>
                  )}
                </div>
                <Link className="lnk small" to={'/owner/inq/' + i.ref}>
                  Open →
                </Link>
              </div>
            ))}
            <div className="pager">
              <span>
                Showing {(cur - 1) * PAGE + 1}–{(cur - 1) * PAGE + view.length} of {rows.length} inquiries
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
    </>
  );
}
