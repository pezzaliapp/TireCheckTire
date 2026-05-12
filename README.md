# TireCheckTire

> Un'unica superficie. Foto, perizia AI, preventivo firmato, documento legale — in tre tap.

TireCheckTire è la console del gommista. Non un'app fra le altre: l'unica app aperta sul telefono dell'operatore dalle 8 alle 19. È pensata per quattro mestieri diversi (gommista di quartiere, officina fleet, distributore B2B, noleggiatore) e si trasforma per parlare la lingua di chi la usa.

PWA installabile, vanilla JS, zero build, zero server intermedi. La chiave del provider AI sta solo nel `localStorage` del telefono del gommista. Le chiamate vanno dirette al provider scelto.

---

## L'asticella

Tre test che l'app deve passare:

1. **60 secondi.** Un gommista che non l'ha mai vista apre l'app per la prima volta, sceglie il profilo, scatta una foto, ottiene la diagnosi, condivide il preventivo. Senza tutorial.
2. **"Aspetta, questa è gratis?"** Linear, Things, Stripe Checkout. Niente look anni 2010, niente bottom-nav a 5 tab, niente form a stepper.
3. **Il giudice.** Il PDF prodotto include foto datate e geolocalizzate, hash di ogni scatto, AI provider e modello dichiarati, firma cliente con timestamp e hash. È un documento difendibile, non un riepilogo carino.

---

## Cosa fa la perizia AI

L'AI non è un classifier che dice "battistrada al 30%". È un perito senior in tasca al gommista. Ogni diagnosi restituisce:

- **Verdict** (`ok` / `watch` / `replace`) con commento tecnico in italiano.
- **Profondità mm** e **chilometraggio residuo stimato in km** (non in "urgenza bassa/media/alta").
- **Pattern di usura**: uniforme, centrale, spalla, dentellata, a piuma, a coppe.
- **Cause radice probabili** con livello di confidenza: sotto-gonfiaggio cronico, convergenza fuori specifica, ammortizzatori finiti, frenate aggressive, errore di montaggio.
- **Spiegazione per il cliente** in linguaggio non tecnico, pronta da copiare su WhatsApp.
- **Spiegazione tecnica difendibile** da mostrare a schermo quando il cliente protesta.
- **Difetti di montaggio** rilevati dalla foto (asimmetria sul fianco, rotazione errata).

Tutto in un unico schema JSON, identico per ogni provider.

---

## Architettura

```
TireCheckTire/
├── index.html          Single shell, no build, ES modules
├── manifest.json       PWA manifest
├── sw.js               Service worker (versioned cache, network-only per AI/EPREL)
├── styles/             Token layer, CSS senza framework
│   ├── tokens.css      Colori, type scale, motion curves
│   ├── base.css        Reset
│   ├── surface.css     La superficie morphing
│   ├── camera.css      Capture
│   ├── diagnosis.css   Esito perizia
│   ├── document.css    Composizione preventivo
│   ├── signature.css   Pad firma
│   ├── command.css     Spotlight + sheet
│   └── history.css     Vault legale
├── src/
│   ├── main.js         Entry, bootstrap, SW registration
│   ├── core/
│   │   ├── state.js    Store reattivo minimale + localStorage
│   │   ├── job.js      L'unità atomica (un veicolo sul ponte)
│   │   ├── db.js       IndexedDB (jobs, events, kv)
│   │   ├── hash.js     SHA-256, canonicalize, shortHash
│   │   ├── geo.js      Geolocation opt-in
│   │   ├── id.js       ULID (sortable, no deps)
│   │   └── format.js   Currency, dates, plates
│   ├── ai/
│   │   ├── providers.js  Registry e interfaccia comune
│   │   ├── prompts.js    Contratto JSON + builder
│   │   ├── gemini.js     Google Gemini (default)
│   │   ├── openai.js     OpenAI
│   │   ├── anthropic.js  Anthropic Claude
│   │   ├── mistral.js    Mistral
│   │   └── ollama.js     Ollama-compatibile (Gemma, LLaVA, Qwen-VL su LAN)
│   ├── parsers/
│   │   ├── etrto.js      245/45 R18 e 315/80 R22.5
│   │   └── qr.js         EPREL, EAN-13, DOT, JSON, URL, testo
│   ├── data/
│   │   ├── profiles.js   I 4 mestieri
│   │   ├── services.js   Catalogo servizi default
│   │   └── suppliers.js  Deep-link B2B {w}/{h}/{r}
│   ├── ui/
│   │   ├── dom.js        Helpers (html tagged template + raw)
│   │   ├── icons.js      SVG inline, 24×24
│   │   ├── stage.js      State machine delle scene
│   │   ├── bay.js        La superficie idle
│   │   ├── camera.js     Capture (getUserMedia + file fallback)
│   │   ├── diagnose.js   Rendering perizia
│   │   ├── quote.js      Composizione preventivo
│   │   ├── signature.js  Pad firma + hash + GPS
│   │   ├── vault.js      Storico
│   │   ├── entry.js      Dettaglio entry archiviata
│   │   ├── share.js      WhatsApp, PDF, webhook
│   │   ├── command.js    Command bar (⌘K, "/")
│   │   ├── sheet.js      Bottom sheets generici + line editor
│   │   ├── settings.js   Provider, officina, IVA, EPREL
│   │   └── intro.js      First-run profile picker
│   └── legal/
│       └── pdf.js        Generazione PDF firmabile, hash su footer
└── icons/
    ├── logo.svg
    ├── icon-192.png
    ├── icon-512.png
    └── maskable-512.png
```

