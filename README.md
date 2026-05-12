# 🛞 TireCheckTire — The Tire Intelligence Suite

PWA professionale per **gommisti, autofficine, fleet manager, noleggiatori e distributori B2B**.
Unifica in un'unica app modulare:

- **Diagnosi AI pneumatici** (auto + truck/bus/trailer) da foto del battistrada
- **Preventivatore guidato** 4-step (cliente → pneumatici → servizi → PDF/WhatsApp)
- **Scanner QR / EAN / DOT** (camera + jsQR fallback) con riconoscimento EPREL
- **Storico unificato** analisi + preventivi, esportabile in CSV/JSON
- **Officine vicine** via OpenStreetMap (gratis, no API key)
- **AI multi-provider**: Gemini · OpenAI · Claude · Mistral · Ollama locale

> Suite by **[PezzaliApp](https://www.pezzaliapp.com)** · zero framework, zero build, deploy diretto su GitHub Pages.

---

## ⚡ Quick start

1. Clona o scarica il repo
2. Servi la cartella con un qualsiasi web server (es. `python3 -m http.server`)
3. Apri `http://localhost:8000`
4. Onboarding: nome officina (opz.) → API key del provider AI (es. [Gemini gratuita](https://aistudio.google.com/app/apikey))
5. Pronto: scansiona, analizza, preventiva

Deploy: `git push` → GitHub Pages, oppure carica su qualsiasi hosting statico.

---

## 🧠 AI agnostica

L'app **non** include chiavi API. Ogni utente porta la propria.

| Provider | Modelli default | Note |
|---|---|---|
| Google Gemini | `gemini-2.5-flash-lite`, `gemini-2.5-flash` | Gratuita per uso personale |
| OpenAI | `gpt-4o-mini`, `gpt-4o` | Richiede billing |
| Anthropic Claude | `claude-haiku-4-5`, `claude-sonnet-4-6` | Browser direct-access |
| Mistral | `pixtral-12b-2409`, `pixtral-large-latest` | Visione multimodale |
| Ollama locale | `llava`, `gemma3`, `minicpm-v` | Offline, no cloud |

Le chiavi vivono **solo in `localStorage`**. Endpoint e modelli sono editabili dalle Impostazioni.

---

## 🏗 Architettura

```
tirechecktire/
├── index.html              # App shell (topbar + content + bottom nav)
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (cache versionata tct-v1.0.0)
├── assets/                 # Logo SVG + icone PNG
├── css/                    # Tokens, base, layout, components, scanner, animations
├── js/
│   ├── app.js              # Bootstrap
│   ├── core/               # state, storage, router, events, utils
│   ├── ui/                 # topbar, nav, toast, modal, sheet, components
│   ├── ai/                 # provider dispatcher + 5 providers + prompts + normalize
│   ├── modules/            # scanner, tire-parser, eprel, suppliers, pdf, signature, ...
│   ├── data/               # default-suppliers, service-catalog, vehicle-types
│   └── screens/            # dashboard, scan, analysis, quote, history, nearby, settings, onboarding
└── _source/extracted/      # Sorgenti originali (riferimento)
```

**Vanilla JS modulare**, ES Modules nativi, niente bundler.
Compatibile con qualsiasi browser moderno con `BarcodeDetector` o fallback `jsQR`.

---

## 🧭 Navigazione

- **Topbar persistente** (56px): logo · titolo schermata · icona Impostazioni
- **Bottom navigation** (64px) sempre visibile: 🏠 Home · 📸 Scan · 📋 Preventivo · 🗂 Storico · ⚙️ Setup

Ogni funzione è raggiungibile **in 1 tap**. Niente comand bar nascoste, niente shortcut da tastiera.

---

## 🔐 Privacy

- Nessun tracking. Nessuna analytics.
- Foto e dati cliente restano sul dispositivo (`localStorage`).
- Le chiamate AI vanno **solo** all'endpoint configurato dall'utente.
- Le chiavi API **non** sono inviate a server PezzaliApp.

---

## 📜 Licenza

MIT — vedi [LICENSE](./LICENSE).
