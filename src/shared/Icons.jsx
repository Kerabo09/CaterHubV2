const S = { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
export const Bookmark = ({ on }) => (
  <svg {...S} fill={on ? 'currentColor' : 'none'}>
    <path d="M4 2.5h8v11l-4-2.8-4 2.8z" />
  </svg>
);
export const Swap = () => (
  <svg {...S}>
    <path d="M3 6h9l-2.5-2.5M13 10H4l2.5 2.5" />
  </svg>
);
export const Arrow = () => (
  <svg {...S}>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);
export const Up = () => (
  <svg {...S} width="11" height="11">
    <path d="M5 11l6-6M6 5h5v5" />
  </svg>
);
export const Check = () => (
  <svg {...S}>
    <path d="M3 8.5l3.2 3L13 4.5" />
  </svg>
);
