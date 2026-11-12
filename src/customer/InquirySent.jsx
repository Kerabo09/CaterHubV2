import { Link, useParams } from 'react-router-dom';
import { Arrow, Check } from '../shared/Icons';
import { gate, longDate, ok, useLoad, when } from '../shared/lib';
import { sb } from '../shared/supabase';
export function Sent() {
  const { ref } = useParams();
  const s = useLoad(
    async () =>
      ok(await sb.from('inquiries').select('*,caterer_profiles(business_name)').eq('ref', ref).maybeSingle()),
    [ref],
  );
  const g = gate(s);
  if (g) return g;
  const i = s.data;
  return (
    <div className="wrap page">
      <div className="card sent">
        <span className="pill sage" style={{ padding: '10px 28px', display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <Check /> Sent
        </span>
        <h1 className="h1" style={{ fontSize: 34, margin: '34px 0 12px' }}>
          Your inquiry is on its way.
        </h1>
        <p className="mut">{i?.caterer_profiles?.business_name || 'The caterer'} will review your event details and reply here.</p>
        <div className="ref">
          <div className="label-s">Inquiry reference</div>
          <h2>{ref}</h2>
          {i && (
            <>
              <p>
                {i.event_type} · {longDate(i.event_date)} · {i.guests} guests
              </p>
              <p className="tiny mut" style={{ margin: 0 }}>
                Status: {i.status} · Sent {when(i.created_at)}
              </p>
            </>
          )}
        </div>
        <p className="small mut" style={{ maxWidth: 440 }}>
          This is not a confirmed booking. Your date will be reserved only after you and the caterer finalize an agreement directly.
        </p>
        <div style={{ display: 'flex', gap: 14, marginTop: 28, flexWrap: 'wrap' }}>
          <Link className="btn" to={'/my/' + ref}>
            View my inquiry <Arrow />
          </Link>
          <Link className="btn soft" to="/caterers">
            Continue browsing
          </Link>
        </div>
      </div>
    </div>
  );
}
