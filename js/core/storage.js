// Wrapper localStorage con namespace tct:
const NS = 'tct:';

export function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(NS + key);
    if (raw == null) return fallback;
    try { return JSON.parse(raw); } catch { return raw; }
  } catch { return fallback; }
}

export function set(key, value) {
  try {
    const v = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(NS + key, v);
    return true;
  } catch (e) {
    console.warn('storage.set failed', e);
    return false;
  }
}

export function remove(key) {
  try { localStorage.removeItem(NS + key); return true; } catch { return false; }
}

export function clearAll() {
  try {
    Object.keys(localStorage).filter(k => k.startsWith(NS)).forEach(k => localStorage.removeItem(k));
    return true;
  } catch { return false; }
}

export function exportAll() {
  const out = {};
  try {
    Object.keys(localStorage).filter(k => k.startsWith(NS)).forEach(k => {
      const v = localStorage.getItem(k);
      try { out[k.slice(NS.length)] = JSON.parse(v); } catch { out[k.slice(NS.length)] = v; }
    });
  } catch {}
  return out;
}

export function importAll(obj) {
  try {
    Object.entries(obj || {}).forEach(([k, v]) => set(k, v));
    return true;
  } catch { return false; }
}
