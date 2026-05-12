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

function showFatalError(err) {
  const root = document.getElementById('screen-wrap') || document.body;
  const box = document.createElement('div');
  box.className = 'card';
  box.style.margin = '20px';
  box.style.color = 'var(--danger)';
  box.innerHTML = `
    <h3 style="color:var(--danger)">⚠ Errore di avvio</h3>
    <p style="color:var(--text-2);font-size:13px;margin:8px 0">${(err && err.message) ? err.message : 'Errore sconosciuto'}</p>
    <pre style="font-size:11px;white-space:pre-wrap;color:var(--text-3);max-height:200px;overflow:auto">${(err && err.stack) ? err.stack : ''}</pre>
    <button class="btn btn-primary btn-block" onclick="location.reload()">Ricarica</button>
  `;
  root.appendChild(box);
}

function init() {
  // Each step is wrapped so one failure doesn't blank the whole UI;
  // the static topbar/nav in index.html remain usable as a fallback.
  try { loadSettings(); } catch (e) { console.error('loadSettings failed', e); }
  try { topbar.mount(); } catch (e) { console.error('topbar.mount failed', e); }
  try { nav.mount();    } catch (e) { console.error('nav.mount failed', e); }

  try {
    router.register('dashboard',  dashboard.mount);
    router.register('scan',       scan.mount);
    router.register('analysis',   analysis.mount);
    router.register('quote',      quote.mount);
    router.register('history',    history.mount);
    router.register('nearby',     nearby.mount);
    router.register('settings',   settings.mount);
    router.register('onboarding', onboarding.mount);
  } catch (e) {
    console.error('screen registration failed', e);
    showFatalError(e);
    return;
  }

  // Service Worker + update detection. We only surface the update banner when an
  // existing controller is replaced (i.e. a real update), not on first install.
  if ('serviceWorker' in navigator) {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateBanner();
            }
          });
        });
      })
      .catch(e => console.warn('SW reg failed', e));

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController) showUpdateBanner();
    });
  }

  // Surface any uncaught error so the user is never left with a blank screen.
  window.addEventListener('error', (e) => {
    console.error('Uncaught error', e.error || e.message);
  });

  try {
    if (!state.settings.onboardingDone) {
      router.init('onboarding');
    } else {
      router.init('dashboard');
    }
  } catch (e) {
    console.error('router.init failed', e);
    showFatalError(e);
  }
}

function showUpdateBanner() {
  if (document.getElementById('sw-update-banner')) return;
  const ev = document.createElement('div');
  ev.id = 'sw-update-banner';
  ev.className = 'banner info';
  ev.style.position = 'fixed';
  ev.style.left = '12px';
  ev.style.right = '12px';
  ev.style.bottom = 'calc(var(--nav-h) + var(--safe-bottom) + 12px)';
  ev.style.zIndex = '300';
  ev.innerHTML = `<span>♻</span><div>Nuova versione disponibile</div><button class="banner-cta">Aggiorna</button>`;
  ev.querySelector('button').onclick = () => location.reload();
  document.body.appendChild(ev);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
