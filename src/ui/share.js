// Share helpers — WhatsApp, native share, copy link.

import { html, raw, toast } from "./dom.js";
import { icon } from "./icons.js";
import { openSheet, closeSheet } from "./sheet.js";
import { job } from "../core/job.js";
import { settings } from "../core/state.js";
import { eur, fmtDate } from "../core/format.js";
import { formatTireSize } from "../parsers/etrto.js";

export function openShareSheet() {
  const j = job.get();
  if (!j) return;
  openSheet({
    title: "Condividi",
    body: html`
      <p style="color:var(--ink-2); margin-bottom:12px; font-size:14px; line-height:1.5">
        Il documento è firmato. Hash anchored. Datato. Pronto.
      </p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
        <button class="solid" id="sh-wa" style="display:flex; align-items:center; justify-content:center; gap:8px">${raw(icon("whatsapp"))} WhatsApp</button>
        <button class="solid" id="sh-pdf" style="display:flex; align-items:center; justify-content:center; gap:8px">${raw(icon("download"))} Scarica PDF</button>
        <button class="ghost" id="sh-copy" style="display:flex; align-items:center; justify-content:center; gap:8px">${raw(icon("share"))} Copia riepilogo</button>
        <button class="ghost" id="sh-webhook" style="display:flex; align-items:center; justify-content:center; gap:8px">${raw(icon("cpu"))} Webhook</button>
      </div>
    `,
    onPick: null
  });
  document.getElementById("sh-wa").onclick = () => sendWhatsApp(j);
  document.getElementById("sh-pdf").onclick = () => downloadPDF(j);
  document.getElementById("sh-copy").onclick = async () => { await navigator.clipboard.writeText(textSummary(j)); toast("Copiato negli appunti", "ok"); };
  document.getElementById("sh-webhook").onclick = () => sendWebhook(j);
}

export function sharePDF(doc, j) {
  downloadPDF(j, doc);
}

function sendWhatsApp(j) {
  const phone = (j.customer.phone || "").replace(/\D/g, "");
  const text = encodeURIComponent(textSummary(j));
  const url = phone
    ? `https://wa.me/${phone.startsWith("39") ? phone : "39" + phone}?text=${text}`
    : `https://wa.me/?text=${text}`;
  window.open(url, "_blank");
}

function textSummary(j) {
  const op = settings.get("operator", {});
  const tires = j.tires.map(t => `- ${t.brand || "Pneumatico"} ${formatTireSize(t.size) || ""} ×${t.qty} → ${eur(t.priceUnit * t.qty)}`).join("\n");
  const svc = j.services.map(s => `- ${s.name} ×${s.qty} → ${eur(s.price * s.qty)}`).join("\n");
  return `Preventivo ${op.shopName || "Officina"} — ${fmtDate(j.createdAt)}
${j.customer.name ? "Cliente: " + j.customer.name : ""}
${j.vehicle.plate ? "Targa: " + j.vehicle.plate : ""}

${tires}
${svc ? "\n" + svc : ""}

Totale incl. IVA: ${eur(j.totals.total)}`;
}

async function downloadPDF(j, existingDoc) {
  const { buildAndStorePDF } = await import("../legal/pdf.js");
  const doc = existingDoc || await buildAndStorePDF();
  const a = document.createElement("a");
  a.href = doc.dataUrl;
  a.download = `TireCheckTire-${(j.vehicle.plate || j.id.slice(-6))}.pdf`;
  a.click();
}

async function sendWebhook(j) {
  const url = settings.get("webhook.makecom", "");
  if (!url) { toast("Nessun webhook configurato", "error"); return; }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(j)
    });
    if (!res.ok) throw new Error(res.status);
    toast("Webhook inviato", "ok");
  } catch (e) {
    toast("Errore webhook", "error");
  }
}
