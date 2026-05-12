import { state } from '../core/state.js';

export async function fetchData(eprelId) {
  const proxy = (state.settings.eprelProxy || '').trim();
  if (!proxy) return null;
  try {
    const url = proxy.includes('{id}')
      ? proxy.replace('{id}', eprelId)
      : proxy + (proxy.includes('?') ? '&' : '?') + 'id=' + eprelId;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    const j = await res.json();
    if (j && (j.brand || j.size) && j.source !== 'fallback-link-only') {
      return {
        brand: j.brand || '',
        size: j.size || '',
        liSi: j.liSi || '',
        classCarb: j.classCarb || '',
        classAder: j.classAder || '',
        classRumore: j.classRumore || '',
        season: j.season || '',
        link: j.link || `https://eprel.ec.europa.eu/screen/product/tyres/${eprelId}`,
        source: j.source || 'proxy',
      };
    }
  } catch (e) {
    console.warn('EPREL proxy fail:', e.message);
  }
  return null;
}

export function link(eprelId) {
  return `https://eprel.ec.europa.eu/screen/product/tyres/${eprelId}`;
}

export function mapSeason(raw) {
  if (!raw) return 'estive';
  const s = String(raw).toLowerCase();
  if (/snow|invern|winter/.test(s)) return 'invernali';
  if (/all[- ]?season|tutte.*stagioni|4.?stag/.test(s)) return '4stag';
  return 'estive';
}
