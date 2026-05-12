// Single archived entry — the legal evidence panel.

import { $, on, html, raw, setHTML, toast } from "./dom.js";
import { icon } from "./icons.js";
import { eur, fmtDateTime } from "../core/format.js";
import { formatTireSize } from "../parsers/etrto.js";
import { formatGeo } from "../core/geo.js";
import { shortHash } from "../core/hash.js";
import { goto } from "./stage.js";
import { sharePDF } from "./share.js";

export async function renderEntry(j) {
  const root = $("[data-scene=entry]");
  const dx = j.diagnoses[j.diagnoses.length - 1];
  const pdfDoc = j.documents.find(d => d.kind === "legal-report" || d.kind === "quote");

  setHTML(root, html`
    <section class="doc">
      <div class="doc-scroll scroll">
        <header class="doc-head" style="display:flex; flex-direction:row; justify-content:space-between; align-items:start; gap:16px">
          <div>
            <span class="kicker">${j.status === "signed" ? "Firmato" : "Preventivo"} · ${fmtDateTime(j.createdAt)}</span>
            <h1>${j.customer.name || "Cliente"}</h1>
            <span class="subhead">${j.vehicle.plate || ""} · ${j.vehicle.brand || ""} ${j.vehicle.model || ""}</span>
          </div>
          <button class="ghost" data-act="back">${raw(icon("close"))}</button>
        </header>

        ${j.shots.length ? html`
          <div class="shots-row scroll">
            ${raw(j.shots.map(s => `<img src="${s.dataUrl}" alt="" title="${s.role} · ${fmtDateTime(s.takenAt)}"/>`).join(""))}
          </div>
        ` : ""}

        ${dx ? html`
          <div class="dx-story">
            <span class="kicker">Perizia AI · ${dx.provider}/${dx.model} · ${fmtDateTime(dx.takenAt)}</span>
            <p>${dx.result.diagnosis_summary || "—"}</p>
          </div>
        ` : ""}

        <div class="lines">
          ${raw(j.tires.map(t => `
            <div class="line">
              <div class="line-name">
                <span>${t.brand || "Pneumatico"} ${t.kind === "used" ? "· usato" : ""}</span>
                <small>${formatTireSize(t.size) || ""}${t.dot ? " · DOT " + t.dot : ""}${t.position ? " · " + t.position : ""}</small>
              </div>
              <span class="line-qty">×${t.qty}</span>
              <span class="line-price">${eur(t.priceUnit * t.qty)}</span>
            </div>
          `).join(""))}
          ${raw(j.services.map(s => `
            <div class="line">
              <div class="line-name"><span>${s.name}</span><small>${s.unit || ""}</small></div>
              <span class="line-qty">×${s.qty}</span>
              <span class="line-price">${eur(s.price * s.qty)}</span>
            </div>
          `).join(""))}
        </div>

        <div class="total">
          <div>
            <span class="label">Totale incl. IVA ${j.totals.vat}%</span>
            <span class="breakdown">imponibile ${eur(j.totals.sub)}</span>
          </div>
          <span class="amount">${eur(j.totals.total)}</span>
        </div>

        ${j.signature ? html`
          <div class="dx-story">
            <span class="kicker">Firma cliente</span>
            <img src="${j.signature.dataUrl}" style="background:#fff; border-radius:12px; padding:12px; max-height:160px; object-fit:contain"/>
            <p style="font-family:var(--font-mono); font-size:11px; color:var(--ink-3); letter-spacing:.06em">
              ${fmtDateTime(j.signature.signedAt)} · ${formatGeo(j.signature.geo)}<br>
              hash signature ${shortHash(j.signature.hash, 16)}
            </p>
          </div>
        ` : ""}

        ${pdfDoc ? html`
          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap">
            <span class="hash-badge">${raw(icon("hash"))} doc ${shortHash(pdfDoc.hash, 16)}</span>
            ${j.signature ? raw(`<span class="hash-badge">${icon("shield")} sig ${shortHash(j.signature.hash, 12)}</span>`) : ""}
          </div>
        ` : ""}
      </div>

      <div class="doc-foot">
        <button class="ghost" data-act="back">${raw(icon("close"))}</button>
        <button class="send" data-act="share">${raw(icon("share"))} <span style="margin-left:8px">Condividi PDF</span></button>
      </div>
    </section>
  `);

  on(root, "click", async e => {
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "back") goto("vault");
    if (act === "share") {
      const { buildAndStorePDF } = await import("../legal/pdf.js");
      let doc = pdfDoc;
      if (!doc) {
        doc = await buildAndStorePDF();
      }
      sharePDF(doc, j);
    }
  });
}
