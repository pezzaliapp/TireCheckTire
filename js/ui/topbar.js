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

// The topbar markup lives in index.html so it's visible before JS finishes
// booting. mount() just wires up SPA navigation on top of the static anchors.
export function mount() {
  const el = document.getElementById('topbar');
  if (!el) return;

  const logo = el.querySelector('#topbar-logo, .topbar-logo');
  const profile = el.querySelector('#topbar-profile');

  if (logo) logo.addEventListener('click', (e) => { e.preventDefault(); go('dashboard'); });
  if (profile) profile.addEventListener('click', (e) => { e.preventDefault(); go('settings'); });

  on('screen:changed', ({ name }) => {
    const t = el.querySelector('#topbar-title');
    if (t) t.textContent = TITLES[name] || '';
  });
}

export function setTitle(text) {
  const t = document.getElementById('topbar-title');
  if (t) t.textContent = text;
}
