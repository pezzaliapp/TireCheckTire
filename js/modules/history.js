import * as storage from '../core/storage.js';
import { uid } from '../core/utils.js';

const KEY = 'history';
const MAX = 200;

export function all() {
  const arr = storage.get(KEY, []);
  return Array.isArray(arr) ? arr : [];
}

export function add(kind, payload) {
  const items = all();
  const entry = {
    id: uid(),
    kind,                  // 'analysis' | 'quote'
    timestamp: new Date().toISOString(),
    ...payload,
  };
  items.unshift(entry);
  if (items.length > MAX) items.length = MAX;
  storage.set(KEY, items);
  return entry;
}

export function get(id) {
  return all().find(x => x.id === id) || null;
}

export function remove(id) {
  const items = all().filter(x => x.id !== id);
  storage.set(KEY, items);
}

export function clear() {
  storage.set(KEY, []);
}

export function byKind(kind) {
  return all().filter(x => x.kind === kind);
}

// KPI helpers
export function todayCount(kind) {
  const today = new Date().toDateString();
  return all().filter(x => x.kind === kind && new Date(x.timestamp).toDateString() === today).length;
}

export function monthCount(kind) {
  const now = new Date();
  return all().filter(x => {
    if (x.kind !== kind) return false;
    const d = new Date(x.timestamp);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
}

export function urgenciesOpen() {
  return all().filter(x => x.kind === 'analysis' && (x.esito === 'SOSTITUIRE' || x.urgenza === 'alta' || x.urgenza === 'critica'));
}

export function lastCustomer() {
  const found = all().find(x => x.cliente || x.targa);
  if (!found) return '—';
  return found.cliente || found.targa || '—';
}
