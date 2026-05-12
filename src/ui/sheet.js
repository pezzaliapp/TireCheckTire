// Generic bottom sheet + tire/service editor.

import { $, on, html, raw, setHTML } from "./dom.js";
import { SERVICES } from "../data/services.js";

let sheetRoot = null;
let activePickHandler = null;

export function ensureSheet() {
  if (sheetRoot) return sheetRoot;
  sheetRoot = document.createElement("div");
  sheetRoot.className = "sheet";
  sheetRoot.id = "sheet";
  sheetRoot.innerHTML = `<div class="sheet-panel"><div class="sheet-grab"></div><div class="sheet-body"></div></div>`;
  document.body.appendChild(sheetRoot);
  on(sheetRoot, "click", e => { if (e.target === sheetRoot) closeSheet(); });
  on(sheetRoot, "click", e => {
    const pick = e.target.closest("[data-pick]");
    if (pick && activePickHandler) activePickHandler(pick.dataset.pick);
  });
  return sheetRoot;
}

export function openSheet({ title, body, onPick }) {
  const root = ensureSheet();
  setHTML(root.querySelector(".sheet-body"), html`
    ${title ? `<h3>${title}</h3>` : ""}
    ${raw(body)}
  `);
  activePickHandler = onPick;
  requestAnimationFrame(() => root.classList.add("is-open"));
}

export function closeSheet() {
  if (sheetRoot) sheetRoot.classList.remove("is-open");
  activePickHandler = null;
}

export function openLineSheet({ mode, initial = {}, onSave, onDelete }) {
  const root = ensureSheet();
  const isTire = mode === "tire";

  setHTML(root.querySelector(".sheet-body"), html`
    <h3>${isTire ? (initial.id ? "Pneumatico" : "Aggiungi pneumatico") : (initial.id ? "Servizio" : "Aggiungi servizio")}</h3>
    ${isTire ? raw(`
      <div class="sheet-field"><label>Marca / modello</label><input id="ls-brand" value="${esc(initial.brand)}" placeholder="Michelin Pilot Sport 5"/></div>
      <div class="sheet-field"><label>Misura ETRTO</label><input id="ls-size" value="${esc(initial.sizeStr || "")}" placeholder="245/45 R18 100Y"/></div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px">
        <div class="sheet-field"><label>DOT</label><input id="ls-dot" value="${esc(initial.dot)}" placeholder="2324"/></div>
        <div class="sheet-field"><label>EPREL</label><input id="ls-eprel" value="${esc(initial.eprelId)}" placeholder="123456"/></div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px">
        <div class="sheet-field"><label>Posizione</label>
          <select id="ls-pos">
            <option value="set"   ${initial.position === "set"   ? "selected" : ""}>Treno completo</option>
            <option value="FL"    ${initial.position === "FL"    ? "selected" : ""}>Anteriore SX</option>
            <option value="FR"    ${initial.position === "FR"    ? "selected" : ""}>Anteriore DX</option>
            <option value="RL"    ${initial.position === "RL"    ? "selected" : ""}>Posteriore SX</option>
            <option value="RR"    ${initial.position === "RR"    ? "selected" : ""}>Posteriore DX</option>
            <option value="spare" ${initial.position === "spare" ? "selected" : ""}>Scorta</option>
          </select>
        </div>
        <div class="sheet-field"><label>Stato</label>
          <select id="ls-kind">
            <option value="new"  ${initial.kind === "new"  ? "selected" : ""}>Nuovo</option>
            <option value="used" ${initial.kind === "used" ? "selected" : ""}>Usato</option>
          </select>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px">
        <div class="sheet-field"><label>Quantità</label><input id="ls-qty" type="number" min="1" value="${initial.qty ?? 4}"/></div>
        <div class="sheet-field"><label>Prezzo unitario €</label><input id="ls-price" type="number" min="0" step="0.01" value="${initial.priceUnit ?? 0}"/></div>
      </div>
    `) : raw(`
      <div class="sheet-field"><label>Servizio</label><input id="ls-name" value="${esc(initial.name)}" placeholder="Nome servizio"/></div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px">
        <div class="sheet-field"><label>Quantità</label><input id="ls-qty" type="number" min="1" value="${initial.qty ?? 1}"/></div>
        <div class="sheet-field"><label>Prezzo €</label><input id="ls-price" type="number" min="0" step="0.01" value="${initial.price ?? 0}"/></div>
      </div>
    `)}
    <div class="sheet-actions">
      ${onDelete ? `<button class="ghost" id="ls-del">Rimuovi</button>` : `<button class="ghost" id="ls-cancel">Annulla</button>`}
      <button class="solid" id="ls-save">Salva</button>
    </div>
  `);

  on(root.querySelector("#ls-save"), "click", () => {
    if (isTire) {
      onSave({
        brand: val("ls-brand"),
        sizeStr: val("ls-size"),
        dot: val("ls-dot"),
        eprelId: val("ls-eprel"),
        position: val("ls-pos"),
        kind: val("ls-kind"),
        qty: Number(val("ls-qty")),
        priceUnit: Number(val("ls-price"))
      });
    } else {
      onSave({
        name: val("ls-name"),
        qty: Number(val("ls-qty")),
        price: Number(val("ls-price"))
      });
    }
  });
  on(root.querySelector("#ls-cancel") || root.querySelector("#ls-del"), "click", () => {
    if (onDelete && initial.id) onDelete(); else closeSheet();
  });
  requestAnimationFrame(() => root.classList.add("is-open"));
}

function val(id) { return document.getElementById(id)?.value || ""; }
function esc(s) { return s == null ? "" : String(s).replace(/"/g, "&quot;"); }
