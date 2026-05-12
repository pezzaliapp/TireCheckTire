// Disclaimer e note legali per progetto open source.
// Versionato: se cambia in modo sostanziale, bumpare TERMS_VERSION così che
// gli utenti esistenti siano invitati a riprenderne visione al prossimo avvio.

export const TERMS_VERSION = '1.1';
export const TERMS_DATE = 'maggio 2026';

export const TERMS_SHORT =
  'TireCheckTire è un progetto open source rilasciato gratuitamente a titolo ' +
  'personale dall\'autore, sotto licenza MIT. È uno strumento di ausilio tecnico ' +
  'fornito "così com\'è": le diagnosi AI hanno valore indicativo e devono essere ' +
  'verificate manualmente dall\'operatore. L\'utente è responsabile dei dati ' +
  'inseriti, dei costi dei provider AI di terzi e dei backup.';

// Sezioni renderizzate in ordine. Ogni sezione: { title, body } dove body è
// testo con paragrafi separati da \n\n e ritorni a capo singoli con \n.
export const TERMS_SECTIONS = [
  {
    title: '1. Natura del progetto e contesto di rilascio',
    body:
      'TireCheckTire è un\'applicazione web (Progressive Web App) rilasciata a ' +
      'titolo personale e gratuito da Alessandro Pezzali, persona fisica, al di ' +
      'fuori di qualsiasi attività professionale, commerciale o d\'impresa. Non ' +
      'sussiste alcun rapporto contrattuale tra l\'autore e gli utenti dell\'applicazione.\n\n' +
      'Il software è fornito "AS IS" ("così com\'è"), senza garanzie di alcun tipo, ' +
      'espresse o implicite, comprese — senza limitazione — le garanzie di ' +
      'commerciabilità, idoneità a uno scopo particolare e non violazione di ' +
      'diritti di terzi.\n\n' +
      'Il codice sorgente è disponibile su https://github.com/pezzaliapp/TireCheckTire ' +
      'ed è rilasciato sotto licenza MIT. Le presenti note integrano, senza ' +
      'sostituirla, la licenza MIT di rilascio, che già contiene la clausola di ' +
      'esclusione di garanzie "AS IS".\n\n' +
      'L\'app è un AUSILIO TECNICO destinato a operatori del settore pneumatico ' +
      '(gommisti, autofficine, fleet manager, distributori B2B) e non sostituisce ' +
      'in alcun modo l\'ispezione visiva e il giudizio professionale dell\'operatore.\n\n' +
      'Per segnalazioni relative al software è possibile aprire una issue sul ' +
      'repository GitHub del progetto.',
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
    title: '3. Esclusione dal regime AI ad alto rischio',
    body:
      'L\'applicazione non costituisce un sistema di intelligenza artificiale ad ' +
      'alto rischio ai sensi del Regolamento UE 2024/1689 (AI Act) e non è ' +
      'destinata a prendere decisioni autonome in materia di sicurezza. Le ' +
      'diagnosi AI rappresentano un supporto informativo per l\'operatore, che ' +
      'mantiene piena autonomia e responsabilità decisionale.',
  },
  {
    title: '4. Inserimento dati · responsabilità dell\'utente',
    body:
      'L\'inserimento di targhe, misure ETRTO, codici DOT, prezzi, dati cliente, ' +
      'dati di flotta e qualsiasi altro contenuto è di ESCLUSIVA RESPONSABILITÀ ' +
      'DELL\'UTENTE.\n\n' +
      'L\'autore non risponde di errori di trascrizione, dati incompleti, errati ' +
      'o non aggiornati, né delle conseguenze (economiche, contrattuali, legali, ' +
      'tributarie, fiscali) derivanti da preventivi, report o documenti generati ' +
      'a partire da dati errati.',
  },
  {
    title: '5. Costi di terze parti',
    body:
      'Le chiamate ai provider AI esterni (Google Gemini, OpenAI, Anthropic ' +
      'Claude, Mistral, ecc.) sono soggette alle tariffe e ai termini d\'uso dei ' +
      'rispettivi fornitori. L\'utente è L\'UNICO RESPONSABILE dei costi generati ' +
      'dall\'uso della propria API key.\n\n' +
      'L\'autore non controlla, non monitora, non limita e non rimborsa eventuali ' +
      'addebiti, sovrappiù, picchi di utilizzo, costi inattesi o fatturazioni ' +
      'irregolari operate dal provider AI scelto dall\'utente. La gestione dei ' +
      'limiti di spesa, delle policy di rate limiting e della sicurezza delle ' +
      'proprie chiavi è onere esclusivo dell\'utente.',
  },
  {
    title: '6. Servizi esterni · disponibilità non garantita',
    body:
      'Le funzioni che richiedono Internet (analisi AI, Officine vicine via ' +
      'OpenStreetMap/Overpass, integrazione EPREL via Cloudflare Worker, invio ' +
      'WhatsApp, webhook Make.com, ecc.) dipendono da servizi di terze parti al ' +
      'di fuori del controllo dell\'autore.\n\n' +
      'Non si garantisce la disponibilità, l\'accuratezza, la velocità o la ' +
      'continuità di tali servizi. Cambiamenti unilaterali, dismissioni, modifiche ' +
      'di prezzo o API di terze parti possono rendere alcune funzioni inutilizzabili ' +
      'senza preavviso.',
  },
  {
    title: '7. Conservazione dei dati · backup a carico dell\'utente',
    body:
      'Tutti i dati (storico analisi, preventivi, impostazioni, API key, dati ' +
      'cliente) sono memorizzati LOCALMENTE nel browser dell\'utente, sul ' +
      'dispositivo in uso. L\'autore NON conserva alcuna copia di tali dati e ' +
      'NON può recuperarli in caso di perdita.\n\n' +
      'I dati possono andare persi a seguito di: pulizia della cache da parte ' +
      'dell\'utente o del sistema operativo, disinstallazione della PWA, ' +
      'aggiornamenti del browser, cambio di dispositivo, malfunzionamenti vari.\n\n' +
      'L\'utente è invitato a effettuare backup periodici tramite la funzione ' +
      'dedicata (Impostazioni → Avanzate → Esporta backup JSON). La mancata ' +
      'esecuzione dei backup è responsabilità dell\'utente.',
  },
  {
    title: '8. Privacy · localStorage e GDPR',
    body:
      'TireCheckTire non invia dati di alcun tipo a server dell\'autore e non ' +
      'effettua tracciamento. Le chiamate AI vanno esclusivamente all\'endpoint ' +
      'configurato dall\'utente. Foto, dati cliente, anagrafiche e tutto il resto ' +
      'restano sul dispositivo dell\'utente.\n\n' +
      'L\'app utilizza esclusivamente il localStorage del browser per memorizzare ' +
      'dati funzionali sul dispositivo dell\'utente. Non vengono utilizzati cookie ' +
      'di tracciamento né strumenti analitici.\n\n' +
      'L\'utente che tratta dati personali di terzi (clienti, dipendenti, autisti, ' +
      'ecc.) tramite l\'app è il Titolare del Trattamento ai sensi del Reg. UE ' +
      '2016/679 (GDPR) e della normativa italiana applicabile. È pertanto onere ' +
      'esclusivo dell\'utente: raccogliere il consenso degli interessati, definire ' +
      'la base giuridica del trattamento, redigere informativa privacy, predisporre ' +
      'misure di sicurezza adeguate, gestire eventuali data breach.',
  },
  {
    title: '9. Proprietà industriale · marchi di terzi',
    body:
      'I marchi citati dall\'app (Michelin, Pirelli, Continental, Goodyear, ' +
      'Bridgestone, Dunlop, Hankook, Yokohama, Toyo, Falken, e simili) ' +
      'appartengono ai rispettivi titolari. I marchi sono utilizzati a fini ' +
      'meramente descrittivi e identificativi ai sensi dell\'art. 21 del Codice ' +
      'della Proprietà Industriale (D.Lgs. 30/2005). Eventuali modelli, sigle o ' +
      'codici menzionati non implicano alcun rapporto commerciale, autorizzazione, ' +
      'sponsorizzazione o partenariato.\n\n' +
      'I deep-link verso fornitori B2B (Ciavarella, Intergomma, EPREL UE, Google ' +
      'Shop) sono opzionali e completamente configurabili dall\'utente. L\'autore ' +
      'non ha rapporti commerciali, di affiliazione o di rappresentanza con tali ' +
      'soggetti.',
  },
  {
    title: '10. Sicurezza informatica',
    body:
      'L\'utente è responsabile della sicurezza del dispositivo, del browser, del ' +
      'sistema operativo e delle proprie credenziali. L\'autore non risponde di ' +
      'accessi non autorizzati al dispositivo, furto di API key, malware o ' +
      'attacchi informatici sul terminale dell\'utente.\n\n' +
      'È onere dell\'utente conservare le API key in modo riservato, non ' +
      'condividerle con terzi e revocarle immediatamente in caso di sospetto ' +
      'compromesso.',
  },
  {
    title: '11. Limitazione di responsabilità',
    body:
      'Nei limiti consentiti dalla legge applicabile, l\'autore NON sarà ' +
      'responsabile per:\n' +
      '• danni diretti, indiretti, incidentali, consequenziali o punitivi\n' +
      '• perdita di profitti, fatturato, opportunità commerciali, clientela\n' +
      '• perdita o corruzione di dati locali\n' +
      '• interruzione di attività o fermo macchina\n' +
      '• costi imprevisti addebitati da provider AI o servizi terzi\n' +
      '• danni a veicoli, persone o cose derivanti da decisioni operative basate ' +
      'sulle diagnosi AI senza opportuna verifica manuale\n' +
      '• errori di trascrizione, refusi, dati mancanti nei preventivi o report\n' +
      'derivanti dall\'uso o dall\'impossibilità di uso dell\'applicazione.\n\n' +
      'Trattandosi di software rilasciato gratuitamente a titolo personale sotto ' +
      'licenza MIT, non è dovuto alcun corrispettivo né alcuna obbligazione di ' +
      'risultato a carico dell\'autore.\n\n' +
      'Resta ferma la responsabilità per dolo o colpa grave ai sensi dell\'art. ' +
      '1229 c.c.',
  },
  {
    title: '12. Evoluzione del progetto',
    body:
      'Il software evolve nel tempo. Le presenti note possono essere aggiornate ' +
      'nel repository GitHub del progetto; l\'uso della versione corrente ' +
      'dell\'applicazione implica presa visione delle relative note nella versione ' +
      'pubblicata.',
  },
  {
    title: '13. Legge applicabile · foro competente',
    body:
      'Le presenti note sono regolate dalla legge italiana. Per ogni controversia ' +
      'relativa alla loro interpretazione, il foro competente è quello del luogo ' +
      'di residenza dell\'autore, fatto salvo il foro inderogabile del consumatore ' +
      'quando applicabile per legge.',
  },
];

// Riga sintetica stampata in fondo a ogni PDF (report e preventivi).
export const PDF_DISCLAIMER =
  'Documento generato da TireCheckTire — software open source di ausilio tecnico ' +
  '(licenza MIT). Le valutazioni AI hanno valore indicativo e devono essere ' +
  'verificate dall\'operatore. I dati inseriti sono responsabilità dell\'utente. ' +
  'L\'autore non risponde di errori, omissioni o costi inattesi. Note legali ' +
  'complete nell\'app.';
