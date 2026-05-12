// TireCheckTire Service Worker
const CACHE_VERSION = 'tct-v1.0.3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/logo.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/maskable-512.png',
  './assets/apple-touch-icon.png',
  './css/tokens.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/scanner.css',
  './css/animations.css',
  './js/app.js',
  './js/core/state.js',
  './js/core/storage.js',
  './js/core/router.js',
  './js/core/events.js',
  './js/core/utils.js',
  './js/ui/topbar.js',
  './js/ui/nav.js',
  './js/ui/toast.js',
  './js/ui/modal.js',
  './js/ui/sheet.js',
  './js/ui/components.js',
  './js/ui/legal-modal.js',
  './js/ai/provider.js',
  './js/ai/prompts.js',
  './js/ai/normalize.js',
  './js/ai/providers/gemini.js',
  './js/ai/providers/openai.js',
  './js/ai/providers/anthropic.js',
  './js/ai/providers/mistral.js',
  './js/ai/providers/ollama.js',
  './js/modules/scanner.js',
  './js/modules/tire-parser.js',
  './js/modules/eprel.js',
  './js/modules/suppliers.js',
  './js/modules/pdf-report.js',
  './js/modules/pdf-quote.js',
  './js/modules/signature.js',
  './js/modules/webhook.js',
  './js/modules/nearby.js',
  './js/modules/history.js',
  './js/modules/export.js',
  './js/data/default-suppliers.js',
  './js/data/service-catalog.js',
  './js/data/vehicle-types.js',
  './js/data/legal.js',
  './js/screens/dashboard.js',
  './js/screens/scan.js',
  './js/screens/analysis.js',
  './js/screens/quote.js',
  './js/screens/history.js',
  './js/screens/nearby.js',
  './js/screens/settings.js',
  './js/screens/onboarding.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Network-first per chiamate AI / API esterne
  const networkFirst = /generativelanguage\.googleapis|api\.openai\.com|api\.anthropic\.com|api\.mistral\.ai|overpass-api\.de|hook\..*\.make\.com|eprel\.ec\.europa\.eu|nominatim\.openstreetmap/i.test(url.hostname + url.pathname);

  if (networkFirst) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  // Cache-first per asset same-origin
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => cached);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
