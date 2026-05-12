// Normalizza la risposta dell'AI in uno schema coerente

const ESITI_OK = ['OK', 'ATTENZIONE', 'SOSTITUIRE'];
const URGENZE = ['bassa', 'media', 'alta', 'critica'];
const FIANCO = ['OK', 'VERIFICARE', 'DANNEGGIATO'];

export function tryParseJSON(raw) {
  if (!raw) return null;
  const attempts = [
    () => JSON.parse(raw.trim()),
    () => JSON.parse(String(raw).replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()),
    () => { const m = String(raw).match(/\{[\s\S]*?\}/); if (m) return JSON.parse(m[0]); throw 0; },
    () => { const m = String(raw).match(/\{[\s\S]*\}/);  if (m) return JSON.parse(m[0]); throw 0; },
  ];
  for (const fn of attempts) {
    try { return fn(); } catch (_) { /* next */ }
  }
  return null;
}

export function normalizeAnalysis(raw, fallback = {}) {
  const r = (typeof raw === 'string') ? (tryParseJSON(raw) || {}) : (raw || {});

  const esito = ESITI_OK.includes(r.esito) ? r.esito : 'ATTENZIONE';
  const urgenza = URGENZE.includes(r.urgenza) ? r.urgenza : 'media';
  const condizione_fianco = FIANCO.includes(r.condizione_fianco) ? r.condizione_fianco : 'VERIFICARE';

  return {
    esito,
    profondita_mm: r.profondita_mm ?? r['profondità_mm'] ?? null,
    usura_uniforme: r.usura_uniforme ?? true,
    tipo_usura: r.tipo_usura || 'non determinabile',
    condizione_fianco,
    urgenza,
    misura: r.misura || fallback.misura || null,
    dot: r.dot || fallback.dot || null,
    anno_produzione: r.anno_produzione || fallback.anno_produzione || null,
    marca: r.marca || fallback.marca || null,
    commento: r.commento || 'Analisi automatica completata.',
    raccomandazioni: Array.isArray(r.raccomandazioni) ? r.raccomandazioni.slice(0, 6) : [],
    leggibilita: r.leggibilita || 'buona',
    raw: typeof raw === 'string' ? raw : null,
  };
}

export function normalizeOCR(raw) {
  const r = (typeof raw === 'string') ? (tryParseJSON(raw) || {}) : (raw || {});
  return {
    misura: r.misura || null,
    dot: r.dot || null,
    anno_produzione: r.anno_produzione || null,
    marca: r.marca || null,
    leggibilita: r.leggibilita || 'parziale',
  };
}
