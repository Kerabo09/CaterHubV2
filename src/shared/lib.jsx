import { useEffect, useState } from 'react';
import { sb } from './supabase';
export const EVENTS = ['Birthday', 'Wedding', 'Fiesta', 'Seminar', 'Party'];
export const peso = (n) => '₱' + Number(n).toLocaleString('en-PH');
export const DIETARY = ['Vegetarian', 'Vegan', 'Pescatarian', 'Halal'];
export const ALLERGIES = ['Gluten-free', 'Nut-free', 'Shellfish-free', 'Dairy-free'];
export const longDate = (d) =>
  new Date(d + 'T00:00').toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric' });
export const shortDay = (d) =>
  new Date(d + 'T00:00').toLocaleDateString('en-PH', { day: 'numeric', month: 'short' });
export const when = (d) =>
  new Date(d).toLocaleString('en-PH', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
// a package is priced per guest, or has one fixed price for a set number of guests (like a combo)
export const isFixed = (p) => p.price_type === 'fixed';
// price of one guest (a fixed package price is divided by the guests it serves, for sorting and budget filters)
export const perGuest = (p) => (isFixed(p) ? Number(p.price) / Math.max(1, Number(p.max_guests) || 1) : Number(p.price));
export const priceLabel = (p) => `${peso(p.price)} / ${isFixed(p) ? 'package' : 'guest'}`;
export const guestsLabel = (p) => (isFixed(p) ? `Good for ${p.max_guests} guests` : `${p.min_guests}–${p.max_guests} guests`);
export const totalFor = (p, n) => (isFixed(p) ? Number(p.price) : Number(p.price) * n);
// lowest package price of a caterer, per guest-equivalent (for sorting)
export const fromPrice = (c) => {
  const p = (c.catering_packages || []).filter((x) => x.is_active !== false).map(perGuest);
  return p.length ? Math.min(...p) : null;
};
// "From ₱200 / guest" or, when every package has a fixed price, "From ₱4,000 / package"
export const fromLabel = (c) => {
  const act = (c.catering_packages || []).filter((x) => x.is_active !== false),
    per = act.filter((x) => !isFixed(x));
  if (per.length) return `From ${peso(Math.min(...per.map((x) => Number(x.price))))} / guest`;
  if (act.length) return `From ${peso(Math.min(...act.map((x) => Number(x.price))))} / package`;
  return null;
};
export const COVERS = ['/images/cover-1.jpg', '/images/cover-2.jpg', '/images/cover-3.jpg'];
// the cover of a caterer: the business logo, else a package photo, else a sample cover
// the picture used outside the profile: the owner's cover photo, else the logo, else a sample photo
export const coverOf = (c, i = 0) => ({
  src: c.cover_image || c.logo || COVERS[i % COVERS.length],
  isLogo: !c.cover_image && !!c.logo,
});
export const fmt = (d) =>
  new Date(d).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
export const day = (d) =>
  new Date(d + 'T00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const ok = ({ data, error }) => {
  if (error) throw error;
  return data;
};
export const msg = (t, e) => {
  const d = document.createElement('div');
  d.className = 'toast' + (e ? ' err' : '');
  d.textContent = t;
  document.body.append(d);
  setTimeout(() => d.remove(), 3500);
};
export const run = (f) => async (e) => {
  e.preventDefault();
  const b = e.currentTarget?.querySelector?.('button:not([type=button])');
  if (b) b.disabled = true;
  try {
    await f(e);
  } catch (x) {
    msg(x.message || 'Something went wrong', 1);
  } finally {
    if (b) b.disabled = false;
  }
};
export const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp'],
  MAX_MB = 2;
export async function upload(file, uid) {
  if (!IMG_TYPES.includes(file.type)) throw new Error('Only JPG, PNG or WebP images are allowed.');
  if (file.size > MAX_MB * 1048576) throw new Error(`Image must be ${MAX_MB} MB or smaller.`);
  const path = `${uid}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
  const { error } = await sb.storage.from('photos').upload(path, file, { contentType: file.type });
  if (error) throw error;
  return sb.storage.from('photos').getPublicUrl(path).data.publicUrl;
}
export const Badge = ({ s }) => <span className={'badge s-' + s.replace(/\s/g, '')}>{s}</span>;
export const Empty = ({ children }) => (
  <div className="wrap page">
    <div className="card">{children}</div>
  </div>
);
export const Loading = () => (
  <div className="wrap page">
    <p className="mut">Loading…</p>
  </div>
);
export const gate = (s) =>
  s.err ? (
    <Empty>Something went wrong: {s.err.message}</Empty>
  ) : s.data === undefined ? (
    <Loading />
  ) : null;
export function useLoad(fn, deps) {
  const [s, set] = useState({});
  const [n, setN] = useState(0);
  useEffect(() => {
    let live = true;
    fn().then(
      (data) => live && set({ data }),
      (err) => live && set({ err }),
    );
    return () => {
      live = false;
    };
  }, [...deps, n]);
  return { ...s, reload: () => setN((x) => x + 1) };
}