---

## Provider AI · porta la tua chiave

L'utente porta la chiave. Vive solo nel `localStorage` del browser. Non viene mai trasmessa da nessun'altra parte tranne il provider scelto.

| Provider | Default model | Note |
|---|---|---|
| **Gemini** (consigliato) | `gemini-2.5-flash` | Vision rapida, CORS aperto, free tier su aistudio.google.com |
| **OpenAI** | `gpt-4.1-mini` | Vision OK, alcuni browser bloccano CORS — preferire backend proxy |
| **Anthropic Claude** | `claude-sonnet-4-6` | Browser-direct attivato via header `anthropic-dangerous-direct-browser-access` |
| **Mistral** | `pixtral-large-latest` | Vision via `image_url` |
| **Ollama / locale** | `gemma3:4b` | Endpoint LAN — es. `http://192.168.1.20:11434`. Imposta `OLLAMA_ORIGINS=*` lato server |

Cambiare provider è una tendina nelle impostazioni. Cambia il modello senza toccare il codice.

---

## Documento legale

Ogni preventivo firmato diventa un PDF che produce, in 5 secondi dal flusso normale:

- **Foto allegate** con data, ora, coordinate GPS (se concesse) e hash SHA-256.
- **Perizia AI** con provider e modello dichiarati, timestamp, latenza, esito.
- **Riepilogo** voci e totali con IVA.
- **Firma cliente** raster + hash SHA-256, timestamp ISO 8601, GPS.
- **Hash documento** in footer su ogni pagina — verificabile su qualunque copia.

Il documento non è una blockchain. È un atto privato firmato. Pesa quanto pesa la combinazione di prove allegate. La forza è che tutto deriva dal flusso normale: il gommista non deve fare nulla in più.

---

## Cosa funziona offline

- App shell intera (HTML, CSS, JS, font, icone).
- Lo storico (IndexedDB).
- Inserimento dati, composizione preventivo, firma, generazione PDF.

Cosa **non** funziona offline:

- La chiamata AI (è un servizio cloud, salvo Ollama in LAN).
- L'integrazione EPREL (proxy o pagina UE).

Quando torna la connessione, l'app si comporta come una qualunque PWA online: nessuna sincronizzazione esplicita, perché lo storico vive in locale.

---

## Setup

Aprire `index.html` su un server qualunque. Per testare in locale:

```bash
python3 -m http.server 8080
```

Visitare `http://localhost:8080`. Al primo avvio l'app chiede di scegliere il profilo. Poi serve incollare la chiave del provider AI nelle impostazioni (⌘K → "Provider AI", oppure tap sulla rotella in alto a destra).

### Deploy su GitHub Pages

```bash
git push origin main
```

Settings → Pages → Source: `main` / `/`. L'app è interamente statica.

---

## EPREL · proxy opzionale

L'integrazione EPREL UE 2020/740 ha tre livelli, come da progetto originale:

1. **Solo link** (default) — scan QR → l'app apre la pagina EPREL ufficiale.
2. **Proxy senza API key** — Cloudflare Worker che estrae dati dal PDF pubblico EPREL.
3. **Proxy con API key ufficiale** — il Worker ha `EPREL_API_KEY` come Secret.

Per livelli 2 e 3 incolla l'URL del Worker (`https://…workers.dev/?id={id}`) nelle impostazioni. La key sta **solo** sul Worker, mai nella PWA.

---

## Webhook Make.com

Opzionale. Imposta l'URL nelle impostazioni. Al click "Webhook" dal pannello Condividi, viene inviato un POST con l'intero job in JSON.

---

## Cosa è radicalmente diverso dai sorgenti

- **Una sola superficie**, non più 4 step a stepper. La scena si trasforma in funzione di cosa sta facendo l'operatore.
- **L'AI ha una voce.** Non più "esito: ATTENZIONE, profondità 4mm". Tira fuori cause probabili, km residui in chilometri, frase per il cliente, paragrafo difendibile in tribunale.
- **Multi-provider** dal primo giorno: Gemini, OpenAI, Anthropic, Mistral, Ollama LAN.
- **Vault legale**: ogni firma è anchored con hash, GPS, timestamp. Il PDF regge.
- **Niente toast "✓ Salvato"**. L'app fa il suo lavoro silenziosamente.
- **Suggerimenti reattivi** sul preventivo: se la diagnosi dice "spalla esterna usurata", la convergenza compare come riga *suggerita* — un tap e diventa una voce.

---

## Limiti dichiarati

- Per **OpenAI** le call browser-direct sono soggette a CORS variabile per chiave/regione. Se non funziona, conviene Gemini.
- L'**OCR della targa** non è ancora un flusso separato — la targa si scrive nello strip cliente (auto-completata da scatto "targa" via prompt AI in roadmap).
- I **fornitori B2B** sono deep-link template ({w}/{h}/{r}). Niente sync prezzi reali (servirebbe un backend per ciascuno).
- L'app fa la **diagnosi** dalla foto del battistrada. Le diagnosi multi-pneumatico per veicolo (4+ analisi correlate) sono nel roadmap.

---

## Identità

Dark mode, accent `#e8ff47`, Syne per il display, DM Mono per i dati tecnici. Questo è il DNA visivo di PezzaliApp che è giusto tenere — tutto il resto del design system è inedito.

---

## Licenza

MIT.

—

Costruito come fosse l'unica cosa che fai.
