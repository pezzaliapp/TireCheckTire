// Tiny reactive store.

export function createStore(initial) {
  let state = initial;
  const listeners = new Set();
  const get = () => state;
  const set = patch => {
    const next = typeof patch === "function" ? patch(state) : { ...state, ...patch };
    if (Object.is(next, state)) return;
    state = next;
    for (const l of listeners) l(state);
  };
  const subscribe = fn => { listeners.add(fn); return () => listeners.delete(fn); };
  return { get, set, subscribe };
}

// Persistent settings (key/value, JSON) backed by localStorage.
const PFX = "tct.";

export const settings = {
  get(k, d = null) {
    try { const r = localStorage.getItem(PFX + k); return r == null ? d : JSON.parse(r); }
    catch { return d; }
  },
  set(k, v) { localStorage.setItem(PFX + k, JSON.stringify(v)); },
  del(k) { localStorage.removeItem(PFX + k); },
};
