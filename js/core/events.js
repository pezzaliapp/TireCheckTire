const listeners = new Map();

export function on(event, cb) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(cb);
  return () => off(event, cb);
}

export function off(event, cb) {
  const set = listeners.get(event);
  if (set) set.delete(cb);
}

export function emit(event, payload) {
  const set = listeners.get(event);
  if (!set) return;
  set.forEach(cb => {
    try { cb(payload); } catch (e) { console.error('event handler error', event, e); }
  });
}
