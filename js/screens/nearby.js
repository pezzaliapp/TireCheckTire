import * as nearby from '../modules/nearby.js';
import { escapeHtml } from '../core/utils.js';
import { toast } from '../ui/toast.js';

let result = [];
let category = 'all';
let coords = null;

export function mount() {
  result = [];
  category = 'all';
  render();
  start();
}

function render() {
  const root = document.getElementById('screen-nearby');
  const filtered = category === 'all' ? result : result.filter(r => r.shop === category);

  root.innerHTML = `
    <div class="screen-sub">Officine vicine · OpenStreetMap</div>
    <div class="segmented" style="grid-template-columns:repeat(4,1fr)">
      <button class="seg-opt ${category === 'all' ? 'active' : ''}" data-c="all">Tutto</button>
      <button class="seg-opt ${category === 'tyres' ? 'active' : ''}" data-c="tyres">Gommisti</button>
      <button class="seg-opt ${category === 'car_repair' ? 'active' : ''}" data-c="car_repair">Officine</button>
      <button class="seg-opt ${category === 'car' ? 'active' : ''}" data-c="car">Auto</button>
    </div>

    <div class="btn-row" style="margin-bottom:12px">
      <button class="btn btn-secondary" id="n-refresh">📍 Aggiorna posizione</button>
      <button class="btn btn-secondary" id="n-manual">🌍 Inserisci città</button>
    </div>

    <div id="n-status" style="color:var(--text-2);margin-bottom:10px;font-size:13px"></div>

    ${filtered.length ? filtered.slice(0, 30).map(r => `
      <a class="history-item" href="${nearby.mapsLink(r)}" target="_blank" rel="noopener">
        <div class="history-thumb" style="display:grid;place-items:center">${r.shop === 'tyres' ? '🛞' : r.shop === 'car_repair' ? '🔧' : '🚗'}</div>
        <div class="history-info">
          <div class="history-title">${escapeHtml(r.name)}</div>
          <div class="history-meta">${escapeHtml([r.tags.addr_street, r.tags.addr_city].filter(Boolean).join(' · ') || r.shop)}</div>
          <div class="history-meta" style="color:var(--accent)">${r.distanceKm.toFixed(1)} km</div>
        </div>
      </a>
    `).join('') : `<div class="empty"><div class="empty-ico">📍</div>Cerco officine intorno a te…</div>`}
  `;

  root.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => { category = b.dataset.c; render(); }));
  root.querySelector('#n-refresh').addEventListener('click', start);
  root.querySelector('#n-manual').addEventListener('click', searchManual);
}

async function start() {
  setStatus('📍 Recupero posizione…');
  try {
    coords = await nearby.geolocate();
    setStatus(`📡 Ricerca a ${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}…`);
    result = await nearby.search(coords);
    setStatus(`${result.length} risultati`);
    render();
  } catch (e) {
    setStatus('⚠ ' + (e.message || 'Geolocation negata'));
    toast('Permesso posizione negato — usa input manuale', 'warn');
  }
}

async function searchManual() {
  const city = window.prompt('Inserisci città o CAP', '');
  if (!city) return;
  setStatus('🔍 Cerco "' + city + '"…');
  try {
    const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(city));
    const arr = await r.json();
    if (!arr.length) return toast('Località non trovata', 'warn');
    coords = { lat: +arr[0].lat, lng: +arr[0].lon };
    result = await nearby.search(coords);
    setStatus(`${result.length} risultati intorno a ${arr[0].display_name}`);
    render();
  } catch (e) {
    toast('⚠ ' + e.message, 'error');
  }
}

function setStatus(t) {
  const el = document.getElementById('n-status');
  if (el) el.textContent = t;
}
