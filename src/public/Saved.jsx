import { Link } from 'react-router-dom';
import { Bookmark, Swap } from '../shared/Icons';
import { coverOf, fromPrice, gate, msg, ok, peso, useLoad } from '../shared/lib';
import { COMPARE_MAX, useList } from '../shared/saved';
import { sb } from '../shared/supabase';
export function Saved() {
  const [ids, toggleSaved] = useList('saved');
  const [cmp, toggleCmp] = useList('compare');
  const s = useLoad(async () => {
    if (!ids.length) return [];
    return ok(
      await sb
        .from('caterer_profiles')
        .select('*,service_areas(area_name),catering_packages(price,is_active,is_customizable,package_photos(image_url))')
        .in('caterer_id', ids)
        .eq('status', 'Published'),
    );
  }, [ids.join(',')]);
  const g = gate(s);
  if (g) return g;
  const rows = s.data.filter((c) => ids.includes(c.caterer_id));
  return (
    <div className="wrap page">
      <div className="crumbs">
        <Link to="/caterers">Browse caterers</Link>
        <i>/</i>
        Saved caterers
      </div>
      <h1 className="h1">Saved caterers</h1>
      <p className="sub">The caterers you want to look at again. Saved on this device.</p>
      {rows.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 28 }}>
          <h3>A fresh start for your plans</h3>
          <p>You have not saved any caterers yet. Tap Save on a caterer to keep it here.</p>
          <Link className="btn" to="/caterers">
            Explore caterers
          </Link>
        </div>
      ) : (
        <div style={{ marginTop: 26 }}>
          {rows.map((c, i) => {
            const cv = coverOf(c, i),
              p = fromPrice(c),
              isCmp = cmp.includes(c.caterer_id);
            return (
              <article className="cat" key={c.caterer_id}>
                <div className={'ph' + (cv.isLogo ? ' logo' : '')}>
                  <img src={cv.src} alt="" />
                  <div className="cat-actions">
                    <button type="button" className="tog on" onClick={() => toggleSaved(c.caterer_id)}>
                      <Bookmark on /> Saved
                    </button>
                    <button
                      type="button"
                      className={'tog' + (isCmp ? ' on' : '')}
                      onClick={() => !toggleCmp(c.caterer_id) && msg(`You can compare up to ${COMPARE_MAX} caterers.`, 1)}
                    >
                      <Swap /> {isCmp ? 'Selected' : 'Compare'}
                    </button>
                  </div>
                </div>
                <div>
                  <h3>{c.business_name}</h3>
                  <div className="meta">
                    {c.service_areas[0]?.area_name || 'Calbayog City'} · {c.event_types.join(', ')}
                  </div>
                  <div className="small mut">
                    {c.min_guests}–{c.max_guests} guests
                  </div>
                  <div className="bot">
                    <span className="price">{p ? `From ${peso(p)} / guest` : 'Packages on request'}</span>
                    <Link className="lnk" to={'/caterer/' + c.caterer_id}>
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
                Compare →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
