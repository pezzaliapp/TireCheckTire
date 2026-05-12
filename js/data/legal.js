// Disclaimer / terms of use. Versioned: if changed in a meaningful way, bump
// TERMS_VERSION so existing users are prompted to re-accept on next launch.

export const TERMS_VERSION = '1.0';
export const TERMS_DATE = 'maggio 2026';

export const TERMS_SHORT =
  'TireCheckTire è uno strumento di ausilio tecnico fornito "così com\'è". ' +
  'Le diagnosi AI hanno valore indicativo e devono essere verificate manualmente ' +
  'dall\'operatore. L\'utente è responsabile dei dati inseriti, dei costi di terze parti ' +
  '(provider AI, ecc.) e dei backup dei propri dati.';

// Sections rendered in order. Each section: { title, body } where body is plain
// text with paragraph breaks via \n\n.
export const TERMS_SECTIONS = [
  {
    title: '1. Natura del servizio',
    body:
      'TireCheckTire è un\'applicazione web (Progressive Web App) fornita "AS IS" ' +
      '("così com\'è"), senza garanzie di alcun tipo, espresse o implicite, ' +
      'comprese — senza limitazione — le garanzie di commerciabilità, idoneità a ' +
      'uno scopo particolare e non violazione di diritti di terzi.\n\n' +
      'L\'app è un AUSILIO TECNICO destinato a operatori professionali del settore ' +
      'pneumatico (gommisti, autofficine, fleet manager, distributori B2B). Non ' +
      'sostituisce in alcun modo l\'ispezione visiva e il giudizio professionale ' +
      'dell\'operatore.',
  },
  {
    title: '2. Diagnosi AI · valore indicativo',
    body:
      'Le analisi automatiche generate dall\'intelligenza artificiale (Google ' +
      'Gemini, OpenAI, Anthropic Claude, Mistral, Ollama o altro provider ' +
      'configurato dall\'utente) sono di NATURA INDICATIVA e si basano su modelli ' +
      'statistici che possono produrre errori, falsi positivi o falsi negativi.\n\n' +
      'L\'utente DEVE sempre verificare manualmente lo stato del pneumatico prima ' +
      'di prendere decisioni operative, di sicurezza o commerciali. Le diagnosi ' +
      'prodotte NON costituiscono perizia tecnica, omologazione né certificazione, ' +
      'e non sostituiscono i controlli previsti dalla normativa vigente in materia ' +
      'di sicurezza dei veicoli.',
  },
  {
    title: '3. Inserimento dati · responsabilità dell\'utente',
    body:
      'L\'inserimento di targhe, misure ETRTO, codici DOT, prezzi, dati cliente, ' +
      'dati di flotta e qualsiasi altro contenuto è di ESCLUSIVA RESPONSABILITÀ ' +
      'DELL\'UTENTE.\n\n' +
      'PezzaliApp non risponde di errori di trascrizione, dati incompleti, errati o ' +
      'non aggiornati, né delle conseguenze (economiche, contrattuali, legali, ' +
      'tributarie, fiscali) derivanti da preventivi, report o documenti generati a ' +
      'partire da dati errati.',
  },
  {
    title: '4. Costi di terze parti',
    body:
      'Le chiamate ai provider AI esterni (Google Gemini, OpenAI, Anthropic Claude, ' +
      'Mistral, ecc.) sono soggette alle tariffe e ai termini d\'uso dei rispettivi ' +
      'fornitori. L\'utente è L\'UNICO RESPONSABILE dei costi generati dall\'uso della ' +
      'propria API key.\n\n' +
      'PezzaliApp non controlla, non monitora, non limita e non rimborsa eventuali ' +
      'addebiti, sovrappiù, picchi di utilizzo, costi inattesi o fatturazioni ' +
      'irregolari operate dal provider AI scelto dall\'utente. La gestione dei limiti ' +
      'di spesa, delle policy di rate limiting e della sicurezza delle proprie chiavi ' +
      'è onere esclusivo dell\'utente.',
  },
  {
    title: '5. Servizi esterni · disponibilità non garantita',
    body:
      'Le funzioni che richiedono Internet (analisi AI, Officine vicine via ' +
      'OpenStreetMap/Overpass, integrazione EPREL via Cloudflare Worker, invio ' +
      'WhatsApp, webhook Make.com, ecc.) dipendono da servizi di terze parti al di ' +
      'fuori del controllo di PezzaliApp.\n\n' +
      'Non si garantisce la disponibilità, l\'accuratezza, la velocità o la continuità ' +
      'di tali servizi. Cambiamenti unilaterali, dismissioni, modifiche di prezzo o ' +
      'API di terze parti possono rendere alcune funzioni inutilizzabili senza preavviso.',
  },
  {
    title: '6. Conservazione dei dati · backup a carico dell\'utente',
    body:
      'Tutti i dati (storico analisi, preventivi, impostazioni, API key, dati ' +
      'cliente) sono memorizzati LOCALMENTE nel browser dell\'utente (localStorage), ' +
      'sul dispositivo in uso. PezzaliApp NON conserva alcuna copia di tali dati e ' +
      'NON può recuperarli in caso di perdita.\n\n' +
      'I dati possono andare persi a seguito di: pulizia della cache da parte ' +
      'dell\'utente o del sistema operativo, disinstallazione della PWA, ' +
      'aggiornamenti del browser, cambio di dispositivo, malfunzionamenti vari.\n\n' +
      'L\'utente è invitato a effettuare backup periodici tramite la funzione ' +
      'dedicata (Impostazioni → Avanzate → Esporta backup JSON). La mancata esecuzione ' +
      'dei backup è responsabilità dell\'utente.',
  },
  {
    title: '7. Privacy e GDPR',
    body:
      'TireCheckTire non invia dati di alcun tipo ai server di PezzaliApp e non ' +
      'effettua tracciamento. Le chiamate AI vanno esclusivamente all\'endpoint ' +
      'configurato dall\'utente. Foto, dati cliente, anagrafiche e tutto il resto ' +
      'restano sul dispositivo dell\'utente.\n\n' +
      'Tuttavia, l\'utente che tratta dati personali di terzi (clienti, dipendenti, ' +
      'autisti, ecc.) tramite l\'app è il Titolare del Trattamento ai sensi del Reg. ' +
      'UE 2016/679 (GDPR) e della normativa italiana applicabile. È pertanto onere ' +
      'esclusivo dell\'utente: raccogliere il consenso degli interessati, definire la ' +
      'base giuridica del trattamento, redigere informativa privacy, predisporre ' +
      'misure di sicurezza adeguate, gestire eventuali data breach.',
  },
  {
    title: '8. Proprietà industriale · marchi di terzi',
    body:
      'I marchi citati dall\'app (Michelin, Pirelli, Continental, Goodyear, ' +
      'Bridgestone, Dunlop, Hankook, Yokohama, Toyo, Falken, e simili) appartengono ' +
      'ai rispettivi titolari e sono usati a solo titolo descrittivo. Eventuali ' +
      'modelli, sigle o codici menzionati non implicano alcun rapporto commerciale, ' +
      'autorizzazione, sponsorizzazione o partenariato.\n\n' +
      'I deep-link verso fornitori B2B (Ciavarella, Intergomma, EPREL UE, Google Shop) ' +
      'sono opzionali e completamente configurabili dall\'utente. PezzaliApp non ha ' +
      'rapporti commerciali, di affiliazione o di rappresentanza con tali soggetti.',
  },
  {
    title: '9. Sicurezza informatica',
    body:
      'L\'utente è responsabile della sicurezza del dispositivo, del browser, del ' +
      'sistema operativo e delle proprie credenziali. PezzaliApp non risponde di ' +
      'accessi non autorizzati al dispositivo, furto di API key, malware o attacchi ' +
      'informatici sul terminale dell\'utente.\n\n' +
      'È onere dell\'utente conservare le API key in modo riservato, non condividerle ' +
      'con terzi e revocarle immediatamente in caso di sospetto compromesso.',
  },
  {
    title: '10. Limitazione di responsabilità',
    body:
      'Nei limiti consentiti dalla legge applicabile, PezzaliApp (titolare: ' +
      'Alessandro Pezzali) NON sarà responsabile per:\n' +
      '• danni diretti, indiretti, incidentali, consequenziali o punitivi\n' +
      '• perdita di profitti, fatturato, opportunità commerciali, clientela\n' +
      '• perdita o corruzione di dati locali\n' +
      '• interruzione di attività o fermo macchina\n' +
      '• costi imprevisti addebitati da provider AI o servizi terzi\n' +
      '• danni a veicoli, persone o cose derivanti da decisioni operative basate ' +
      'sulle diagnosi AI senza opportuna verifica manuale\n' +
      '• errori di trascrizione, refusi, dati mancanti nei preventivi o report\n' +
      'derivanti dall\'uso o dall\'impossibilità di uso dell\'applicazione, anche se ' +
      'PezzaliApp fosse stata preventivamente avvisata della possibilità di tali ' +
      'danni.\n\n' +
      'La responsabilità complessiva massima di PezzaliApp è in ogni caso limitata ' +
      'all\'eventuale corrispettivo effettivamente pagato dall\'utente per la licenza ' +
      'd\'uso (se diverso da zero) nei 12 mesi antecedenti al fatto generatore del danno.',
  },
  {
    title: '11. Modifiche · evoluzione del servizio',
    body:
      'PezzaliApp si riserva il diritto di modificare in qualsiasi momento ' +
      'l\'applicazione, le funzionalità, i provider supportati e i presenti termini, ' +
      'dandone informazione tramite aggiornamento di versione. L\'uso dell\'app ' +
      'successivo all\'aggiornamento dei termini implica accettazione delle nuove ' +
      'condizioni.',
  },
  {
    title: '12. Legge applicabile · foro competente',
    body:
      'I presenti termini sono regolati dalla legge italiana. Per ogni controversia ' +
      'che dovesse insorgere in relazione all\'interpretazione, esecuzione o ' +
      'risoluzione dei presenti termini, il foro competente è quello del luogo di ' +
      'residenza del titolare di PezzaliApp, fatto salvo il foro inderogabile del ' +
      'consumatore quando applicabile per legge.',
  },
];

// Short footer line for PDF reports and quotes.
export const PDF_DISCLAIMER =
  'Documento generato da TireCheckTire — strumento di ausilio tecnico. Le valutazioni ' +
  'AI hanno valore indicativo e devono essere verificate dall\'operatore. ' +
  'I dati inseriti sono responsabilità dell\'utente. PezzaliApp non risponde di ' +
  'errori, omissioni o costi inattesi. Termini completi nell\'app.';
