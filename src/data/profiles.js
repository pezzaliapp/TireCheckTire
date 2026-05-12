// The four trades.

export const PROFILES = {
  shop: {
    id: "shop",
    label: "Gommista",
    description: "Auto, moto, furgone. WhatsApp, listino personale, preventivo veloce.",
    family: "auto",
    services: ["mount", "balance", "valve", "alignment", "storage", "patch"],
    glyph: glyph("M3 13a9 9 0 0 1 18 0v3a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-1H9v1a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3v-1l2-2Z"),
  },
  fleet: {
    id: "fleet",
    label: "Officina Fleet",
    description: "Truck, autobus, eurocargo. Schede per veicolo, alert sistemici.",
    family: "truck",
    services: ["mount-truck", "balance-truck", "alignment-truck", "regroove", "axle-check"],
    glyph: glyph("M3 7h12v8h2.5l3 3H22v-2l-2-5-2-1V7m-2 11a2 2 0 1 0 4 0 2 2 0 0 0-4 0m-12 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"),
  },
  distrib: {
    id: "distrib",
    label: "Distributore",
    description: "Multi-marca, EPREL, ordini ai produttori, offerte da quantità.",
    family: "auto",
    services: ["mount", "balance", "valve"],
    glyph: glyph("M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4z"),
  },
  rental: {
    id: "rental",
    label: "Noleggiatore",
    description: "Checklist pre/post, prove inattaccabili, comparazione visiva.",
    family: "auto",
    services: ["pre-check", "post-check"],
    glyph: glyph("M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4Zm-1 14-4-4 1.4-1.4L11 13.2l5.6-5.6L18 9l-7 7Z"),
  },
};

function glyph(d) {
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="${d}"/></svg>`;
}

export function defaultProfile() { return PROFILES.shop; }
