// ETRTO parser. Handles auto (245/45 R18 94V) and truck (315/80 R22.5 156L).
// Extracted and tightened from the QuoteFlash source.

const RX_AUTO = /(\d{3})\s*[\/\- ]\s*(\d{2,3})\s*(?:Z?R|R)\s*(\d{2})\s*(CP|C)?\s*(?:(\d{2,3}(?:\/\d{2,3})?[A-Z]{1,2}))?/;
const RX_TRUCK = /(\d{2,3})\s*[\/\- ]\s*(\d{2,3})\s*R\s*(\d{2}\.5)\s*(?:(\d{3}(?:\/\d{3})?[A-Z]{1,2}))?/;

export function parseTireSize(input) {
  if (!input) return null;
  const s = String(input).toUpperCase().replace(/\s+/g, " ").trim();

  const truck = s.match(RX_TRUCK);
  if (truck) {
    return {
      w: parseInt(truck[1], 10),
      h: parseInt(truck[2], 10),
      r: parseFloat(truck[3]),
      cls: "",
      liSi: truck[4] || "",
      family: "truck"
    };
  }
  const auto = s.match(RX_AUTO);
  if (auto) {
    return {
      w: parseInt(auto[1], 10),
      h: parseInt(auto[2], 10),
      r: parseInt(auto[3], 10),
      cls: auto[4] || "",
      liSi: auto[5] || "",
      family: "auto"
    };
  }
  return null;
}

export function formatTireSize(sz) {
  if (!sz || sz.w == null) return "";
  const r = Number.isInteger(sz.r) ? sz.r : sz.r.toFixed(1);
  const cls = sz.cls || "";
  return `${sz.w}/${sz.h} R${r}${cls}${sz.liSi ? " " + sz.liSi : ""}`;
}

export function isCommercial(sz) {
  return !!sz && (sz.family === "truck" || /C|CP/.test(sz.cls || ""));
}
