// Catalogo servizi base — modificabile in Impostazioni
export const SERVICE_CATALOG_AUTO = [
  { id: 'montaggio',     nome: 'Montaggio gomme',       icona: '🔧', price: 8,   perGomma: true,  desc: '× gomma' },
  { id: 'equilibratura', nome: 'Equilibratura',         icona: '⚖️', price: 7,   perGomma: true,  desc: '× cerchio' },
  { id: 'convergenza',   nome: 'Convergenza',           icona: '🎯', price: 45,  perGomma: false, desc: 'servizio' },
  { id: 'assetto',       nome: 'Assetto 3D',            icona: '📐', price: 80,  perGomma: false, desc: 'servizio' },
  { id: 'gonfiaggio',    nome: 'Gonfiaggio azoto',      icona: '💨', price: 5,   perGomma: true,  desc: '× gomma' },
  { id: 'smontaggio',    nome: 'Smontaggio gomme',      icona: '🔩', price: 6,   perGomma: true,  desc: '× gomma' },
  { id: 'stoccaggio',    nome: 'Stoccaggio stagionale', icona: '📦', price: 30,  perGomma: false, desc: 'stagione' },
  { id: 'valvole',       nome: 'Sostituzione valvole',  icona: '🔵', price: 3,   perGomma: true,  desc: '× valvola' },
  { id: 'smaltimento',   nome: 'Smaltimento pneumatici', icona: '♻️', price: 4,   perGomma: true,  desc: '× gomma' },
];

export const SERVICE_CATALOG_TRUCK = [
  { id: 'montaggio-tr',  nome: 'Montaggio truck',       icona: '🔧', price: 22,  perGomma: true,  desc: '× gomma' },
  { id: 'equil-tr',      nome: 'Equilibratura truck',   icona: '⚖️', price: 18,  perGomma: true,  desc: '× cerchio' },
  { id: 'geometria',     nome: 'Geometria assi',        icona: '📐', price: 180, perGomma: false, desc: 'servizio' },
  { id: 'riscolpitura',  nome: 'Riscolpitura',          icona: '🪓', price: 25,  perGomma: true,  desc: '× gomma' },
  { id: 'gonf-tr',       nome: 'Gonfiaggio truck',      icona: '💨', price: 6,   perGomma: true,  desc: '× gomma' },
  { id: 'soccorso',      nome: 'Soccorso stradale',     icona: '🚛', price: 120, perGomma: false, desc: 'servizio' },
  { id: 'smont-tr',      nome: 'Smontaggio truck',      icona: '🔩', price: 18,  perGomma: true,  desc: '× gomma' },
  { id: 'smalti-tr',     nome: 'Smaltimento truck',     icona: '♻️', price: 12,  perGomma: true,  desc: '× gomma' },
];
