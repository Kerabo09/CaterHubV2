import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AvailCalendar, BLOCKED, useAvail } from '../shared/AvailCalendar';
import { Arrow } from '../shared/Icons';
import { Empty, gate, longDate, ok, useLoad } from '../shared/lib';
import { sb } from '../shared/supabase';
export function Gallery() {
  const { id } = useParams();
  const [date, setDate] = useState('');
  const s = useLoad(
    async () =>
      ok(
        await sb
          .from('caterer_profiles')
          .select('*,catering_packages(is_active,package_photos(image_url,caption))')
          .eq('caterer_id', id)
          .maybeSingle(),
      ),
    [id],
  );
  const av = useAvail(id);
  const g = gate(s);
  if (g) return g;
  const c = s.data;
  if (!c || c.status !== 'Published') return <Empty>Caterer not found.</Empty>;
  const photos = c.catering_packages
    .filter((p) => p.is_active)
    .flatMap((p) => p.package_photos)
    .slice(0, 9);
  const st = date ? av.data?.map?.[date] : null,
    taken = BLOCKED.includes(st);
  return (
    <div className="wrap page">
      <Link className="lnk small" to={'/caterer/' + id}>
        ← {c.business_name}
      </Link>
      <h1 className="h1" style={{ marginTop: 22 }}>
        Picture your next celebration.
      </h1>
      <p className="sub">Food &amp; event setup gallery</p>
      {photos.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 26 }}>
          <h3>No gallery photos yet</h3>
          <p>This caterer has not added event photos. Ask them for recent examples when you send an inquiry.</p>
        </div>
      ) : (
        <div className="cards3" style={{ marginTop: 26 }}>
          {photos.map((p, i) => (
            <div className="cv" key={i}>
              <div className="ph" style={{ aspectRatio: '1.5' }}>
                <img src={p.image_url} alt="" />
              </div>
              <p className="small mut" style={{ marginTop: 12 }}>
                {p.caption} photo
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="two" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', marginTop: 34 }}>
        <div className="card calcard">
          {av.data ? <AvailCalendar avail={av.data} value={date} onPick={setDate} /> : <p className="mut">Loading…</p>}
        </div>
        <div className="card">
          <h3 className="h3" style={{ marginBottom: 14 }}>
            {date ? longDate(date) : 'Pick a date'}
          </h3>
          {date ? (
            <>
              <p style={{ fontWeight: 600, color: taken ? 'var(--rust)' : 'var(--sage-ink)' }}>
                {taken ? st : 'Available for inquiry'}
              </p>
              <p className="mut small">
                {taken
                  ? 'Already Reserved or Unavailable? Discuss an alternative date directly with the caterer.'
                  : 'Your date is not reserved by viewing availability or sending an inquiry.'}
              </p>
              {!taken && (
                <Link className="btn block" to={`/inquire/${id}?date=${date}`}>
                  Ask about this date <Arrow />
                </Link>
              )}
            </>
          ) : (
            <p className="mut small">Select a date on the calendar to see its status.</p>
          )}
        </div>
      </div>
      <p className="tiny mut" style={{ marginTop: 26 }}>
        Only availability is public. Customer names, inquiry details, deposits, and private calendar notes are never shown
        here.
      </p>
    </div>
  );
}
