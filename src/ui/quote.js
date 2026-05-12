// Quote scene — inline editable, with auto-suggested lines from the diagnosis.

import { $, $$, on, html, raw, setHTML, toast, haptic } from "./dom.js";
import { icon } from "./icons.js";
import { goto } from "./stage.js";
import { job, update, persist, archive } from "../core/job.js";
import { SERVICES, service } from "../data/services.js";
import { PROFILES } from "../data/profiles.js";
import { eur } from "../core/format.js";
import { formatTireSize, parseTireSize } from "../parsers/etrto.js";
import { ulid } from "../core/id.js";
import { openSignature } from "./signature.js";
import { openSheet, closeSheet } from "./sheet.js";
import { openLineSheet } from "./sheet.js";

let mounted = false;
let typingFocus = null;

export function mountQuote() {
  if (mounted) { render(); return; }
  mounted = true;
  const root = $("[data-scene=quote]");

  on(root, "input", e => {
    const path = e.target?.dataset?.bind;
    if (!path) return;
    typingFocus = path;
    const v = e.target.value;
    update(j => setPath(structuredClone(j), path, path.endsWith(".plate") ? v.toUpperCase() : v));
  });
  on(root, "click", e => {
    const act = e.target.closest("[data-act]")?.dataset.act;
    const lineId = e.target.closest("[data-line]")?.dataset.line;
    const suggestId = e.target.closest("[data-suggest]")?.dataset.suggest;
    if (act === "back") goto("bay");
    if (act === "add-service") openServicePicker();
    if (act === "add-tire") openLineSheet({ mode: "tire", onSave: addTire });
    if (act === "edit-line" && lineId) editLine(lineId);
    if (act === "del-line" && lineId) delLine(lineId);
    if (act === "accept-suggest" && suggestId) acceptSuggestion(suggestId);
    if (act === "sign") doSign();
  });
  on(root, "focusout", () => { typingFocus = null; });

  render();
  job.subscribe(() => {
    if (document.body.dataset.scene !== "quote") return;
    if (typingFocus) {
      const sel = `[data-bind="${typingFocus}"]`;
      if (document.activeElement?.matches?.(sel)) return;
    }
    render();
  });
}

function render() {
  const j = job.get();
  if (!j) return;
  const root = $("[data-scene=quote]");
  const dx = lastDx(j);
  const tireLines = j.tires.map(renderTireLine).join("");
  const svcLines = j.services.map(renderSvcLine).join("");
  const suggested = computeSuggestions(j).map(s => renderSuggestionLine(s)).join("");

  setHTML(root, html`
    <section class="doc">
      <div class="doc-scroll scroll">
        <header class="doc-head">
          <span class="kicker">Preventivo · ${PROFILES[j.profile]?.label || j.profile}</span>
          <h1>${j.customer.name ? j.customer.name : "Nuovo cliente"}</h1>
          <span class="subhead">${j.vehicle.plate ? j.vehicle.plate + " · " : ""}${j.vehicle.brand || ""} ${j.vehicle.model || ""}</span>
        </header>

        <div class="who-strip">
          <div class="who-field"><label>Cliente</label><input data-bind="customer.name" placeholder="Nome o ragione sociale" value="${j.customer.name || ""}"/></div>
          <div class="who-field"><label>Telefono</label><input data-bind="customer.phone" placeholder="+39…" value="${j.customer.phone || ""}"/></div>
          <div class="who-field"><label>Targa</label><input data-bind="vehicle.plate" placeholder="AB123CD" value="${j.vehicle.plate || ""}" style="text-transform:uppercase"/></div>
          <div class="who-field"><label>Veicolo</label><input data-bind="vehicle.brand" placeholder="Marca modello" value="${j.vehicle.brand || ""}"/></div>
          ${j.profile === "fleet" || j.profile === "distrib" ? html`
            <div class="who-field full"><label>P.IVA</label><input data-bind="customer.piva" placeholder="Partita IVA" value="${j.customer.piva || ""}"/></div>
          ` : ""}
        </div>

        <div class="lines">
          ${raw(tireLines)}
          ${raw(svcLines)}
          ${raw(suggested)}
          <button class="line-add" data-act="add-tire">${raw(icon("plus"))} <span style="margin-left:6px">Aggiungi pneumatico</span></button>
          <button class="line-add" data-act="add-service">${raw(icon("plus"))} <span style="margin-left:6px">Aggiungi servizio</span></button>
        </div>

        <div class="total">
          <div>
            <span class="label">Totale incl. IVA ${j.totals.vat}%</span>
            <span class="breakdown">imponibile ${eur(j.totals.sub)}</span>
          </div>
          <span class="amount">${eur(j.totals.total)}</span>
        </div>
      </div>

      <div class="doc-foot">
        <button class="ghost" data-act="back">${raw(icon("close"))}</button>
        <button class="send" data-act="sign">${raw(icon("pen"))} <span style="margin-left:8px">Firma e chiudi</span></button>
      </div>
    </section>
  `);
}

function lastDx(j) { return j.diagnoses[j.diagnoses.length - 1]; }

function renderTireLine(t) {
  return `
    <div class="line" data-line="tire:${t.id}">
      <div class="line-name">
        <span>${t.brand || "Pneumatico"} ${t.kind === "used" ? "· usato" : ""}</span>
        <small>${formatTireSize(t.size) || ""}${t.dot ? " · DOT " + t.dot : ""}${t.position && t.position !== "set" ? " · " + t.position : ""}</small>
      </div>
      <span class="line-qty">×${t.qty}</span>
      <button class="line-price" data-act="edit-line">${eur(t.priceUnit * t.qty)}</button>
    </div>
  `;
}

