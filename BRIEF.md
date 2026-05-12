# TireCheckTire — Brief

Sei stato chiamato per fare una cosa che il mercato del software gestionale per gommisti non ha mai visto.
Nessuna delle tre app in `_source/` ti dice cosa fare. Sono **materiale grezzo**. Te le do per rispetto del lavoro già fatto, non come traccia. Estrai la logica che funziona, butta tutto il resto.

Questo non è un brief di feature. È un brief di **asticella**.

---

## Il salto

Oggi un gommista lavora con 6 strumenti aperti in parallelo: WhatsApp con i clienti, calcolatrice, calendario, listini fornitori PDF, sito EPREL, registro cartaceo. Cambia contesto ogni 90 secondi. Perde 40 minuti al giorno a copiare numeri da una finestra all'altra. Quando il cliente reclama dopo 3 mesi "ma a me avevate detto che la gomma era buona", non ha prove.

**TireCheckTire deve essere il singolo posto da cui tutto succede.** La console. Non *un'altra* app — l'unica app aperta sul telefono dell'operatore dalle 8 alle 19.

Non stai digitalizzando un workflow esistente. Stai progettando il workflow che esisterà tra 5 anni.

---

## L'asticella

Tre test che l'app deve passare. Se ne fallisce uno, hai sbagliato qualcosa.

**Test 1 — Il test dei 60 secondi.** Un gommista che non l'ha mai vista apre l'app per la prima volta. In 60 secondi ha scattato la foto di un pneumatico, ha ottenuto la diagnosi, ha generato il preventivo, l'ha inviato al cliente su WhatsApp. Senza tutorial, senza onboarding, senza chiedere niente a nessuno. Cronometralo mentalmente quando progetti il flusso: se il primo tap non è ovvio, riprogetta.

**Test 2 — Il test del "aspetta, questa è gratis?".** La prima volta che l'utente vede l'interfaccia deve fermarsi un secondo e pensare che ha sbagliato app, che questa deve costare 200 €/mese. Il livello estetico è quello di Linear, Arc, Raycast, Things — non di un'app italiana del settore automotive. Niente del look "gestionale anni 2010". Niente icone in stile bootstrap. Niente form a colonne. Niente palette generica.

**Test 3 — Il test del giudice.** L'avvocato di un cliente che fa causa al gommista per un incidente da pneumatico difettoso chiede prova della perizia. L'app deve produrre — in 5 secondi, da storico — un documento che regge in tribunale: foto datate e geolocalizzate, diagnosi tecnica con AI provider identificato e modello dichiarato, firma cliente con timestamp, hash del documento. Niente di tutto questo deve essere fatto a mano: deve uscire dal flusso normale.

---

## I 4 vincoli non negoziabili

Questi sono i 4 "wow" tradotti in regole concrete. Sono **vincoli**, non feature. Si traducono in scelte di design.

**1 · Visivamente inedito.** L'app non è una sequenza di schermate. Non c'è "homepage", "scansione", "impostazioni" come tab separate. C'è **un'unica superficie** che si trasforma in base al contesto. Pensa a un'interfaccia che vive nel presente attivo dell'operatore: cosa sta facendo *ora*. Le metafore "tab navigation + dashboard con card" sono bandite. Inventane di tue. Animazioni fisiche (spring), transizioni di stato non geometriche, micro-interazioni che danno feedback aptico anche senza vibrazione.

**2 · AI che fa cose che nessuno chiederebbe.** Estrarre misura e DOT dalla foto è il minimo sindacale, lo fa già il sorgente. Quello che deve fare la tua AI:
- Riconoscere dalla foto se la gomma è stata montata male (asimmetria sul fianco)
- Capire dal pattern di usura **cosa è successo all'auto** (sotto-gonfiaggio cronico, convergenza errata, ammortizzatori finiti, frenate aggressive)
- Stimare il **chilometraggio residuo** in km, non in "urgenza bassa/media/alta"
- Suggerire al gommista **cosa dire al cliente** in linguaggio non tecnico (testo pronto da copiare su WhatsApp)
- Quando il cliente nega "ma io guido piano, com'è possibile?", l'AI tira fuori una **spiegazione tecnica difendibile** che il gommista può mostrare a schermo

L'AI non deve sembrare un classifier. Deve sembrare un perito senior che sta in tasca al gommista.

