// Vault — the legal history.

import { $, $$, on, html, raw, setHTML } from "./dom.js";
import { icon } from "./icons.js";
import { jobs as jobStore } from "../core/db.js";
import { eur, fmtDateTime, relTime } from "../core/format.js";
import { goto } from "./stage.js";
import { loadJob } from "../core/job.js";

export async function renderVault() {
  const root = $("[data-scene=vault]");
  setHTML(root, html`
    <section class="vault">
      <header class="vault-head">
        <span class="kicker">Vault legale</span>
        <h1>Tutto quello che hai firmato.</h1>
        <p>Documenti hash-firmati, foto datate e geolocalizzate, perizia AI dichiarata. Pronti per il giudice.</p>
      </header>
      <label class="vault-search">
        ${raw(icon("search"))}
        <input id="vault-q" placeholder="Targa, cliente, importo…"/>
      </label>
      <div class="vault-list scroll" id="vault-list">${raw(spinner())}</div>
    </section>
  `);
  const all = await jobStore.all();
  paint(all);
  on($("#vault-q", root), "input", e => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) return paint(all);
    paint(all.filter(j => {
      const txt = (j.vehicle.plate + " " + j.customer.name + " " + j.vehicle.brand + " " + j.vehicle.model).toLowerCase();
      return txt.includes(q);
    }));
  });
}

function paint(items) {
  const list = $("#vault-list");
  if (!items.length) {
    setHTML(list, html`
      <div class="empty-vault">
        ${raw(icon("vault", 64))}
        <h3>Vault vuoto</h3>
        <p>Quando firmerai il primo preventivo, comparirà qui — con tutte le prove allegate.</p>
      </div>
    `);
    return;
  }
  setHTML(list, items.map(entry).join(""));
  $$(".entry", list).forEach(el => {
    on(el, "click", async () => {
      const id = el.dataset.id;
      const j = items.find(x => x.id === id);
      if (!j) return;
      loadJob(j);
      const { renderEntry } = await import("./entry.js");
      goto("entry");
      renderEntry(j);
    });
  });
}

function entry(j) {
  const last = j.diagnoses[j.diagnoses.length - 1]?.result;
  const status = j.status === "signed" ? "signed" : j.status === "quoted" ? "quoted" : "open";
  const statusCls = status === "signed" ? "ok" : status === "quoted" ? "warn" : "";
  const statusLabel = status === "signed" ? "Firmato" : status === "quoted" ? "In preventivo" : "Aperto";
  return `
    <button class="entry" data-id="${j.id}">
      <span class="plate">${j.vehicle.plate || "—"}</span>
      <div class="info">
        <span class="who">${j.customer.name || "Cliente"}</span>
        <small>${relTime(j.createdAt)} · ${j.tires.length} pneum. · ${j.services.length} serv.</small>
      </div>
      <div class="right">
        <span class="amt">${eur(j.totals.total)}</span>
        <span class="status ${statusCls}">${statusLabel}</span>
      </div>
    </button>
  `;
}

function spinner() {
  return `<div class="thinking" style="height:200px"><div class="ring"></div></div>`;
}
