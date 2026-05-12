const eurFmt = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const dateFmt = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const timeFmt = new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit" });

export const eur = n => eurFmt.format(Number(n) || 0);
export const eurPlain = n => (Number(n) || 0).toFixed(2);
export const fmtDate = d => dateFmt.format(new Date(d));
export const fmtDateTime = d => dateTimeFmt.format(new Date(d));
export const fmtTime = d => timeFmt.format(new Date(d));

export const upperPlate = s => String(s || "").toUpperCase().replace(/\s+/g, "");

export function relTime(d) {
  const diff = Date.now() - new Date(d).getTime();
  const s = Math.round(diff / 1000);
  if (s < 60) return "ora";
  const m = Math.round(s / 60);
  if (m < 60) return m + " min fa";
  const h = Math.round(m / 60);
  if (h < 24) return h + " h fa";
  const dd = Math.round(h / 24);
  if (dd < 7) return dd + " gg fa";
  return fmtDate(d);
}