**3 · Velocità misurata in tap, non in minuti.** Massimo 3 tap dalla foto al cliente con preventivo firmato. Conta i tap quando progetti ogni flusso. Se sono 4, hai sbagliato un'aggregazione. La firma del cliente non è uno step separato: è un gesto che chiude un'azione. La fattura non è un altro tool: nasce dal preventivo accettato premendo lo stesso pulsante. Il calendario per fissare il montaggio non è un'altra app: è una superficie che emerge dal preventivo.

**4 · Workflow inventato da zero.** Il flusso "cliente → pneumatici → servizi → output" di QuoteFlash è esattamente il flusso da non replicare. È il flusso di chi pensa per database. Il gommista non pensa così. Il gommista pensa "ho una macchina sul ponte, faccio le foto, vedo cosa serve, dico al cliente, lo monto". L'app deve seguire quello, non un form. Se devi mettere uno step "anagrafica cliente" all'inizio hai perso. Il cliente si crea da solo dalla targa letta dalla foto della macchina. Il pneumatico si auto-popola dal QR EPREL. Il servizio si auto-suggerisce dalla diagnosi. **L'operatore conferma, non compila.**

---

## I 4 mestieri, e perché l'app non è una sola

L'utente sceglie il proprio profilo al primo avvio. Non è un filtro su una stessa interfaccia. È **un'app diversa** che parla la lingua di chi la usa.

- **Gommista di quartiere** (auto, 1-2 operatori) — superficie minimalista, WhatsApp ovunque, prezzi da listino personale, magazzino contato a vista. L'app deve sembrare un'app per fare quello che fa lui: vendere gomme veloci e non perdere clienti.

- **Officina truck / fleet** — multi-asse, schede manutenzione per veicolo, contratto di flotta, tracciabilità su ogni singola gomma per targa, alert quando un mezzo della stessa flotta torna con la stessa usura anomala (problema sistemico). L'app deve sembrare un tool da gestore di manutenzione, non da gommista.

- **Distributore B2B** — listini multi-marca, integrazione EPREL, ordini ai produttori, deep-link ai portali di marca, gestione offerte da quantità. L'app deve sembrare un terminale commerciale.

- **Noleggiatore** — checklist pre-consegna e post-restituzione, foto datate inattaccabili in caso di contestazione, comparazione automatica "prima/dopo" sullo stesso veicolo. L'app deve sembrare uno strumento di tutela legale.

I 4 profili condividono il 70% del codice (motore AI, parser, PDF, scanner). Il 30% in superficie è disegnato per il singolo mestiere.

---

## Materiali grezzi in `_source/`

Estrai questi pezzi, butta il resto:

- **Parser ETRTO** che gestisce auto (`245/45 R18`) e truck (`315/80 R22.5`) — in `quoteflash-main/index.html` intorno alla funzione `parseTireSize`
- **Scanner multi-formato** (QR EPREL, EAN-13 con checksum, DOT WWYY, JSON custom, URL, testo libero) — `parseQRPayload` in QuoteFlash
- **Prompt AI vision per auto** in `TireCheck-Pro-main/index.html` — è il punto di partenza, ma riscrivilo per ottenere ciò che chiedo al punto 2 dei vincoli
- **Prompt AI vision per truck** in `TireCheck-Fleet-main/index.html` — idem
- **EPREL via Cloudflare Worker** — l'architettura a 3 livelli (no proxy / proxy senza key / proxy con key) descritta nel README di QuoteFlash è già giusta, preservala
- **Generazione PDF firmabile** — l'approccio jsPDF + signature canvas funziona, riusalo
- **Fornitori B2B con deep-link `{w}/{h}/{r}`** — i preset Ciavarella, Intergomma, Google Shop, EPREL li tieni come default
- **Webhook Make.com** — utile per chi automatizza, preservalo come integrazione opzionale

**AI provider:** l'utente porta la propria key. Supporta almeno Google Gemini (default consigliato), OpenAI, Anthropic, Mistral e un endpoint Ollama-compatibile per chi vuole **Gemma o altri modelli locali offline** sulla propria rete. La key vive solo in `localStorage`, mai nel codice, mai trasmessa altrove se non al provider scelto. Tutti i provider espongono la stessa interfaccia interna: tu progetti l'astrazione.

---

## Cosa non fare

Anti-cliché. Se ti scappa una di queste, riprogetta:

