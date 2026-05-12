// Multi-format scanner payload parser.
// Recognises: EPREL URLs, EAN-13 (validated), DOT (WWYY), QuoteFlash JSON, plain URLs, ETRTO text.

import { parseTireSize } from "./etrto.js";

const RX_EPREL = /eprel\.ec\.europa\.eu\/(?:qr|screen\/product\/tyres)\/(\d{4,8})/i;

export function parseQRPayload(raw) {
  if (!raw) return { kind: "unknown", raw };
  const t = String(raw).trim();

  const eprel = t.match(RX_EPREL);
  if (eprel) {
    return {
      kind: "eprel",
      eprelId: eprel[1],
      link: `https://eprel.ec.europa.eu/screen/product/tyres/${eprel[1]}`,
      raw: t
    };
  }

  if (t.startsWith("{")) {
    try {
      const j = JSON.parse(t);
      if (j.qf === "tire" || j.tct === "tire" || j.type === "tire") {
        return { kind: "tct-json", data: j, raw: t };
      }
    } catch { /* ignore */ }
  }

  if (/^https?:\/\//i.test(t)) {
    return {
      kind: "url",
      link: t,
      size: parseTireSize(decodeURIComponent(t)),
      raw: t
    };
  }

  if (/^\d{13}$/.test(t) && isValidEAN13(t)) return { kind: "ean", ean: t, raw: t };
  if (/^\d{8,14}$/.test(t)) return { kind: "ean", ean: t, raw: t };

  const dot = t.match(/^(?:DOT\s*)?(\d{2})(\d{2})$/i);
  if (dot) {
    const w = parseInt(dot[1], 10), y = parseInt(dot[2], 10);
    if (w >= 1 && w <= 53) {
      return {
        kind: "dot",
        dot: dot[1] + dot[2],
        week: w,
        year: y < 50 ? 2000 + y : 1900 + y,
        raw: t
      };
    }
  }

  const sz = parseTireSize(t);
  if (sz) return { kind: "size", size: sz, raw: t };

  return { kind: "unknown", raw: t };
}

export function isValidEAN13(s) {
  if (!/^\d{13}$/.test(s)) return false;
  const d = s.split("").map(Number);
  const sum = d.slice(0, 12).reduce((a, b, i) => a + b * (i % 2 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === d[12];
}
