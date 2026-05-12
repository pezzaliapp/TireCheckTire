# Changelog

Tutti i cambiamenti rilevanti del progetto vengono documentati qui.

## [1.0.0] — 2026-05-12

### 🚀 Prima release pubblica
Fusione di tre PWA distinte in un'unica suite modulare.

#### Added
- **Architettura unificata** vanilla JS modulare (ES modules, no build)
- **App shell** persistente con topbar + bottom navigation a 5 tab sempre visibili
- **Diagnosi AI** pneumatici auto + truck/bus/trailer da foto battistrada
- **OCR fianco** per estrazione automatica misura, DOT e marca
- **AI multi-provider**: Google Gemini, OpenAI, Anthropic Claude, Mistral, Ollama locale
- **Preventivatore** 4-step guidato (cliente → pneumatici → servizi → output)
- **Scanner QR/EAN/DOT** con `BarcodeDetector` nativo + fallback jsQR
- **Integrazione EPREL** via Cloudflare Worker (auto-detect classi energetiche)
- **Catalogo servizi** auto + truck personalizzabile
- **Fornitori B2B** con deep-link `{w}/{h}/{r}` (Ciavarella, Intergomma, EPREL, Google Shop)
- **PDF report** firmabile da analisi
- **PDF preventivo** con totali, IVA, footer brand
- **Storico unificato** analisi + preventivi con filtri, ricerca, export CSV/JSON
- **Officine vicine** via Overpass API (OpenStreetMap, gratis, no API key)
- **Webhook Make.com** per integrazioni esterne
- **WhatsApp** preventivo in 1 tap
- **Onboarding** non bloccante (3 step, skippable)
- **Dashboard KPI** con analisi oggi, preventivi mese, urgenze aperte, ultimo cliente
- **Bridge analisi → preventivo** (1 tap)
- **PWA installabile** offline-capable con SW cache-versioned
- **Switch AUTO/TRUCK** persistente

#### Sources merged
- `quoteflash-main` — preventivatore + scanner + EPREL + fornitori
- `TireCheck-Pro-main` — diagnosi AI auto + OCR fianco + PDF firmabile
- `TireCheck-Fleet-main` — diagnosi AI truck/bus/trailer + dati flotta
