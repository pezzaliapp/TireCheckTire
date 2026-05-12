// Bay scene — the idle stage. Massive prompt, single primary action, optional resume.

import { $, on, html, raw, setHTML, haptic } from "./dom.js";
import { icon } from "./icons.js";
import { open as openCamera } from "./camera.js";
import { goto } from "./stage.js";
import { job, startJob } from "../core/job.js";
import { settings } from "../core/state.js";
import { PROFILES } from "../data/profiles.js";
import { eur, relTime } from "../core/format.js";
import { hasUsableConfig } from "../ai/providers.js";

export function mountBay() {
  const root = $("[data-scene=bay]");
  job.subscribe(() => { if (document.body.dataset.scene === "bay") render(); });
  document.addEventListener("tct:settings-saved", () => {
    if (document.body.dataset.scene === "bay") render();
  });
  render();

  on(root, "click", e => {
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "shoot") openCamera({ onShot: shoot });
    if (act === "scan") openCamera({ onShot: shoot });
    if (act === "manual") goto("quote");
    if (act === "resume") goto("quote");
    if (act === "vault") openVault();
    if (act === "configure-ai") openProviderSettings();
  });
}

async function openProviderSettings() {
  const m = await import("./settings.js");
  m.openSettingsSheet({ focus: "provider" });
}

async function shoot(s) {
  haptic(20);
  const { processShot } = await import("./diagnose.js");
  processShot(s);
}

function openVault() {
  goto("vault");
  import("./vault.js").then(m => m.renderVault());
}

function render() {
  const root = $("[data-scene=bay]");
  const j = job.get();
  const prof = PROFILES[j?.profile || settings.get("profile", "shop")] || PROFILES.shop;
  const headline = j && (j.tires.length || j.diagnoses.length)
    ? activeHeadline(j)
    : idleHeadline(prof);

  const active = j && (j.tires.length || j.diagnoses.length)
    ? renderActive(j)
    : "";

  const aiOk = hasUsableConfig();

  setHTML(root, html`
    <section class="bay">
      <div class="bay-headline">
        <span class="bay-meta"><span class="pulse"></span> ${prof.label.toUpperCase()} · IN ATTESA</span>
        ${raw(headline)}
      </div>
      <div class="bay-actions">
        ${raw(active)}
        <button class="shoot" data-act="shoot">
          <span>
            <span class="shoot-meta">SCATTA</span><br>
            Inquadra il battistrada
          </span>
          <span class="shoot-arrow">${raw(icon("camera"))}</span>
        </button>
        ${raw(aiOk ? "" : `
          <div class="ai-banner" role="alert">
            <div class="ai-banner-text">
              <span class="ai-banner-title">⚠ Configura il provider AI</span>
              <span class="ai-banner-sub">senza chiave non c'è diagnosi automatica</span>
            </div>
            <button class="ai-banner-cta" data-act="configure-ai">Configura ora</button>
          </div>
        `)}
        <div class="shoot-row">
          <button class="pill" data-act="manual">${raw(icon("receipt"))} <span style="margin-left:8px">apri preventivo</span></button>
          <button class="pill" data-act="vault">${raw(icon("vault"))} <span style="margin-left:8px">vault</span></button>
        </div>
      </div>
    </section>
  `);
}

function idleHeadline(profile) {
  const profileMessages = {
    shop:    "Scatta. <em>Decide l'AI.</em><br>Chiudi in 3 tap.",
    fleet:   "Schede mezzo,<br><em>alert sistemici,</em><br>tracciabilità per asse.",
    distrib: "Misura, EPREL,<br>portali B2B.<br><em>Tutto qui.</em>",
    rental: "Pre-consegna,<br>post-restituzione.<br><em>Foto inattaccabili.</em>",
  };
  const message = profileMessages[profile.id] || profileMessages.shop;
  const hint = {
    shop:    "Foto del battistrada → diagnosi tecnica → preventivo firmato → PDF al cliente.",
    fleet:   "Foto per ogni ruota → diagnosi per asse → scheda flotta aggiornata.",
    distrib: "Inquadra il QR EPREL o digita la misura. Il listino lo metti tu.",
    rental: "Una foto a consegna, una a restituzione. Hash datati. Il giudice ti crede."
  }[profile.id] || "";
  return `
    <h1 class="bay-prompt">${message}</h1>
    <p class="bay-hint">${hint}</p>
  `;
}

function activeHeadline(j) {
  const last = j.diagnoses[j.diagnoses.length - 1];
  return `
    <h1 class="bay-prompt">Lavoro in corso.</h1>
    <p class="bay-hint">${j.tires.length} pneum. · ${j.services.length} serv. · ${eur(j.totals.total)} ${last ? "· perizia " + (last.result.verdict === "ok" ? "OK" : last.result.verdict === "watch" ? "monitorare" : "sostituire") : ""}</p>
  `;
}

function renderActive(j) {
  return `
    <button class="bay-active" data-act="resume">
      <span class="plate">${j.vehicle.plate || "---"}</span>
      <span class="who">
        ${j.customer.name || "Nuovo cliente"}
        <small>${relTime(j.createdAt)} · ${j.tires.length + j.services.length} righe</small>
      </span>
      <span class="resume">↗ riprendi</span>
    </button>
  `;
}