function renderSvcLine(s) {
  return `
    <div class="line" data-line="svc:${s.id}">
      <div class="line-name">
        <span>${s.name}</span>
        <small>${s.unit || ""}</small>
      </div>
      <span class="line-qty">×${s.qty}</span>
      <button class="line-price" data-act="edit-line">${eur(s.price * s.qty)}</button>
    </div>
  `;
}

function renderSuggestionLine(s) {
  return `
    <button class="line is-suggested" data-suggest="${s.code}" data-act="accept-suggest">
      <div class="line-name">
        <span>${s.name}</span>
        <small>tap per aggiungere · ${s.unit}</small>
      </div>
      <span class="line-qty">×${s.qty}</span>
      <span class="line-price">${eur(s.price * s.qty)}</span>
    </button>
  `;
}

function computeSuggestions(j) {
  const dx = lastDx(j);
  if (!dx) return [];
  const r = dx.result;
  const out = [];
  const have = new Set(j.services.map(s => s.code));

  // Tires count, used as the qty multiplier.
  const qty = j.tires[0]?.qty || 4;
  const truck = j.profile === "fleet";
  const m = (code) => {
    const def = SERVICES[code];
    if (!def) return;
    out.push({ code, ...def, qty });
  };

  if (r.verdict === "replace") {
    if (!have.has(truck ? "mount-truck" : "mount")) m(truck ? "mount-truck" : "mount");
    if (!have.has(truck ? "balance-truck" : "balance")) m(truck ? "balance-truck" : "balance");
    if (!have.has("disposal") && !truck) m("disposal");
  }
  // Wear patterns → alignment
  if (["shoulder-inner", "shoulder-outer", "feathering"].includes(r.wear_pattern)
      && !have.has(truck ? "alignment-truck" : "alignment")) {
    m(truck ? "alignment-truck" : "alignment");
  }
  // Cupping → suspension (no service code; advisory note only)
  // Mounting asymmetric → rebalance
  if (r.mounting_defect === "asymmetric" && !have.has(truck ? "balance-truck" : "balance")) {
    m(truck ? "balance-truck" : "balance");
  }
  return out;
}

function acceptSuggestion(code) {
  const def = SERVICES[code];
  if (!def) return;
  const j = job.get();
  const qty = j.tires[0]?.qty || 4;
  update(j => ({ ...j, services: [...j.services, { id: ulid(), code, name: def.name, unit: def.unit, price: def.price, qty }] }));
  haptic(20);
}

function openServicePicker() {
  const j = job.get();
  const allowed = PROFILES[j.profile]?.services || Object.keys(SERVICES);
  openSheet({
    title: "Aggiungi servizio",
    body: html`
      <div style="display:grid; grid-template-columns:1fr; gap:8px">
        ${raw(allowed.map(code => {
          const s = SERVICES[code];
          if (!s) return "";
          return `
            <button class="line" data-pick="${code}">
              <div class="line-name"><span>${s.name}</span><small>${s.unit}</small></div>
              <span class="line-qty">${eur(s.price)}</span>
            </button>
          `;
        }).join(""))}
      </div>
    `,
    onPick: code => {
      const s = SERVICES[code];
      if (!s) return;
      const qty = j.tires[0]?.qty || 4;
      update(j => ({ ...j, services: [...j.services, { id: ulid(), code, name: s.name, unit: s.unit, price: s.price, qty }] }));
      closeSheet();
    }
  });
}

function addTire(payload) {
  const sz = payload.sizeStr ? parseTireSize(payload.sizeStr) : null;
  const t = {
    id: ulid(),
    brand: payload.brand || "",
    size: sz,
    dot: payload.dot || "",
    eprelId: payload.eprelId || "",
    kind: payload.kind || "new",
    position: payload.position || "set",
    qty: Number(payload.qty || 4),
    priceUnit: Number(payload.priceUnit || 0),
    notes: payload.notes || ""
  };
  update(j => ({ ...j, tires: [...j.tires, t] }));
  closeSheet();
}

function editLine(lineId) {
  const [type, id] = lineId.split(":");
  const j = job.get();
  if (type === "tire") {
    const t = j.tires.find(x => x.id === id);
    if (!t) return;
    openLineSheet({ mode: "tire", initial: { ...t, sizeStr: formatTireSize(t.size) }, onSave: patch => {
      update(j => ({ ...j, tires: j.tires.map(x => x.id === id ? { ...x, ...patch, size: parseTireSize(patch.sizeStr) || x.size } : x) }));
      closeSheet();
    }, onDelete: () => { update(j => ({ ...j, tires: j.tires.filter(x => x.id !== id) })); closeSheet(); }});
  } else {
    const s = j.services.find(x => x.id === id);
    if (!s) return;
    openLineSheet({ mode: "service", initial: s, onSave: patch => {
      update(j => ({ ...j, services: j.services.map(x => x.id === id ? { ...x, ...patch } : x) }));
      closeSheet();
    }, onDelete: () => { update(j => ({ ...j, services: j.services.filter(x => x.id !== id) })); closeSheet(); }});
  }
}

function delLine(lineId) {
  editLine(lineId);
}

async function doSign() {
  await persist();
  openSignature(async () => {
    const { buildAndStorePDF } = await import("../legal/pdf.js");
    await buildAndStorePDF();
    await archive();
    const { openShareSheet } = await import("./share.js");
    openShareSheet();
  });
}

function setPath(obj, path, val) {
  const keys = path.split(".");
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]] = cur[keys[i]] || {};
  cur[keys[keys.length - 1]] = val;
  return obj;
}