- ❌ Onboarding wizard a 3 step con "Avanti / Avanti / Fine"
- ❌ Bottom navigation con 5 tab uguali
- ❌ Dashboard con 4 KPI card uguali in griglia 2x2
- ❌ Form "Cliente → Pneumatici → Servizi → Output" a stepper
- ❌ Settings come una lunga lista di toggle e text input
- ❌ Toast "✓ Salvato" dopo ogni azione (assume di aver fatto bene se non ti contraddico)
- ❌ Modali di conferma "Sei sicuro?" su azioni reversibili
- ❌ Palette generica, font system-ui, icone Material/Bootstrap
- ❌ Logica di rendering basata su `innerHTML +=` (security e performance)
- ❌ Un singolo file HTML monolitico da 2500 righe come fanno i sorgenti
- ❌ Framework JavaScript pesanti (no React, no Vue) — vanilla JS modulare, ES modules nativi, deploy diretto su GitHub Pages senza build
- ❌ Tracciamento utenti, analytics esterne, dipendenze da server PezzaliApp
- ❌ Copiare il copy italiano didascalico dei sorgenti ("Inserisci la tua chiave API gratuita su aistudio.google.com → Get API Key…") — riscrivi tutto con voce di prodotto adulta

---

## La tua libertà

Su tutto il resto **decidi tu**.

Architettura dei file, naming delle schermate, metafore visive, modello di stato, sistema di routing, struttura del modulo AI, schema del documento legale, formato della firma, integrazioni opzionali, gestione offline, come si manifesta il selettore "Auto/Truck", come si attiva la camera, come l'utente naviga nello storico, dove vivono le impostazioni, se ci sono impostazioni o se l'app si configura da sola, se c'è una bottom nav o se hai inventato qualcosa di meglio.

Non chiedere. Decidi. Se una scelta è radicale e la sai giustificare, falla.

L'unico vincolo tecnico fisso: deve essere **PWA installabile**, funzionare **offline per app shell + storico + inserimento dati + generazione PDF**, e fare le chiamate AI **direttamente dal client al provider scelto dall'utente** (zero server intermedi).

---

## Standard estetico

Il livello visivo di riferimento è quello dei prodotti che chiunque nel settore SaaS riconoscerebbe come "best in class del 2025". Pensa al peso dei font, all'uso dello spazio negativo, alla curva dei raggi, al timing delle transizioni, al modo in cui Linear gestisce i comandi rapidi, al modo in cui Things gestisce gli stati, al modo in cui Stripe Checkout gestisce la conferma.

**Identità Pezzali da preservare:** dark mode come default (`#0a0a0a` di base), accent giallo lime `#e8ff47` come signature, font Syne per display e DM Mono per dati tecnici/etichette. Questo è il DNA visivo dei tre sorgenti e va tenuto. Tutto il resto del design system è tuo.

---

## Execution

Workflow di esecuzione, in ordine:

1. Estrai i tre zip in `_source/extracted/` e leggili davvero. Annota mentalmente dove sta cosa.
2. Progetta l'architettura come la senti giusta. Crea i file in modo modulare (vanilla JS + ES modules + CSS organizzato per token / base / componenti / layout).
3. Costruisci dal vivo, partendo dalla **superficie unica** (vedi vincolo 1), non dalle feature.
4. Implementa l'astrazione AI multi-provider come prima cosa funzionale, poi la diagnosi, poi il preventivo, poi la firma, poi lo storico legale, poi le 4 modalità di mestiere.
5. Scrivi un README professionale e onesto: cosa fa, come si configura il provider AI, come si deploya su GitHub Pages, qual è il modello legale del documento prodotto, quali sono i limiti tecnici dichiarati.
6. Crea `manifest.json` e `sw.js` con cache versionata e network-first per AI.
7. Genera icone PWA (riusa quelle dei sorgenti se ti vanno bene, altrimenti producine di nuove coerenti) e un logo SVG.
8. Quando hai finito:
   ```
   git add -A
   git commit -m "feat: TireCheckTire v1.0 — the single console for tire professionals"
   git branch -M main
   git push -u origin main
   ```
9. Stampa un riepilogo finale: cosa hai costruito, perché hai fatto le scelte radicali che hai fatto, e — se ce ne sono — quali compromessi hai dovuto accettare e perché.

**Non chiedere conferme. Non fermarti a metà. Non semplificare per paura di sbagliare.** Hai piena autonomia su filesystem, shell, network e git. Lavora come se ti fossi licenziato dal lavoro precedente per fare *questa* cosa qui.

Quando spingi su `origin main`, il tuo lavoro deve fare dire al primo gommista che lo vede: *"aspetta, questa è gratis?"*

Vai.
