// PDF generation — jsPDF loaded from CDN. Designed to survive a courtroom:
// every page footer carries the document hash; the AI provider+model are stated.

import { job, update, persist } from "../core/job.js";
import { settings } from "../core/state.js";
import { sha256, shortHash } from "../core/hash.js";
import { eur, fmtDate, fmtDateTime } from "../core/format.js";
import { formatTireSize } from "../parsers/etrto.js";
import { formatGeo } from "../core/geo.js";

const COL = {
  ink: [16, 16, 16],
  ink2: [80, 80, 80],
  ink3: [140, 140, 140],
  line: [220, 220, 220],
  accent: [40, 40, 40],
};

export async function buildAndStorePDF() {
  await ensureJsPDF();
  const j = job.get();
  if (!j) throw new Error("Nessun lavoro attivo");
  const op = settings.get("operator", {});
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 15;

  // ── Header ─────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...COL.ink);
  doc.text(j.signature ? "Perizia firmata" : "Preventivo", M, 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COL.ink3);
  doc.text(`${(op.shopName || "TireCheckTire").toUpperCase()}`, W - M, 22, { align: "right" });

  // Workshop block
  doc.setFontSize(8);
  doc.text([
    op.address || "",
    op.phone ? "Tel " + op.phone : "",
    op.piva ? "P.IVA " + op.piva : ""
  ].filter(Boolean).join(" · "), W - M, 27, { align: "right" });

  doc.setDrawColor(...COL.line);
  doc.setLineWidth(0.2);
  doc.line(M, 32, W - M, 32);

  // ── Customer / vehicle ────────────────────────────────────────
  let y = 40;
  doc.setFontSize(9);
  doc.setTextColor(...COL.ink3);
  doc.text("CLIENTE", M, y);
  doc.text("VEICOLO", W / 2, y);
  doc.setFontSize(11);
  doc.setTextColor(...COL.ink);
  doc.setFont("helvetica", "bold");
  doc.text(j.customer.name || "—", M, y + 6);
  doc.text(`${j.vehicle.plate || "—"} · ${j.vehicle.brand || ""} ${j.vehicle.model || ""}`.trim(), W / 2, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COL.ink2);
  const custLine = [j.customer.phone, j.customer.email, j.customer.piva].filter(Boolean).join(" · ");
  doc.text(custLine || " ", M, y + 11);
  doc.text(fmtDateTime(j.createdAt), W / 2, y + 11);

  y += 18;
  doc.line(M, y, W - M, y); y += 6;

  // ── Lines ──────────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setTextColor(...COL.ink3);
  doc.text("DESCRIZIONE", M, y);
  doc.text("Q.TÀ", W - M - 50, y, { align: "right" });
  doc.text("PREZZO", W - M - 22, y, { align: "right" });
  doc.text("TOTALE", W - M, y, { align: "right" });
  y += 2;
  doc.line(M, y, W - M, y); y += 5;

  doc.setTextColor(...COL.ink);
  doc.setFontSize(10);

  for (const t of j.tires) {
    const meta = [];
    if (t.size) meta.push(formatTireSize(t.size));
    if (t.dot) meta.push("DOT " + t.dot);
    if (t.eprelId) meta.push("EPREL " + t.eprelId);
    if (t.position && t.position !== "set") meta.push(t.position);
    if (t.kind === "used") meta.push("usato");
    doc.setFont("helvetica", "bold");
    doc.text(t.brand || "Pneumatico", M, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COL.ink2);
    doc.text(meta.join(" · "), M, y + 4);
    doc.setFontSize(10);
    doc.setTextColor(...COL.ink);
    doc.text(String(t.qty || 1), W - M - 50, y, { align: "right" });
    doc.text(eur(t.priceUnit), W - M - 22, y, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(eur(t.priceUnit * t.qty), W - M, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += 9;
  }
  for (const s of j.services) {
    doc.text(s.name, M, y);
    doc.text(String(s.qty || 1), W - M - 50, y, { align: "right" });
    doc.text(eur(s.price), W - M - 22, y, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(eur(s.price * s.qty), W - M, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += 7;
  }

  // ── Totals ─────────────────────────────────────────────────────
  y += 4;
  doc.line(M, y, W - M, y); y += 6;
  doc.setFontSize(9);
  doc.setTextColor(...COL.ink2);
  doc.text("Imponibile", W - M - 40, y, { align: "right" });
  doc.text(eur(j.totals.sub), W - M, y, { align: "right" });
  y += 5;
  doc.text(`IVA ${j.totals.vat}%`, W - M - 40, y, { align: "right" });
  doc.text(eur(j.totals.total - j.totals.sub), W - M, y, { align: "right" });
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...COL.ink);
  doc.text("TOTALE", W - M - 40, y, { align: "right" });
  doc.text(eur(j.totals.total), W - M, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  y += 12;

  // ── Diagnosis block ────────────────────────────────────────────
  const dx = j.diagnoses[j.diagnoses.length - 1];
  if (dx) {
    if (y > H - 60) { doc.addPage(); y = 20; }
    doc.setFontSize(10);
    doc.setTextColor(...COL.ink3);
    doc.text("PERIZIA AI", M, y); y += 6;
    doc.setFontSize(9);
    doc.setTextColor(...COL.ink);
    const r = dx.result;
    const verdict = r.verdict === "ok" ? "OK" : r.verdict === "watch" ? "MONITORARE" : "SOSTITUIRE";
    doc.setFont("helvetica", "bold");
    doc.text(`Esito: ${verdict}`, M, y); y += 5;
    doc.setFont("helvetica", "normal");
    if (r.diagnosis_summary) y = wrap(doc, r.diagnosis_summary, M, y, W - 2 * M, 4.5) + 2;
    if (r.technical_rebuttal) y = wrap(doc, r.technical_rebuttal, M, y, W - 2 * M, 4.5) + 2;
    doc.setFontSize(8);
    doc.setTextColor(...COL.ink3);
    doc.text(`Modello: ${dx.provider} / ${dx.model} · ${fmtDateTime(dx.takenAt)} · ${dx.elapsedMs}ms`, M, y);
    y += 8;
  }

  // ── Shots ──────────────────────────────────────────────────────
  if (j.shots.length) {
    if (y > H - 90) { doc.addPage(); y = 20; }
    doc.setFontSize(10);
    doc.setTextColor(...COL.ink3);
    doc.text("FOTO ALLEGATE", M, y); y += 6;
    const thumbW = 42, thumbH = 42, gap = 4;
    let x = M;
    for (const s of j.shots) {
      if (x + thumbW > W - M) { x = M; y += thumbH + gap + 8; }
      try { doc.addImage(s.dataUrl, "JPEG", x, y, thumbW, thumbH); } catch {}
      doc.setFontSize(7);
      doc.setTextColor(...COL.ink3);
      doc.text(`${s.role} · ${fmtDateTime(s.takenAt)}`, x, y + thumbH + 4);
      if (s.geo) doc.text(`GPS ${s.geo.lat.toFixed(4)},${s.geo.lng.toFixed(4)}`, x, y + thumbH + 7);
      doc.text(`hash ${shortHash(s.hash, 12)}`, x, y + thumbH + 10);
      x += thumbW + gap;
    }
    y += thumbH + 16;
  }

  // ── Signature ──────────────────────────────────────────────────
  if (j.signature) {
    if (y > H - 60) { doc.addPage(); y = 20; }
    doc.setFontSize(10);
    doc.setTextColor(...COL.ink3);
    doc.text("FIRMA CLIENTE", M, y); y += 6;
    try { doc.addImage(j.signature.dataUrl, "PNG", M, y, 80, 32); } catch {}
    doc.setFontSize(8);
    doc.setTextColor(...COL.ink2);
    doc.text([
      `Firmato: ${fmtDateTime(j.signature.signedAt)}`,
      `Posizione: ${formatGeo(j.signature.geo)}`,
      `Firmatario: ${j.signature.signerName || "—"}`,
      `Hash firma: ${j.signature.hash}`
    ].join("\n"), M + 90, y + 6);
    y += 40;
  }

  // ── Footer with doc hash (added after we compute it) ─────────
  // First produce the base bytes WITHOUT the footer to hash deterministically.
  const blobBase = doc.output("arraybuffer");
  const docHash = await sha256(new Uint8Array(blobBase));
  const pageCount = doc.internal.pages.length - 1;
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(...COL.ink3);
    const footer = `Documento ${shortHash(docHash, 16)} · pag. ${p}/${pageCount} · prodotto da TireCheckTire — verificabile su ogni copia`;
    doc.text(footer, W / 2, H - 8, { align: "center" });
  }

  const dataUrl = doc.output("datauristring");
  const stored = {
    id: docHash,
    kind: j.signature ? "legal-report" : "quote",
    hash: docHash,
    generatedAt: new Date().toISOString(),
    dataUrl
  };
  update(j2 => ({ ...j2, documents: [...j2.documents, stored] }));
  await persist();
  return stored;
}

function wrap(doc, txt, x, y, maxW, lh) {
  const lines = doc.splitTextToSize(txt, maxW);
  for (const ln of lines) {
    doc.text(ln, x, y);
    y += lh;
  }
  return y;
}

let jsPDFPromise = null;
function ensureJsPDF() {
  if (window.jspdf) return Promise.resolve();
  if (jsPDFPromise) return jsPDFPromise;
  jsPDFPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return jsPDFPromise;
}
