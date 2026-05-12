// Geolocation — opt-in, never blocks the workflow.

let cached = null;
let pending = null;

export function lastGeo() { return cached; }

export function fetchGeo({ timeout = 3500, maxAge = 60_000 } = {}) {
  if (cached && Date.now() - cached.takenAt < maxAge) return Promise.resolve(cached);
  if (pending) return pending;
  if (!("geolocation" in navigator)) return Promise.resolve(null);

  pending = new Promise(resolve => {
    const t = setTimeout(() => { pending = null; resolve(null); }, timeout);
    navigator.geolocation.getCurrentPosition(
      pos => {
        clearTimeout(t);
        cached = {
          lat: round(pos.coords.latitude, 6),
          lng: round(pos.coords.longitude, 6),
          acc: Math.round(pos.coords.accuracy),
          takenAt: Date.now()
        };
        pending = null;
        resolve(cached);
      },
      () => { clearTimeout(t); pending = null; resolve(null); },
      { enableHighAccuracy: true, timeout, maximumAge: maxAge }
    );
  });
  return pending;
}

function round(n, d) {
  const k = 10 ** d;
  return Math.round(n * k) / k;
}

export function formatGeo(g) {
  if (!g) return "GPS non disponibile";
  return `${g.lat.toFixed(5)}, ${g.lng.toFixed(5)} · ±${g.acc}m`;
}
