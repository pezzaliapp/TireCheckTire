// TireCheckTire — App bootstrap
import { loadSettings, state } from './core/state.js';
import * as router from './core/router.js';
import * as topbar from './ui/topbar.js';
import * as nav from './ui/nav.js';

// screens
import * as dashboard from './screens/dashboard.js';
import * as scan from './screens/scan.js';
import * as analysis from './screens/analysis.js';
import * as quote from './screens/quote.js';
import * as history from './screens/history.js';
import * as nearby from './screens/nearby.js';
import * as settings from './screens/settings.js';
import * as onboarding from './screens/onboarding.js';

function init() {
  loadSettings();

  topbar.mount();
  nav.mount();

  router.register('dashboard',  dashboard.mount);
  router.register('scan',       scan.mount);
  router.register('analysis',   analysis.mount);
  router.register('quote',      quote.mount);
  router.register('history',    history.mount);
  router.register('nearby',     nearby.mount);
  router.register('settings',   settings.mount);
  router.register('onboarding', onboarding.mount);

  // service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(e => console.warn('SW reg failed', e));
  }

  // PWA update banner
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      const ev = document.createElement('div');
      ev.className = 'banner info';
      ev.style.position = 'fixed';
      ev.style.left = '12px';
      ev.style.right = '12px';
      ev.style.bottom = 'calc(var(--nav-h) + var(--safe-bottom) + 12px)';
      ev.style.zIndex = '300';
      ev.innerHTML = `<span>♻</span><div>Nuova versione disponibile</div><button class="banner-cta">Aggiorna</button>`;
      ev.querySelector('button').onclick = () => location.reload();
      document.body.appendChild(ev);
    });
  }

  // routing
  if (!state.settings.onboardingDone) {
    router.init('onboarding');
  } else {
    router.init('dashboard');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
