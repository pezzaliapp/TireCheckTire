// Parser misure ETRTO (auto + truck/bus).
// Supporta:
//   Auto:  "245/45 R18 94V", "195/65 R16C 104/102T"
//   Truck: "315/80 R22.5", "385/65 R22.5 160K"
//   La "C" indica commerciali/furgone, "CP" camper.

export function parseTireSize(str) {
  if (!str) return null;
  const s = String(str).toUpperCase().replace(/\s+/g, ' ').trim();
  // larghezza / spalla R diametro (consente .5 per truck)
  const m = s.match(/(\d{2,3})\s*[\/\- ]\s*(\d{2,3})\s*(?:Z?R|R)\s*(\d{2}(?:\.5)?)\s*(CP|C)?\s*(?:(\d{2,3}(?:\/\d{2,3})?[A-Z]{1,2}))?/);
  if (!m) return null;
  return {
    w: parseFloat(m[1]),
    h: parseFloat(m[2]),
    r: parseFloat(m[3]),
    cls: m[4] || '',
    liSi: m[5] || '',
  };
}

export function formatTireSize(sz) {
  if (!sz || sz.w == null) return '';
  const cls = sz.cls || '';
  return `${sz.w}/${sz.h} R${sz.r}${cls}${sz.liSi ? ' ' + sz.liSi : ''}`;
}

export function isValidEAN13(s) {
  if (!/^\d{13}$/.test(s)) return false;
  const d = s.split('').map(Number);
  const sum = d.slice(0, 12).reduce((a, b, i) => a + b * (i % 2 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === d[12];
}

// Multi-format QR/barcode payload parser
export function parseQRPayload(raw) {
  if (!raw) return { type: 'unknown', raw };
  const t = String(raw).trim();

  const eprelMatch = t.match(/eprel\.ec\.europa\.eu\/(?:qr|screen\/product\/tyres)\/(\d{4,8})/i);
  if (eprelMatch) {
    return {
      type: 'eprel',
      eprelId: eprelMatch[1],
      link: `https://eprel.ec.europa.eu/screen/product/tyres/${eprelMatch[1]}`,
      raw: t,
    };
  }

  if (t.startsWith('{')) {
    try {
      const j = JSON.parse(t);
      if (j.qf === 'tire' || j.type === 'tire' || j.tct === 'tire') {
        return { type: 'json', data: j, raw: t };
      }
    } catch (_) {}
  }

  if (/^https?:\/\//i.test(t)) {
    const sz = parseTireSize(decodeURIComponent(t));
    return { type: 'url', link: t, size: sz, raw: t };
  }

  if (/^\d{13}$/.test(t) && isValidEAN13(t)) {
    return { type: 'ean', ean: t, raw: t };
  }
  if (/^\d{8,14}$/.test(t)) {
    return { type: 'ean', ean: t, raw: t };
  }

  const dotMatch = t.match(/^(?:DOT\s*)?(\d{2})(\d{2})$/i);
  if (dotMatch) {
    const w = parseInt(dotMatch[1], 10);
    const y = parseInt(dotMatch[2], 10);
    if (w >= 1 && w <= 53) {
      const fullYear = y < 50 ? 2000 + y : 1900 + y;
      return { type: 'dot', dot: dotMatch[1] + dotMatch[2], week: w, year: fullYear, raw: t };
    }
  }

  const sz = parseTireSize(t);
  if (sz) return { type: 'size-text', size: sz, raw: t };

  return { type: 'unknown', raw: t };
}
