import { go } from '../core/router.js';
import { on } from '../core/events.js';

const TITLES = {
  dashboard: 'Dashboard',
  scan: 'Nuova analisi',
  analysis: 'Risultato analisi',
  quote: 'Preventivo',
  history: 'Storico',
  nearby: 'Officine vicine',
  settings: 'Impostazioni',
  onboarding: 'Benvenuto',
};

export function mount() {
  const el = document.getElementById('topbar');
  if (!el) return;

  el.innerHTML = `
    <div class="topbar-logo" id="topbar-logo" aria-label="TireCheckTire">
      <span class="accent">Tire</span>CheckTire
    </div>
    <div class="topbar-title" id="topbar-title">Dashboard</div>
    <button class="topbar-action" id="topbar-profile" aria-label="Impostazioni">⚙</button>
  `;

  el.querySelector('#topbar-logo').addEventListener('click', () => go('dashboard'));
  el.querySelector('#topbar-profile').addEventListener('click', () => go('settings'));

  on('screen:changed', ({ name }) => {
    const t = el.querySelector('#topbar-title');
    if (t) t.textContent = TITLES[name] || '';
  });
}

export function setTitle(text) {
  const t = document.getElementById('topbar-title');
  if (t) t.textContent = text;
}
