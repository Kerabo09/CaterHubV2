import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../shared/AuthContext';
import { Up } from '../shared/Icons';
import { Badge, Empty, gate, longDate, msg, ok, run, useLoad, when } from '../shared/lib';
import { sb } from '../shared/supabase';
export function InquiryDetail() {
  const { ref } = useParams(),
    { me } = useAuth();
  const [ask, setAsk] = useState(false);
  const s = useLoad(async () => {
    const i = ok(
      await sb
        .from('inquiries')
        .select('*,caterer_profiles(caterer_id,business_name,contact_number,email),catering_packages(name,price)')
        .eq('ref', ref)
        .maybeSingle(),
    );
    if (!i) return null;
    const h = ok(await sb.from('inquiry_status_history').select('*').eq('inquiry_id', i.inquiry_id).order('created_at'));
    const q = await sb.from('inquiry_messages').select('*').eq('inquiry_id', i.inquiry_id).order('created_at');
    return { i, h, ms: q.error ? [] : q.data };
  }, [ref]);
  const g = gate(s);
  if (g) return g;
  if (!s.data)
    return (
      <Empty>
        <h3 className="h3">Inquiry not found</h3>
        <p className="mut">Not your record? Return to your inquiries.</p>
        <Link className="btn" to="/my">
          My inquiries
        </Link>
      </Empty>
    );
  const { i, h, ms } = s.data,
    c = i.caterer_profiles,
    reply = [...h].reverse().find((x) => x.message && x.changed_by !== me.id),
    pending = i.status === 'Pending';
  const cancel = run(async () => {
    const r = await sb.rpc('set_inquiry_status', { p_id: i.inquiry_id, p_status: 'Cancelled', p_message: 'Cancelled by customer' });
    if (r.error) throw r.error;
    setAsk(false);
    msg('Inquiry cancelled');
    s.reload();
  });
  const send = run(async (e) => {
    const t = e.target.message.value.trim();
    if (!t) throw new Error('Please type your message.');
    const r = await sb.rpc('reply_to_inquiry', { p_ref: i.ref, p_message: t });
    if (r.error) throw r.error;
    e.target.reset();
    msg('Message sent to the caterer');
    s.reload();
  });
  return (
    <div className="wrap page">
      <Link className="lnk mut small" to="/my">
        ← My inquiries
      </Link>
      <div className="row-between" style={{ marginTop: 22, alignItems: 'center' }}>
        <h1 className="h1" style={{ fontSize: 38 }}>
          {i.ref}
        </h1>
        <Badge s={i.status} />
      </div>
      <p className="sub" style={{ marginTop: 6 }}>
        {c.business_name} · {i.catering_packages?.name || 'Custom inquiry'}
      </p>
      <div className="det" style={{ marginTop: 28 }}>
        <div>
          <div className="card">
            <h3 className="h3">Your event</h3>
            <div className="kvs">
              <div className="kv">
                <div className="label-s">Event date</div>
                <b>{longDate(i.event_date)}</b>
              </div>
              <div className="kv">
                <div className="label-s">Guests</div>
                <b>{i.guests} guests</b>
              </div>
              <div className="kv">
                <div className="label-s">Event type</div>
                <b>{i.event_type}</b>
              </div>
              <div className="kv">
                <div className="label-s">Budget</div>
                <b>{i.budget || '—'}</b>
              </div>
              <div className="kv">
                <div className="label-s">Location</div>
                <b>{i.location}</b>
              </div>
              <div className="kv">
                <div className="label-s">Contact</div>
                <b>{i.contact_phone}</b>
              </div>
              {i.message && (
                <div className="kv full">
                  <div className="label-s">Special requests</div>
                  <b>{i.message}</b>
                </div>
              )}
              {((i.dietary || []).length > 0 || (i.allergies || []).length > 0) && (
                <div className="kv full">
                  <div className="label-s">Dietary &amp; allergy requests</div>
                  <div className="chips" style={{ marginTop: 6 }}>
                    {[...(i.dietary || []), ...(i.allergies || [])].map((x) => (
                      <span className="chip on" key={x}>
                        {x}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {reply ? (
            <div className="reply-box">
              <h3>A reply from {c.business_name}</h3>
              <blockquote>“{reply.message}”</blockquote>
              <span className="tiny mut">
                {c.business_name} · {when(reply.created_at)}
              </span>
            </div>
          ) : pending ? (
            <div className="reply-box">
              <h3>Waiting for a reply</h3>
              <p className="mut">
                {c.business_name} hasn't reviewed this inquiry yet.
                <br />
                You'll receive an in-app update when they reply.
                <br />
                You can cancel while the inquiry is still Pending.
              </p>
              <span className="tiny mut">Sent {when(i.created_at)}</span>
            </div>
          ) : null}
          {ms.length > 0 && (
            <div className="card" style={{ marginTop: 22 }}>
              <h3 className="h3" style={{ marginBottom: 12 }}>
                Messages
              </h3>
              {ms.map((x) => (
                <div className="hist" key={x.message_id}>
                  <div className="it">
                    <b className="small">{x.sender_role === 'Customer' ? 'You' : c.business_name}</b>
                    <span className="tiny mut"> · {when(x.created_at)}</span>
                    <p style={{ margin: '6px 0 0' }}>{x.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {i.status !== 'Cancelled' && (
            <form className="card" style={{ marginTop: 22 }} onSubmit={send}>
              <h3 className="h3" style={{ marginBottom: 12 }}>
                Send a message to {c.business_name}
              </h3>
              <textarea name="message" rows="3" maxLength={1000} placeholder="Add details, answer a question, or confirm your venue…" />
              <button className="btn sm" style={{ marginTop: 12 }}>
                Send message
              </button>
            </form>
          )}
          <p className="notice">
            {pending
              ? 'No booking or contract is created here. You may cancel this inquiry only while its status is Pending.'
              : 'This inquiry cannot be cancelled by you after a reply. Contact your caterer to discuss changes. No booking or contract is created here. Finalize your quotation and deposit directly.'}
          </p>
        </div>
        <div>
          <div className="card hist">
            <h3 className="h3" style={{ marginBottom: 8 }}>
              Status history
            </h3>
            {[...h].reverse().map((x) => (
              <div className="it" key={x.history_id || x.created_at}>
                <h4>
                  {x.previous_status || 'Created'} → {x.status}
                </h4>
                <div className="small mut">{x.changed_by === me.id ? 'You' : c.business_name}</div>
                <div className="tiny faint" style={{ margin: '4px 0 8px' }}>
                  {when(x.created_at)}
                </div>
                <div className="small">{x.message || (x.previous_status ? 'Status updated.' : `Inquiry submitted to ${c.business_name.replace(/\.$/, '')}.`)}</div>
              </div>
            ))}
            <p className="tiny mut" style={{ marginTop: 18 }}>
              Every update is recorded with its author, message, date, and time.
            </p>
            {pending && (
              <button className="btn soft block" onClick={() => setAsk(true)} style={{ marginTop: 10 }}>
                Cancel inquiry
              </button>
            )}
          </div>
          <div className="card" style={{ marginTop: 22 }}>
            <h3 className="h3" style={{ fontSize: 18, marginBottom: 12 }}>
              Ready to discuss the details?
            </h3>
            <p className="small mut">
              Call {c.contact_number}
              {c.email && (
                <>
                  <br />
                  or email {c.email}.
                </>
              )}
            </p>
            <Link className="btn block" to={'/caterer/' + c.caterer_id} style={{ marginTop: 14 }}>
              View caterer profile <Up />
            </Link>
          </div>
        </div>
      </div>
      {ask && (
        <div className="modal-bg" role="dialog" aria-modal="true" onClick={() => setAsk(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel {i.ref}?</h3>
            <p className="mut small">
              This is a Pending inquiry. Cancelling will notify the caterer and keep a record in your status history.
            </p>
            <div className="acts">
              <button className="btn soft" onClick={() => setAsk(false)}>
                Keep inquiry
              </button>
              <button className="btn" onClick={cancel}>
                Cancel inquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
