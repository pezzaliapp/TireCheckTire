import { downloadBlob } from '../core/utils.js';

export function toCSV(items) {
  if (!items || !items.length) return '';
  const cols = ['id', 'kind', 'timestamp', 'esito', 'urgenza', 'targa', 'cliente', 'misura', 'dot', 'marca', 'totale', 'commento'];
  const head = cols.join(';');
  const rows = items.map(i => cols.map(c => csvEscape(i[c])).join(';'));
  return [head, ...rows].join('\n');
}

function csvEscape(v) {
  if (v == null) return '';
  let s = String(v).replace(/"/g, '""').replace(/[\r\n;]/g, ' ');
  return `"${s}"`;
}

export function downloadCSV(items, filename = 'tirechecktire-export.csv') {
  downloadBlob(toCSV(items), filename, 'text/csv;charset=utf-8');
}

export function downloadJSON(payload, filename = 'tirechecktire-export.json') {
  downloadBlob(JSON.stringify(payload, null, 2), filename, 'application/json');
}
