import type { CSSProperties } from "react";

const paths = {
  home: "m3 10 9-7 9 7M5 9v12h5v-6h4v6h5V9",
  history: "M3 12a9 9 0 1 0 3-6.7M3 3v5h5M12 7v5l3 2",
  palette: "M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 1.4-3.4 1.2 1.2 0 0 1 .9-2h1.7A3.5 3.5 0 0 0 21 12a9 9 0 0 0-9-9ZM7 10h.01M10 6.5h.01M15 7h.01M18 11h.01",
  layout: "M4 4h16v5H4zM4 13h16v7H4z",
  note: "M14 3H5v18h14V8l-5-5ZM14 3v5h5M8 12h8M8 16h5",
  check: "m7 12 3 3 7-7M21 11v1a9 9 0 1 1-5.3-8.2",
  pause: "M9 5v14M15 5v14",
  play: "m8 5 11 7-11 7V5Z",
  close: "m6 6 12 12M18 6 6 18",
  refresh: "M20 7v5h-5M4 17v-5h5M6.1 6a8 8 0 0 1 13.2 2M4.7 16a8 8 0 0 0 13.2 2",
} as const;

export type IconName = keyof typeof paths;
export function Icon({ name, style }: { name: IconName; style?: CSSProperties }) {
  return <svg className={`icon icon-${name}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>
    <path d={paths[name]} />
  </svg>;
}
