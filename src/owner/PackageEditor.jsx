import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useOwner } from './OwnerLayout';
import { useAuth } from '../shared/AuthContext';
import { gate, msg, ok, run, upload, useLoad } from '../shared/lib';
import { sb } from '../shared/supabase';
export const CATS = ['Main dish', 'Side', 'Dessert', 'Drinks'];
const BLANK = { name: '', description: '', price: '', price_range: '', min_guests: '', max_guests: '', inclusions: [], tables_chairs: 'Optional', is_customizable: true, is_active: true, package_menu_items: [], package_photos: [] };
export function PackageEditor() {
  const { id } = useParams(),
    isNew = id === 'new',
    { c } = useOwner(),
    { me } = useAuth(),
    nav = useNavigate();
  const s = useLoad(async () => {
    if (isNew) return BLANK;
    return ok(await sb.from('catering_packages').select('*,package_menu_items(*),package_photos(*)').eq('package_id', id).eq('caterer_id', c.caterer_id).maybeSingle());
  }, [id]);
  const [rows, setRows] = useState([]); // new menu rows
  const [delItems, setDelItems] = useState([]);
  const [files, setFiles] = useState([]);
  const [delPhotos, setDelPhotos] = useState([]);
  const [type, setType] = useState('Food');
  const [ptypeSel, setPtypeSel] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  const g = gate(s);
  if (g) return g;
  const p = s.data;
  // pricing type: per guest, or one fixed price for a set number of guests (like a family combo)
  const ptype = ptypeSel ?? (p?.price_type === 'fixed' ? 'fixed' : 'per_guest'),
    fixed = ptype === 'fixed';
  if (!p) return <div className="card"><h3 className="h3">Package not found</h3><Link className="btn" to="/owner/pk">Back to packages</Link></div>;
  const pending = rows.filter((r) => r.item_name.trim()).length + delItems.length + files.length + delPhotos.length;
  const setRow = (i, k, v) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const toggle = (list, set, v) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const save = run(async (e) => {
    const f = e.target,
      g = (k) => f.elements.namedItem(k);
    const mx = fixed ? +g('serves').value : +g('max_guests').value,
      mn = fixed ? mx : +g('min_guests').value;
    if (!g('name').value.trim()) throw new Error('Please add a package name.');
    if (!(+g('price').value > 0)) throw new Error(fixed ? 'Enter the package price.' : 'Enter a price per guest.');
    if (fixed && !(mx >= 1)) throw new Error('Enter how many guests this package is good for.');
    if (mn > mx) throw new Error('Minimum guests cannot exceed maximum guests.');
    const body = {
      name: g('name').value.trim(),
      description: g('description').value.trim() || null,
      price: +g('price').value,
      price_range: g('price_range').value.trim() || null,
      min_guests: mn,
      max_guests: mx,
      inclusions: g('inc').value.split('\n').map((x) => x.trim()).filter(Boolean),
      tables_chairs: g('tc').value,
      is_customizable: g('cust').checked,
    };
    // only sent when it matters, so saving per-guest packages works before the pricing SQL patch is run
    if (fixed) body.price_type = 'fixed';
    else if (p.price_type === 'fixed') body.price_type = 'per_guest';
    let pid = p.package_id;
    const write = async (row) => (isNew && !pid ? sb.from('catering_packages').insert({ ...row, caterer_id: c.caterer_id, is_active: true }).select('package_id').single() : sb.from('catering_packages').update(row).eq('package_id', pid));
    let r = await write(body);
    // database not updated for the new price-range column yet? save the rest anyway
    if (r.error && /price_range/i.test(r.error.message || '')) {
      delete body.price_range;
      r = await write(body);
    }
    if (r.error && /price_type/i.test(r.error.message || '')) throw new Error('Fixed package pricing needs a database update. Run caterhub_package_pricing_patch.sql in Supabase, then save again.');
    if (r.error) throw r.error;
    if (isNew && !pid) pid = r.data.package_id;
    if (delItems.length) {
      const d = await sb.from('package_menu_items').delete().in('menu_item_id', delItems);
      if (d.error) throw d.error;
    }
    const items = rows.filter((x) => x.item_name.trim()).map((x) => ({ package_id: pid, category: x.category, item_name: x.item_name.trim() }));
    if (items.length) {
      const d = await sb.from('package_menu_items').insert(items);
      if (d.error) throw d.error;
    }
    if (delPhotos.length) {
      const d = await sb.from('package_photos').delete().in('photo_id', delPhotos);
      if (d.error) throw d.error;
    }
    for (const file of files) {
      const url = await upload(file, me.id);
      const d = await sb.from('package_photos').insert({ package_id: pid, image_url: url, caption: type });
      if (d.error) throw d.error;
    }
    setRows([]);
    setDelItems([]);
    setFiles([]);
    setDelPhotos([]);
    setFileKey((k) => k + 1);
    msg('Changes saved');
    if (isNew) nav('/owner/pk/' + pid, { replace: true });
    else s.reload();
  });
  return (
    <>
      <div className="row-between" style={{ alignItems: 'center' }}>
        <div>
          <h1>{isNew ? 'Add package' : 'Edit package'}</h1>
          <p className="sub">{isNew ? 'Describe your menu so customers know what to expect.' : p.name}</p>
        </div>
        {!isNew && (
          <Link className="lnk" to={'/package/' + id} target="_blank">
            Preview package ↗
          </Link>
        )}
      </div>
      <form onSubmit={save} key={p.updated_at || 'new'} style={{ marginTop: 26 }}>
        <div className="ed">
          <div className="stack">
            <div className="card">
              <h3 className="h3" style={{ marginBottom: 22 }}>
                Package details
              </h3>
              <div className="field">
                <label className="l">Package name *</label>
                <input name="name" defaultValue={p.name} />
              </div>
              <div className="field">
                <label className="l">Description (optional)</label>
                <textarea name="description" rows="3" defaultValue={p.description} placeholder="What makes this package special?" />
              </div>
              <div className="field">
                <label className="l">How is this package priced? *</label>
                <label className="check">
                  <input type="radio" name="ptype" checked={!fixed} onChange={() => setPtypeSel('per_guest')} /> Per guest
                </label>
                <label className="check" style={{ marginTop: 6 }}>
                  <input type="radio" name="ptype" checked={fixed} onChange={() => setPtypeSel('fixed')} /> One fixed price for the whole package (for example a combo for 10 guests)
                </label>
              </div>
              <div className="fgrid">
                <div className="field">
                  <label className="l">{fixed ? 'Package price (₱) *' : 'Price per guest (₱) *'}</label>
                  <input type="number" name="price" min="0" step="any" defaultValue={p.price} />
                </div>
                <div className="field">
                  <label className="l">Or price range (optional)</label>
                  <input name="price_range" placeholder={fixed ? 'e.g. ₱4,000–₱4,500 per package' : 'e.g. ₱350–₱500 per guest'} defaultValue={p.price_range || ''} />
                </div>
                {fixed ? (
                  <div className="field">
                    <label className="l">Good for (number of guests) *</label>
                    <input type="number" name="serves" min="1" defaultValue={p.max_guests} placeholder="e.g. 10" />
                  </div>
                ) : (
                  <>
                    <div className="field">
                      <label className="l">Minimum guests *</label>
                      <input type="number" name="min_guests" min="1" defaultValue={p.min_guests} />
                    </div>
                    <div className="field">
                      <label className="l">Maximum guests *</label>
                      <input type="number" name="max_guests" min="1" defaultValue={p.max_guests} />
                    </div>
                  </>
                )}
              </div>
              <label className="check field">
                <input type="checkbox" name="cust" defaultChecked={p.is_customizable} /> Package can be customized
              </label>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="l">Tables and chairs</label>
                <select name="tc" defaultValue={p.tables_chairs || 'Optional'}>
                  <option>Optional</option>
                  <option>Included</option>
                </select>
              </div>
            </div>
            <div className="card">
              <h3 className="h3" style={{ marginBottom: 18 }}>
                Sample menu
              </h3>
              <div className="mtbl">
                <div className="mh">
                  <span>Dish name</span>
                  <span>Category</span>
                  <span />
                </div>
                {p.package_menu_items.map((m) => {
                  const gone = delItems.includes(m.menu_item_id);
                  return (
                    <div className="mr" key={m.menu_item_id} style={gone ? { opacity: 0.45, textDecoration: 'line-through' } : null}>
                      <span>{m.item_name}</span>
                      <span className="mut">{m.category}</span>
                      <button type="button" className="x" aria-label={gone ? 'Undo remove' : 'Remove'} onClick={() => toggle(delItems, setDelItems, m.menu_item_id)}>
                        {gone ? '↺' : '×'}
                      </button>
                    </div>
                  );
                })}
                {rows.map((r, i) => (
                  <div className="mr new" key={i}>
                    <input value={r.item_name} onChange={(e) => setRow(i, 'item_name', e.target.value)} placeholder="Dish name" style={{ padding: '8px 10px' }} aria-label="Dish name" />
                    <select value={r.category} onChange={(e) => setRow(i, 'category', e.target.value)} style={{ padding: '8px 30px 8px 10px' }} aria-label="Category">
                      {CATS.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                    <button type="button" className="x" aria-label="Remove" onClick={() => setRows(rows.filter((_, j) => j !== i))}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="lnk small" onClick={() => setRows([...rows, { category: 'Main dish', item_name: '' }])}>
                + Add menu item
              </button>
            </div>
          </div>
          <div className="stack">
            <div className="card">
              <h3 className="h3" style={{ marginBottom: 16 }}>
                Inclusions
              </h3>
              <label className="l">What's included</label>
              <textarea name="inc" rows="5" defaultValue={(p.inclusions || []).join('\n')} placeholder={'Buffet setup\nServing staff\nDinnerware'} />
              <p className="tiny mut" style={{ marginTop: 6 }}>
                One item per line.
              </p>
            </div>
            <div className="card">
              <h3 className="h3" style={{ marginBottom: 6 }}>
                Photos
              </h3>
              <p className="tiny mut">Food, package, and event setup photos.</p>
              {p.package_photos.map((h) => {
                const gone = delPhotos.includes(h.photo_id);
                return (
                  <div className="photo-card" key={h.photo_id} style={gone ? { opacity: 0.4 } : null}>
                    <img src={h.image_url} alt="" />
                    <div className="cap">
                      <span>{h.caption} photo</span>
                      <button type="button" className="lnk small" onClick={() => toggle(delPhotos, setDelPhotos, h.photo_id)}>
                        {gone ? 'Undo' : 'Remove'}
                      </button>
                    </div>
                  </div>
                );
              })}
              {files.map((f, i) => (
                <div className="photo-card" key={i}>
                  <img src={previews[i]} alt="" />
                  <div className="cap">
                    <span>{type} photo · New</span>
                    <button type="button" className="lnk small" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="dropz">
                <div className="plus">+ Upload photos</div>
                <p className="tiny mut" style={{ margin: '4px 0 12px' }}>
                  JPG, PNG, or WebP · Max 2 MB each
                </p>
                <input key={fileKey} type="file" multiple accept="image/jpeg,image/png,image/webp" aria-label="Choose photos" onChange={(e) => setFiles([...files, ...Array.from(e.target.files)])} />
                <select value={type} onChange={(e) => setType(e.target.value)} style={{ marginTop: 10 }} aria-label="Photo type">
                  {['Food', 'Package', 'Setup'].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </div>
              <p className="tiny mut" style={{ marginTop: 12 }}>
                Photographs are visible on your public package page. Keep private business information out of uploaded images.
              </p>
            </div>
          </div>
        </div>
        <div className="savebar">
          <div>
            <b>Status: {p.is_active === false ? 'Inactive' : 'Active'}</b>
            <div className="small mut">
              {pending > 0 ? `You have ${pending} unsaved menu/photo change${pending > 1 ? 's' : ''}. ` : ''}Changes update your public package after saving.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Link className="lnk mut" to="/owner/pk">
              Cancel
            </Link>
            <button className="btn">Save changes</button>
          </div>
        </div>
      </form>
    </>
  );
}
