// TireCheckTire service worker.
// Strategy:
//   • App shell + assets: cache-first (versioned).
//   • Fonts CDN: cache-first.
//   • AI provider endpoints: never cached, must be network.
//   • Cloudflare worker (EPREL), webhooks: network only.
//   • Navigation: serve index.html offline as fallback.

const VERSION = "tct-v1.0.0";
const SHELL = `${VERSION}-shell`;

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./styles/theme.css",
  "./styles/tokens.css",
  "./styles/base.css",
  "./styles/surface.css",
  "./styles/camera.css",
  "./styles/diagnosis.css",
  "./styles/document.css",
  "./styles/signature.css",
  "./styles/command.css",
  "./styles/history.css",
  "./src/main.js",
  "./src/core/state.js",
  "./src/core/id.js",
  "./src/core/hash.js",
  "./src/core/geo.js",
  "./src/core/format.js",
  "./src/core/db.js",
  "./src/core/job.js",
  "./src/ai/providers.js",
  "./src/ai/prompts.js",
  "./src/ai/gemini.js",
  "./src/ai/openai.js",
  "./src/ai/anthropic.js",
  "./src/ai/mistral.js",
  "./src/ai/ollama.js",
  "./src/parsers/etrto.js",
  "./src/parsers/qr.js",
  "./src/data/profiles.js",
  "./src/data/services.js",
  "./src/data/suppliers.js",
  "./src/ui/dom.js",
  "./src/ui/icons.js",
  "./src/ui/stage.js",
  "./src/ui/bay.js",
  "./src/ui/camera.js",
  "./src/ui/diagnose.js",
  "./src/ui/quote.js",
  "./src/ui/signature.js",
  "./src/ui/command.js",
  "./src/ui/sheet.js",
  "./src/ui/settings.js",
  "./src/ui/vault.js",
  "./src/ui/entry.js",
  "./src/ui/share.js",
  "./src/ui/intro.js",
  "./src/legal/pdf.js",
  "./icons/logo.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;500;600;700;800&display=swap",
];

const NETWORK_ONLY = [
  "generativelanguage.googleapis.com",
  "api.openai.com",
  "api.anthropic.com",
  "api.mistral.ai",
  "hook.eu1.make.com",
  "hook.us1.make.com",
  "eprel.ec.europa.eu",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(SHELL).then(cache =>
      Promise.allSettled(ASSETS.map(u => cache.add(u).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  if (NETWORK_ONLY.some(host => url.host.endsWith(host))) return;
  if (url.pathname.includes("/ollama") || url.port === "11434") return;
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) {
        fetch(e.request).then(fresh => {
          if (fresh && fresh.status === 200) {
            caches.open(SHELL).then(c => c.put(e.request, fresh.clone()));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === "opaque") return res;
        const copy = res.clone();
        caches.open(SHELL).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => {
        if (e.request.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});

self.addEventListener("message", e => {
  if (e.data?.type === "skipWaiting") self.skipWaiting();
});
