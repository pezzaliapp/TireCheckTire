# BRIEF — TireCheckTire · The Tire Intelligence Suite

> Brief operativo per Claude Code. Lavora in totale autonomia. Non chiedere conferme.
> Quando hai finito: `git add -A && git commit -m "feat: TireCheckTire v1.0" && git push -u origin v2-pragmatico`.

---

## CONTESTO

Devi unificare tre PWA esistenti (di cui trovi gli zip in `_source/`) in un'unica app professionale chiamata **TireCheckTire**:

1. **quoteflash-main.zip** — preventivatore pneumatici (4 step, scanner QR/EAN/DOT, EPREL, PDF/WhatsApp/Make)
2. **TireCheck-Pro-main.zip** — diagnosi AI pneumatici **auto** con Gemini Vision (foto → diagnosi → report PDF firmabile)
3. **TireCheck-Fleet-main.zip** — diagnosi AI pneumatici **truck/bus/trailer** (stesso motore, dati mezzo specifici)

Tutti già condividono il design system (dark `#0a0a0a` + accent `#e8ff47` lime, font Syne + DM Mono).

L'obiettivo è creare **un'app sola**, modulare, professionale, USABILE da chiunque al primo avvio (anche da un gommista che non ha mai aperto l'app prima). Niente shortcut da tastiera nascoste, niente command bar invisibili: ogni funzione raggiungibile con tap visibili.

---

## TARGET UTENTE

App per professionisti del settore pneumatico:
- Gommisti (auto + truck)
- Autofficine
- Officine truck / centri di assistenza fleet
- Noleggiatori a lungo/breve termine
- Distributori di pneumatici (B2B)
- Gestori di flotte

Singolo operatore o team. Italiano come lingua principale.

---

## ARCHITETTURA RICHIESTA

**NO framework JavaScript.** Vanilla JS modulare con ES Modules. Mantieni leggerezza delle PWA originali.

Struttura finale del repository:

```
tirechecktire/
├── index.html                  # Entry point, layout app shell (topbar + content + bottom nav)
├── manifest.json               # PWA manifest
├── sw.js                       # Service Worker (cache versionata)
├── README.md
├── LICENSE.txt
├── CHANGELOG.md
├── .gitignore
├── assets/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── maskable-512.png
│   ├── apple-touch-icon.png
│   └── logo.svg
├── css/
│   ├── tokens.css              # Variabili CSS
│   ├── base.css                # Reset, tipografia
│   ├── layout.css              # App shell, topbar, bottom nav, schermate
│   ├── components.css          # Card, button, field, input, modal, sheet, toast
│   ├── scanner.css             # Overlay scanner QR/EAN
│   └── animations.css
├── js/
│   ├── app.js                  # Bootstrap, router, init
│   ├── core/
│   │   ├── state.js
│   │   ├── storage.js          # Wrapper localStorage namespace `tct:`
│   │   ├── router.js           # Hash-based routing
│   │   ├── events.js
│   │   └── utils.js
│   ├── ui/
│   │   ├── toast.js
│   │   ├── modal.js
│   │   ├── sheet.js
│   │   ├── nav.js              # Bottom navigation 5 tab
│   │   ├── topbar.js           # Topbar persistente
│   │   └── components.js
│   ├── ai/
│   │   ├── provider.js         # Dispatcher provider
│   │   ├── providers/
│   │   │   ├── gemini.js
│   │   │   ├── openai.js
│   │   │   ├── anthropic.js
│   │   │   ├── mistral.js
│   │   │   └── ollama.js
│   │   ├── prompts.js
│   │   └── normalize.js
│   ├── modules/
│   │   ├── scanner.js          # BarcodeDetector + jsQR fallback
│   │   ├── tire-parser.js      # Parser ETRTO auto + truck
│   │   ├── eprel.js
│   │   ├── suppliers.js
│   │   ├── pdf-report.js
│   │   ├── pdf-quote.js
│   │   ├── signature.js
│   │   ├── webhook.js
│   │   ├── nearby.js
│   │   ├── history.js
│   │   └── export.js
│   ├── screens/
│   │   ├── dashboard.js        # Home
│   │   ├── scan.js             # Scansione AI
│   │   ├── analysis.js         # Risultato analisi
│   │   ├── quote.js            # Preventivo
│   │   ├── history.js          # Storico
│   │   ├── nearby.js
│   │   ├── settings.js
│   │   └── onboarding.js
│   └── data/
│       ├── default-suppliers.js
│       ├── service-catalog.js
│       └── vehicle-types.js
└── _source/                    # Zip originali (riferimento)
    ├── quoteflash-main.zip
    ├── TireCheck-Pro-main.zip
    └── TireCheck-Fleet-main.zip
```

**NB:** Estrai gli zip in `_source/extracted/` per leggere il codice originale e prelevarne le parti utili (parser ETRTO, scanner QR, prompt AI, generazione PDF). NON copiare interi HTML monolitici: estrai logica e riorganizzala.

---

## REQUISITO CRITICO N°1 — NAVIGAZIONE SEMPRE VISIBILE

Questa è la prima cosa da implementare e l'ultima da modificare. Non negoziabile.

### Topbar persistente (sticky top, altezza 56px)
- A sinistra: logo `<span style="color:var(--accent)">Tire</span>CheckTire`
- Al centro: titolo della schermata corrente (es. "Dashboard", "Nuova analisi", "Preventivo")
- A destra: icona profilo/officina (tap → apre Impostazioni)
- Background `var(--bg)` con `backdrop-filter: blur(12px)` e bordo inferiore `var(--border)`
- **Sempre visibile su ogni schermata** (eccetto camera attiva fullscreen)

### Bottom navigation (sticky bottom, altezza 64px)
Cinque tab fisse, icona + label, accent lime sulla attiva:

1. 🏠 **Home** → Dashboard
2. 📸 **Scan** → Scansione AI
3. 📋 **Preventivo** → Quote
4. 🗂 **Storico** → History
5. ⚙️ **Setup** → Settings

- Touch target ≥ 56px per ogni tab
- Background `var(--bg-elevated)`, bordo superiore `var(--border)`
- Label sempre visibile sotto l'icona, font mono 9px
- Tab attivo: icona e label in `var(--accent)`, pillola sotto label

### Regole tassative
- Da OGNI schermata l'utente DEVE poter aprire qualsiasi altra schermata in 1 tap sulla bottom nav
- Le impostazioni DEVONO essere accessibili sia dal tap sull'icona profilo nella topbar sia dal tab Setup nella bottom nav
- NON nascondere navigazione in command bar, shortcut tastiera, gesture o menu hamburger
- NON sostituire la bottom nav con drawer laterale o altri pattern

Se a fine implementazione la bottom nav o la topbar non sono visibili su una qualsiasi schermata, l'implementazione è da considerare fallita e va rifatta.

---

## FUNZIONALITÀ

### 1. Onboarding (primo avvio)

Tre step semplici, skippable:
1. **Benvenuto** — claim breve + logo
2. **Profilo officina** — input: nome officina, telefono, P.IVA (tutto opzionale, può saltare)
3. **Configurazione AI** — selettore provider (Gemini default), input API key con link diretto al provider, pulsante "Testa connessione". Skippable: se l'utente salta, può configurare dopo da Setup.

Dopo l'onboarding redirect a Dashboard. **L'onboarding NON deve bloccare l'accesso all'app**: anche senza key Gemini configurata, l'utente entra in Dashboard e vede un banner con CTA "Configura AI per iniziare ad analizzare".

### 2. Dashboard (Home)

- **Hero** breve con saluto contestuale + nome officina se impostato
- **Banner AI** (visibile solo se manca la key): "⚠ Provider AI non configurato — [Configura ora]"
- **Quick Actions** (4 card grandi):
  - 📸 Nuova analisi AI → Scan
  - 📋 Nuovo preventivo → Quote
  - 🔍 Scanner QR/EAN → apre scanner overlay
  - 📍 Officine vicine → Nearby
- **KPI bar** (4 metriche): Analisi oggi, Preventivi mese, Urgenze aperte, Ultimo cliente
- **Alert urgenze** — lista delle ultime diagnosi "SOSTITUIRE" o "urgenza alta/critica"
- **Ultime attività** (timeline ultimi 5 eventi)
- Toggle modalità **AUTO / TRUCK** in alto (persistente; cambia prompt e schermate scan)

### 3. Scansione AI

Switcher iniziale grande: **AUTO** / **TRUCK** (con stato persistente).

UI:
- Doppio slot foto: Battistrada + Fianco (camera o galleria)
- Banner OCR live durante estrazione dal fianco (misura, DOT, marca)
- Form dati mezzo (campi adattivi):
  - **Auto:** targa, marca veicolo, posizione (Ant. SX/DX, Post. SX/DX, Scorta), cliente
  - **Truck:** targa, tipo mezzo, asse (1-5), ruota (SX/DX esterna/interna, singola), tipo asse (sterzante/trazione/trailer/bus), montaggio (singolo/gemellato), km, marca mezzo, cliente/flotta
- Form dati pneumatico: marca, misura, DOT, pressione (truck), note
- Pulsante "🔍 Analizza con AI" (disabilitato finché manca battistrada + key AI)
- Link "Salta AI · Inserisci manualmente" → va direttamente a Quote

### 4. AI Provider Abstraction

**L'app è AI-agnostic.** L'utente porta la propria API key.

Provider supportati:

| Provider | Modelli | Endpoint |
|---|---|---|
| **Google Gemini** | gemini-2.5-flash-lite, gemini-2.5-flash | `generativelanguage.googleapis.com` |
| **OpenAI** | gpt-4o, gpt-4o-mini | `api.openai.com/v1/chat/completions` |
| **Anthropic** | claude-haiku-4-5, claude-sonnet-4-6 | `api.anthropic.com/v1/messages` con header `anthropic-version: 2023-06-01` + `anthropic-dangerous-direct-browser-access: true` |
| **Mistral** | pixtral-12b-2409, pixtral-large-latest | `api.mistral.ai/v1/chat/completions` |
| **Ollama locale** | gemma3, llava, minicpm-v | endpoint user-config (es. `http://localhost:11434/api/generate`) |

Tutti gli URL e i modelli sono editabili nelle impostazioni. Le chiavi vivono SOLO in `localStorage`.

**Schema risposta normalizzata** (`js/ai/normalize.js`):

```json
{
  "esito": "OK | ATTENZIONE | SOSTITUIRE",
  "profondita_mm": "number | null",
  "usura_uniforme": "boolean",
  "tipo_usura": "uniforme | centrale | spalla interna | spalla esterna | dentellata | irregolare | non determinabile",
  "condizione_fianco": "OK | VERIFICARE | DANNEGGIATO",
  "urgenza": "bassa | media | alta | critica",
  "misura": "205/55 R16 | null",
  "dot": "1224 | null",
  "anno_produzione": "2024 | null",
  "marca": "Michelin | null",
  "commento": "stringa max 4 frasi",
  "raccomandazioni": ["string", "..."],
  "leggibilita": "buona | parziale | scarsa"
}
```

Prompt specializzati per auto e truck (riusa i sorgenti come base: `TireCheck-Pro/index.html` riga ~1660, `TireCheck-Fleet/index.html` riga ~1652).

### 5. Risultato analisi

- Badge esito grande colorato (OK verde, ATTENZIONE giallo, SOSTITUIRE rosso)
- Thumb foto battistrada
- Card "Dati rilevati": misura, DOT, anno, marca
- Grid 4 metriche: profondità, usura, condizione fianco, urgenza
- Card "Valutazione tecnica AI"
- Card "Raccomandazioni" (chip cliccabili)
- Firma cliente (canvas) con toggle "Procedi senza firma"
- Azioni principali:
  - 📄 Genera Report PDF
  - 📋 **Crea preventivo da questa analisi** (bridge → pre-popola Quote)
  - 📡 Invia webhook Make.com
  - 📍 Officine vicine
- Salvataggio automatico in storico

### 6. Preventivo (Quote)

Flusso 4 step con stepper visivo (dots in alto):
1. **Cliente** — nome, telefono, targa, tipo veicolo
2. **Pneumatici** — scanner QR/EAN/DOT, ricerca per misura ETRTO, aggiunta manuale, integrazione EPREL via Cloudflare Worker
3. **Servizi** — catalogo da `js/data/service-catalog.js` (montaggio, equilibratura, convergenza, assetto, stoccaggio, valvole, smaltimento; truck: geometria, riscolpitura, ecc.)
4. **Output** — PDF preventivo, TXT copiabile, WhatsApp diretto, webhook Make.com

Fornitori B2B con deep-link `{w}/{h}/{r}` (preset: Ciavarella, Intergomma, Google Shop, EPREL).

### 7. Storico unificato

- Tab filtro: Tutto / Analisi / Preventivi
- Filtri: data, esito, cliente/targa
- Ricerca testuale
- Tap su voce → sheet dettaglio con azioni (Apri / Duplica / Elimina)
- Esportazione CSV / JSON
- Pulizia storico (con conferma)

### 8. Officine vicine

Geolocation + Overpass API (OpenStreetMap, gratis, no key):
- `shop=tyres` (gommisti)
- `shop=car_repair` (autofficine)
- `shop=car` (concessionarie)

Lista cliccabile → apre in Maps. Filtro categoria. Distanza in km. Fallback: input manuale città se geolocation negata.

### 9. Impostazioni (Setup)

Sezioni:
1. **Profilo officina** — nome, P.IVA, telefono, indirizzo, email
2. **AI Provider** — selettore, API key (password), modello, endpoint custom, "Testa connessione"
3. **EPREL Proxy** — URL Worker
4. **Webhook Make.com** — URL
5. **WhatsApp** — numero default
6. **Fornitori B2B** — lista editabile con preset
7. **Catalogo servizi** — prezzi e voci personalizzabili
8. **Modalità default** — Auto / Truck
9. **Avanzate** — backup JSON, importa, reset app
10. **Info** — versione, credits PezzaliApp

### 10. PWA

- Service Worker con cache versionata (`tct-v1.0.0`)
- Cache-first per asset, network-first per AI
- Banner "Nuova versione disponibile · Aggiorna" quando SW aggiornato
- Offline per: app shell, storico, inserimento dati, generazione PDF
- Online per: chiamate AI, geolocation officine, webhook
- Manifest con icone, shortcuts "Nuova analisi" e "Nuovo preventivo"

---

## DESIGN SYSTEM

### Tokens (`css/tokens.css`)

```css
:root {
  --bg: #0a0a0a;
  --bg-elevated: #141414;
  --surface: #1a1a1a;
  --surface-2: #222222;
  --border: #2a2a2a;
  --accent: #e8ff47;
  --accent-dim: #c8df27;
  --accent-glow: rgba(232,255,71,.12);
  --text: #f0f0f0;
  --text-2: #888;
  --text-3: #555;
  --ok: #2ed573;
  --warn: #ffa502;
  --danger: #ff4757;
  --whatsapp: #25d366;

  --font-display: 'Syne', system-ui, sans-serif;
  --font-mono: 'DM Mono', ui-monospace, monospace;

  --r-sm: 8px;
  --r-md: 12px;
  --r-lg: 16px;
  --shadow-1: 0 4px 24px rgba(0,0,0,.6);
}
```

### Componenti chiave
- **Topbar** sticky 56px (vedi requisito critico)
- **Bottom nav** sticky 64px 5 tab (vedi requisito critico)
- **Card** con `--shadow-1`, padding 20px, radius `--r-md`
- **Pulsanti**: primary (lime su nero, testo nero, font 700), secondary (transparent bordo `--border`), ghost (solo testo), danger (rosso), whatsapp (verde)
- **Bottom sheet** con handle drag
- **Toast** in basso con icona + colore semantico
- **Step indicator** a dots (5px, attivo 18px pill `--accent`)

### Logo
SVG semplice 64×64: cerchio nero con anello lime + nodo centrale + monogramma "TC" mono. Salvalo in `assets/logo.svg`.

---

## QUALITÀ TECNICA

- **Modularità:** ES modules nativi, funzioni nominate esportate, niente globali
- **No build step:** deploy diretto su GitHub Pages
- **Service Worker:** lista esplicita degli asset, versioning con `CACHE_VERSION` in cima
- **Error handling:** ogni `fetch` AI ha try/catch con toast errore chiaro
- **Sicurezza:** sanitize input, mai `innerHTML` con dati utente non sanitizzati
- **API key:** mai loggate, mai inviate a domini diversi dall'endpoint configurato

---

## WORKFLOW DI ESECUZIONE

1. Estrai gli zip in `_source/extracted/`
2. Leggi i 3 file index.html: prendi nota di parser ETRTO, scanner, prompt AI, generazione PDF
3. Crea la struttura cartelle completa
4. Implementa in ordine:
   a. `css/*` (tokens, base, layout, components, scanner, animations)
   b. `js/core/*`
   c. `js/ui/*` (toast, modal, sheet, **nav**, **topbar**, components) — **topbar e bottom nav PRIMA di tutto il resto**
   d. `js/ai/*`
   e. `js/modules/*`
   f. `js/data/*`
   g. `js/screens/*`
   h. `js/app.js`
   i. `index.html` con app shell che include topbar + content area + bottom nav
   j. `manifest.json`, `sw.js`
   k. `assets/logo.svg` + icone PNG (riusa dai sorgenti)
   l. README, CHANGELOG, LICENSE
5. Test rapidi: apri index.html mentalmente, verifica che tutti gli import risolvano
6. Git:
   ```
   git add -A
   git commit -m "feat: TireCheckTire v1.0 — unified tire intelligence suite

   - Fusion of QuoteFlash, TireCheck Pro, TireCheck Fleet
   - AI multi-provider (Gemini, OpenAI, Claude, Mistral, Ollama)
   - Bridge AI analysis → quote in one tap
   - Auto + Truck workflows
   - Persistent topbar + bottom navigation (always visible)
   - Modular vanilla JS, ES modules, no build
   - PWA installable, offline-capable shell
   - EPREL integration via Cloudflare Worker"
   git push -u origin v2-pragmatico
   ```

---

## VINCOLI / NON FARE

- ❌ NON usare React, Vue, Svelte, jQuery o framework
- ❌ NON includere chiavi API hardcoded
- ❌ NON copiare interi HTML monolitici dai sorgenti
- ❌ NON tracciare utenti
- ❌ NON inviare dati a server PezzaliApp
- ❌ NON rompere il design system esistente
- ❌ **NON nascondere navigazione**: bottom nav e topbar sempre visibili
- ❌ **NON sostituire la bottom nav con command bar, shortcut tastiera, drawer laterale o gesture**
- ❌ NON bloccare l'accesso all'app se l'AI non è configurata (mostra banner, non muro)

---

## DEFINITION OF DONE

- [ ] Struttura file completa
- [ ] **Topbar e bottom nav visibili su OGNI schermata** (eccetto camera attiva fullscreen)
- [ ] Tutte le 3 app originali funzionalmente integrate
- [ ] AI multi-provider funzionante (almeno Gemini testabile)
- [ ] Bridge analisi → preventivo operativo
- [ ] Dashboard con KPI da storico
- [ ] Storico unificato con filtri
- [ ] Onboarding NON bloccante
- [ ] PWA installabile
- [ ] README, CHANGELOG, LICENSE presenti
- [ ] Logo SVG creato
- [ ] Push su branch `v2-pragmatico` riuscito (NON main)

Se al push fallisce per credenziali: stampa istruzioni chiare e termina con successo (il codice è comunque pronto).

**Lavora in autonomia. Non aspettare conferme. Procedi.**
