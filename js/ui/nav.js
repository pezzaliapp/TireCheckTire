import { go, current } from '../core/router.js';
import { on } from '../core/events.js';

const TABS = [
  { key: 'dashboard', screen: 'dashboard', icon: '🏠', label: 'Home' },
  { key: 'scan',      screen: 'scan',      icon: '📸', label: 'Scan' },
  { key: 'quote',     screen: 'quote',     icon: '📋', label: 'Preventivo' },
  { key: 'history',   screen: 'history',   icon: '🗂',  label: 'Storico' },
  { key: 'settings',  screen: 'settings',  icon: '⚙️', label: 'Setup' },
];

export function mount() {
  const el = document.getElementById('bottom-nav');
  if (!el) return;

  el.innerHTML = TABS.map(t => `
    <button class="nav-tab" data-screen="${t.screen}" aria-label="${t.label}">
      <span class="nav-ico">${t.icon}</span>
      <span class="nav-label">${t.label}</span>
    </button>
  `).join('');

  el.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => go(btn.dataset.screen));
  });

  highlight(current());
  on('screen:changed', ({ name }) => highlight(name));
}

function highlight(screenName) {
  const el = document.getElementById('bottom-nav');
  if (!el) return;
  el.querySelectorAll('.nav-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.screen === screenName);
  });
}
