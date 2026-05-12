// Officine vicine via Overpass API (OpenStreetMap)
const OVERPASS = 'https://overpass-api.de/api/interpreter';

export async function geolocate() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation non supportata'));
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }),
      e => reject(e),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  });
}

export async function search({ lat, lng, radius = 8000, kinds = ['tyres', 'car_repair', 'car'] }) {
  const filters = kinds.map(k => `node["shop"="${k}"](around:${radius},${lat},${lng});way["shop"="${k}"](around:${radius},${lat},${lng});`).join('');
  const q = `[out:json][timeout:25];(${filters});out center 60;`;
  const res = await fetch(OVERPASS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(q),
  });
  if (!res.ok) throw new Error('Overpass HTTP ' + res.status);
  const data = await res.json();
  const items = (data.elements || []).map(el => {
    const latE = el.lat ?? el.center?.lat;
    const lngE = el.lon ?? el.center?.lon;
    const name = el.tags?.name || (el.tags?.shop === 'tyres' ? 'Gommista' : 'Officina');
    const shop = el.tags?.shop || '';
    const dist = haversine(lat, lng, latE, lngE);
    return {
      id: el.id,
      name,
      shop,
      lat: latE,
      lng: lngE,
      tags: el.tags || {},
      distanceKm: dist,
    };
  }).filter(x => Number.isFinite(x.lat) && Number.isFinite(x.lng))
    .sort((a, b) => a.distanceKm - b.distanceKm);
  return items;
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function toRad(d) { return d * Math.PI / 180; }

export function mapsLink(item) {
  return `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`;
}
