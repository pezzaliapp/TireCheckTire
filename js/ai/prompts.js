// AI prompts specialized per vehicle type
// Riadattati dai sorgenti TireCheck Pro (auto) e Fleet (truck).

const RESPONSE_SHAPE = `{
  "esito": "OK" | "ATTENZIONE" | "SOSTITUIRE",
  "profondita_mm": numero decimale | null,
  "usura_uniforme": true | false,
  "tipo_usura": "uniforme" | "centrale" | "spalla interna" | "spalla esterna" | "dentellata" | "irregolare" | "non determinabile",
  "condizione_fianco": "OK" | "VERIFICARE" | "DANNEGGIATO",
  "urgenza": "bassa" | "media" | "alta" | "critica",
  "misura": "205/55 R16" | null,
  "dot": "stringa DOT" | null,
  "anno_produzione": numero anno | null,
  "marca": "stringa" | null,
  "commento": "max 4 frasi in italiano",
  "raccomandazioni": ["string", "..."],
  "leggibilita": "buona" | "parziale" | "scarsa"
}`;

export function analysisPrompt({ mode = 'auto', context = {} } = {}) {
  const safe = (v) => (v && String(v).trim()) ? String(v).trim() : 'da rilevare';

  if (mode === 'truck') {
    return `Sei un tecnico gommista fleet esperto in pneumatici per camion, autobus, eurocargo, motrici e trailer. Analizza questa foto del battistrada.

DATI GIÀ DISPONIBILI (verificati dall'utente):
- Misura: ${safe(context.misura)}
- DOT: ${safe(context.dot)}
- Tipo mezzo: ${safe(context.tipoMezzo)}
- Tipo asse: ${safe(context.tipoAsse)}
- Montaggio: ${safe(context.montaggio)}

REGOLE CRITICHE:
1. Valuta SOLO ciò che è chiaramente visibile nel battistrada. NON fare supposizioni.
2. Se la foto è angolata o il battistrada non è leggibile frontalmente: usa ATTENZIONE e profondita_mm null.
3. Usa SOSTITUIRE solo se vedi chiaramente battistrada esaurito, danni strutturali evidenti o usura gravemente irregolare.
4. Segnala come ipotesi tecnica, non come certezza, possibili cause come sotto/sovra gonfiaggio o assetto/convergenza.
5. Per truck e bus considera pattern come usura centrale, spalla interna, spalla esterna, dentellata, irregolare, coppia gemellata.
6. In caso di dubbio scegli sempre l'esito più prudente ma non allarmistico: OK > ATTENZIONE > SOSTITUIRE.
7. Aggiungi 2-4 raccomandazioni operative (es. "ricontrollare gonfiaggio", "rotazione tra assi").

Rispondi SOLO con JSON valido, niente markdown:
${RESPONSE_SHAPE}`;
  }

  // auto
  return `Sei un tecnico gommista esperto con 20 anni di esperienza. Analizza questa foto di un pneumatico auto.

DATI GIÀ DISPONIBILI (verificati dall'utente):
- Misura: ${safe(context.misura)}
- DOT: ${safe(context.dot)}
- Posizione: ${safe(context.posizione)}

REGOLE CRITICHE PER UNA VALUTAZIONE CORRETTA:
1. Valuta SOLO ciò che è chiaramente visibile nel battistrada. NON fare supposizioni.
2. Se la foto è angolata, laterale o il battistrada non è visibile frontalmente: usa ATTENZIONE con profondita_mm null.
3. Usa SOSTITUIRE solo se vedi CHIARAMENTE: battistrada a filo, indicatori di usura esposti, o danni strutturali certi.
4. Ombre scure nei solchi significano solchi PROFONDI (pneumatico in buono stato), NON usura.
5. Un battistrada nuovo o poco usato ha solchi profondi (7-8mm) con ombre marcate.
6. In caso di dubbio scegli sempre l'esito più favorevole: OK > ATTENZIONE > SOSTITUIRE.
7. Aggiungi 2-4 raccomandazioni pratiche.

Rispondi SOLO con JSON valido, niente markdown:
${RESPONSE_SHAPE}`;
}

export function ocrSidewallPrompt() {
  return `Sei un tecnico esperto di pneumatici. Analizza questa foto del FIANCO LATERALE del pneumatico.

Sul fianco sono stampate queste informazioni:
1. MISURA: formato "205/55 R16" o "315/80 R22.5"
2. CODICE DOT: ultime 4 cifre = settimana + anno
3. MARCA (Michelin, Pirelli, Continental, Bridgestone, Goodyear, Dunlop, Hankook, Yokohama, Toyo, ecc.)

ISTRUZIONI:
- Leggi SOLO quello che è chiaramente visibile.
- Se un dato non è leggibile, restituisci null.
- NON inventare. Meglio null che valore errato.

Rispondi SOLO con JSON valido senza markdown:
{
  "misura": "205/55 R16" | null,
  "dot": "stringa DOT" | null,
  "anno_produzione": 2019 | null,
  "marca": "Michelin" | null,
  "leggibilita": "buona" | "parziale" | "scarsa"
}`;
}
