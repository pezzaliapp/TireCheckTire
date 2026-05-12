// Default service catalogue. Prices in € (excl. VAT). The user can override per item
// at quote time; the master list lives in settings.

export const SERVICES = {
  // Auto
  "mount":      { name: "Montaggio + valvola",     unit: "ruota", price: 12 },
  "balance":    { name: "Equilibratura",            unit: "ruota", price: 8 },
  "valve":      { name: "Valvola TPMS",             unit: "pz",     price: 35 },
  "alignment":  { name: "Convergenza",              unit: "asse",   price: 55 },
  "storage":    { name: "Stoccaggio stagionale",    unit: "treno",  price: 60 },
  "patch":      { name: "Riparazione foratura",     unit: "ruota", price: 25 },
  "disposal":   { name: "Smaltimento PFU",          unit: "ruota", price: 3 },

  // Truck / Fleet
  "mount-truck":      { name: "Montaggio truck",         unit: "ruota", price: 35 },
  "balance-truck":    { name: "Equilibratura truck",     unit: "ruota", price: 18 },
  "alignment-truck":  { name: "Geometria 4 ruote",       unit: "veicolo", price: 280 },
  "regroove":         { name: "Riscolpitura",            unit: "ruota", price: 22 },
  "axle-check":       { name: "Verifica assale",         unit: "asse",   price: 45 },

  // Rental
  "pre-check":   { name: "Check pre-consegna",  unit: "veicolo", price: 0 },
  "post-check":  { name: "Check post-restituzione", unit: "veicolo", price: 0 },
};

export function service(code) {
  return SERVICES[code] || null;
}
