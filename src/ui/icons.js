// Inline SVG icon system. 24×24 viewBox, stroke or fill on currentColor.
// Hand-tuned glyphs — not Material/Bootstrap.

const W = (path, attrs = "stroke") =>
  `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" ${attrs === "fill" ? `fill="currentColor"` : `stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"`}>${path}</svg>`;

export const ICONS = {
  camera:    W(`<path d="M3 8h3l2-2h8l2 2h3v11H3z"/><circle cx="12" cy="13" r="3.5"/>`),
  shutter:   W(`<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/>`),
  spark:     W(`<path d="M12 3v6m0 6v6m-9-9h6m6 0h6M6 6l3 3m6 6 3 3m0-12-3 3m-6 6-3 3"/>`),
  arrow:     W(`<path d="M5 12h14M13 6l6 6-6 6"/>`),
  arrowDiag: W(`<path d="M7 17 17 7M9 7h8v8"/>`),
  close:     W(`<path d="m6 6 12 12M18 6 6 18"/>`),
  search:    W(`<circle cx="11" cy="11" r="6"/><path d="m20 20-4-4"/>`),
  bolt:      W(`<path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor" stroke="none"/>`, "fill"),
  vault:     W(`<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9v6m10-6v6M12 9v6M3 12h18"/>`),
  gear:      W(`<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>`),
  car:       W(`<path d="M5 15V11l2-5h10l2 5v4m-14 0v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2m10 0v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2m-14 0h14M7 11h10"/><circle cx="8.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/>`),
  truck:     W(`<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>`),
  tire:      W(`<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v5m0 8v5M3 12h5m8 0h5M5.6 5.6 9 9m6 6 3.4 3.4M18.4 5.6 15 9m-6 6-3.4 3.4"/>`),
  scan:      W(`<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10"/>`),
  plus:      W(`<path d="M12 5v14M5 12h14"/>`),
  check:     W(`<path d="m5 12 5 5 9-11"/>`),
  pen:       W(`<path d="M3 21h4l11-11-4-4L3 17zM14 6l4 4"/>`),
  flip:      W(`<path d="M3 8h13a4 4 0 0 1 0 8M3 8l3-3M3 8l3 3"/>`),
  whatsapp:  W(`<path d="M20 12a8 8 0 1 1-15-4l-1 5 5-1a8 8 0 0 0 11 0Z"/><path d="M9 9c0 4 2 6 6 6"/>`),
  share:     W(`<circle cx="6" cy="12" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 11 16 7M8 13l8 4"/>`),
  download:  W(`<path d="M12 4v12m-5-5 5 5 5-5M5 20h14"/>`),
  hash:      W(`<path d="M4 9h16M4 15h16M10 4 8 20M16 4l-2 16"/>`),
  shield:    W(`<path d="M12 3 4 6v6c0 4 3 8 8 9 5-1 8-5 8-9V6Z"/><path d="m9 12 2 2 4-4"/>`),
  globe:     W(`<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>`),
  cpu:       W(`<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3"/>`),
  receipt:   W(`<path d="M5 3v18l3-2 2 2 2-2 2 2 2-2 3 2V3z"/><path d="M9 8h6M9 12h6M9 16h4"/>`),
  store:     W(`<path d="M4 9h16l-1-4H5zM5 9v10h14V9M9 19v-5h6v5"/>`),
  fleet:     W(`<path d="M2 17V9l3-2h8v10zM13 12h4l3 3v2h-7"/><circle cx="6" cy="17" r="1.5"/><circle cx="11" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/>`),
  key:       W(`<circle cx="8" cy="14" r="3"/><path d="m10.5 11.5 9-9M16 5l3 3"/>`),
  history:   W(`<path d="M3 12a9 9 0 1 0 3-6.7L3 9V3"/><path d="M12 7v5l3 2"/>`),
  brand:     W(`<path d="M12 2 2 22h20Z" fill="currentColor" stroke="none"/>`, "fill"),
};

export function icon(name, size = 20) {
  const raw = ICONS[name] || "";
  if (!size || size === 20) return raw;
  return raw.replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}"`);
}
