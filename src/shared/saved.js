import { useEffect, useState } from 'react';
// "Saved caterers" and "Compare" lists are kept in this browser (no account needed).
const KEYS = { saved: 'caterhub:saved', compare: 'caterhub:compare' };
export const COMPARE_MAX = 3;
const read = (k) => {
  try {
    return JSON.parse(localStorage.getItem(KEYS[k]) || '[]');
  } catch {
    return [];
  }
};
const write = (k, v) => {
  try {
    localStorage.setItem(KEYS[k], JSON.stringify(v));
  } catch {
    /* private mode: keep going */
  }
  window.dispatchEvent(new Event('caterhub:lists'));
};
export function useList(k) {
  const [v, setV] = useState(() => read(k));
  useEffect(() => {
    const h = () => setV(read(k));
    window.addEventListener('caterhub:lists', h);
    window.addEventListener('storage', h);
    return () => {
      window.removeEventListener('caterhub:lists', h);
      window.removeEventListener('storage', h);
    };
  }, [k]);
  // returns false when the compare list is already full
  const toggle = (id) => {
    const cur = read(k);
    if (cur.includes(id)) {
      write(k, cur.filter((x) => x !== id));
      return true;
    }
    if (k === 'compare' && cur.length >= COMPARE_MAX) return false;
    write(k, [...cur, id]);
    return true;
  };
  const set = (arr) => write(k, arr);
  return [v, toggle, set];
}
