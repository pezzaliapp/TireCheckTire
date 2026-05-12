// Diagnose scene — renders the AI verdict and lets the operator commit to a quote.

import { $, on, html, raw, setHTML, toast, haptic } from "./dom.js";
import { icon } from "./icons.js";
import { goto } from "./stage.js";
import { job, addDiagnosis, addShot, update, persist } from "../core/job.js";
import { diagnose as runDiagnose, hasUsableConfig, activeProvider } from "../ai/providers.js";
import { fetchGeo } from "../core/geo.js";
import { sha256 } from "../core/hash.js";
import { eur } from "../core/format.js";
import { ulid } from "../core/id.js";
import { parseTireSize, formatTireSize } from "../parsers/etrto.js";
import { openSettingsSheet } from "./settings.js";

let activeAbort = null;

export function mountDiagnoseLayer(root) {
  setHTML(root, html`
    <section class="dx" data-state="empty"></section>
  `);
}

export async function processShot(shot) {
  const blob = shot.dataUrl;
  const mimeMatch = blob.match(/^data:([^;]+);base64,(.+)$/);
  if (!mimeMatch) return;
  const mime = mimeMatch[1];
  const base64 = mimeMatch[2];

  const geo = await fetchGeo();
  const shotHash = await sha256(blob);
  const shotId = ulid();
  const stored = {
    id: shotId,
    role: shot.role,
    takenAt: new Date().toISOString(),
    dataUrl: blob,
    mime,
    geo,
    hash: shotHash,
    bytes: Math.floor((base64.length * 3) / 4)
  };
  addShot(stored);

  // Plate shots: don't run diagnosis, just OCR-by-AI for the plate.
  // Context/sidewall shots: store and let user decide.
  // Tread shots: run diagnosis.
  if (shot.role !== "tread") {
    toast(`Foto salvata · ${shot.role}`, "ok");
    return;
  }

  renderThinking(blob);
  goto("diagnose");

  if (!hasUsableConfig()) {
    renderConfigMissing();
    return;
  }

  if (activeAbort) activeAbort.abort();
  activeAbort = new AbortController();
  try {
    const j = job.get();
    const knownSize = j.tires[0]?.size ? formatTireSize(j.tires[0].size) : "";
    const known = j.diagnoses.find(d => d.shotId === shotId);
    const out = await runDiagnose({
      image: { base64, mime },
      profile: j.profile,
      knownSize,
      knownDot: j.tires[0]?.dot || "",
      vehicleHint: [j.vehicle.brand, j.vehicle.model, j.vehicle.plate].filter(Boolean).join(" "),
      position: positionLabel(j),
      signal: activeAbort.signal
    });
    const dx = {
      id: ulid(),
      shotId,
      provider: out.provider,
      model: out.model,
      elapsedMs: out.elapsedMs,
      takenAt: new Date().toISOString(),
      result: out.result,
      raw: out.raw
    };
    addDiagnosis(dx);

    autoFillTire(dx.result);
    await persist();
    renderDx(dx, stored);
  } catch (err) {
    console.error(err);
    renderError(err, stored);
  } finally {
    activeAbort = null;
  }
}

function positionLabel(j) {
  const t = j.tires[0];
  if (!t || !t.position) return "";
  return ({
    FL: "anteriore sinistro", FR: "anteriore destro",
    RL: "posteriore sinistro", RR: "posteriore destro",
    spare: "ruota di scorta", set: "treno completo"
  }[t.position] || t.position);
}

function autoFillTire(r) {
  const j = job.get();
  const sz = r.size ? parseTireSize(r.size) : null;
  const t = j.tires[0] || { id: ulid(), position: "set", qty: 4, kind: "new", priceUnit: 0 };
  if (sz && !t.size) t.size = sz;
  if (r.dot && !t.dot) t.dot = r.dot;
  if (r.build_year && !t.year) t.year = r.build_year;
  if (!j.tires[0]) update({ tires: [t] });
}

function renderThinking(thumb) {
  const root = $("[data-scene=diagnose]");
  setHTML(root, html`
    <section class="thinking">
      <div class="ring" aria-hidden="true"></div>
      <span class="label">Analisi in corso</span>
      <h2>Sto leggendo la gomma…</h2>
      <p class="hint">Profondità, pattern di usura, fianco, mounting, anno. ${raw(icon("spark"))}</p>
    </section>
  `);
}

function renderConfigMissing() {
  const root = $("[data-scene=diagnose]");
  setHTML(root, html`
    <section class="thinking">
      <h2>Manca la chiave del provider AI</h2>
      <p class="hint">Apri le impostazioni e incolla la tua chiave Gemini, OpenAI, Anthropic, Mistral o l'endpoint Ollama.</p>
      <button class="commit" data-act="open-settings" style="margin-top:24px">${raw(icon("key"))} <span>Apri impostazioni</span></button>
    </section>
  `);
  on($("[data-act=open-settings]", root), "click", () => openSettingsSheet());
}

function renderError(err, shot) {
  const root = $("[data-scene=diagnose]");
  setHTML(root, html`
    <section class="thinking">
      <h2 style="color: var(--danger)">${err.message || "Errore nella diagnosi"}</h2>
      <p class="hint">Riprova con un'altra foto, oppure controlla la chiave nelle impostazioni.</p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:24px">
        <button class="reject" data-act="retry">Riprova</button>
        <button class="commit" data-act="settings">${raw(icon("gear"))} <span>Impostazioni</span></button>
      </div>
    </section>
  `);
  on($("[data-act=retry]", root), "click", () => processShot({ role: "tread", dataUrl: shot.dataUrl }));
  on($("[data-act=settings]", root), "click", () => openSettingsSheet());
}

function verdictMeta(v) {
  return ({
    ok:      { cls: "ok",     label: "OK",            blurb: "Buone condizioni" },
    watch:   { cls: "warn",   label: "MONITORARE",    blurb: "Da rivedere a breve" },
    replace: { cls: "danger", label: "SOSTITUIRE",    blurb: "Sostituzione consigliata" },
  })[v] || { cls: "warn", label: "—", blurb: "" };
}

function wearLabel(p) {
  return ({
    uniform:          "Usura uniforme",
    center:           "Usura centrale",
    "shoulder-inner": "Usura spalla interna",
    "shoulder-outer": "Usura spalla esterna",
    feathering:       "Usura a piuma",
    cupping:          "Usura a coppe",
    patch:            "Usura localizzata",
    none:             "Nessuna anomalia",
    unclear:          "Non determinabile"
  })[p] || p;
}

function causeIcon(c) {
  return ({
    "under-inflation":    "tire",
    "over-inflation":     "tire",
    "alignment":          "car",
    "suspension":         "car",
    "aggressive-braking": "bolt",
    "load-imbalance":     "fleet",
    "age":                "history",
    "mount-error":        "gear",
    "puncture":           "spark",
    "none":               "check"
  })[c] || "spark";
}

function causeLabel(c) {
  return ({
    "under-inflation":    "Sotto-gonfiaggio cronico",
    "over-inflation":     "Sovra-gonfiaggio",
    "alignment":          "Convergenza / camber fuori specifica",
    "suspension":         "Ammortizzatori usurati",
    "aggressive-braking": "Frenate aggressive",
    "load-imbalance":     "Carico sbilanciato",
    "age":                "Pneumatico vecchio",
    "mount-error":        "Errore di montaggio",
    "puncture":           "Foratura / corpo estraneo",
    "none":               "Nessuna causa visibile"
  })[c] || c;
}

function renderDx(dx, shot) {
  const r = dx.result;
  const meta = verdictMeta(r.verdict);
  const root = $("[data-scene=diagnose]");
  setHTML(root, html`
    <section class="dx" data-verdict="${r.verdict}">
      <div class="dx-hero">
        <img src="${shot.dataUrl}" alt="" />
        <div class="shade"></div>
        <div class="verdict">
          <div>
            <small>${dx.provider} · ${dx.model}</small>
            <h1>${meta.label}</h1>
          </div>
          <span class="grade ${meta.cls}">${meta.blurb}</span>
        </div>
      </div>
      <div class="dx-body scroll">
        <div class="dx-facts">
          ${raw(fact("Profondità", r.tread_mm == null ? "—" : `${r.tread_mm} mm`, treadCls(r.tread_mm)))}
          ${raw(fact("Usura", wearLabel(r.wear_pattern)))}
          ${raw(fact("Fianco", sidewallLabel(r.sidewall), r.sidewall === "ok" ? "ok" : r.sidewall === "unclear" ? "" : "warn"))}
          ${raw(fact("Anno", r.build_year || "—"))}
          ${raw(fact("Km residui", r.remaining_km_estimate == null ? "—" : `${r.remaining_km_estimate.toLocaleString("it-IT")} km`, kmCls(r)))}
          ${raw(fact("Montaggio", mountLabel(r.mounting_defect), r.mounting_defect === "none" ? "ok" : r.mounting_defect === "unclear" ? "" : "danger"))}
        </div>

        ${r.diagnosis_summary ? html`
          <div class="dx-story">
            <span class="kicker">Quello che vedo</span>
            <p>${r.diagnosis_summary}</p>
          </div>
        ` : ""}

        ${r.root_causes.length ? html`
          <div class="dx-causes">
            <span class="kicker mono" style="font-size:11px; letter-spacing:.16em; color:var(--ink-3); text-transform:uppercase; padding-left:4px">Cause probabili</span>
            ${raw(r.root_causes.map(c => `
              <div class="dx-cause">
                <span class="ico">${icon(causeIcon(c.cause))}</span>
                <span class="label">${causeLabel(c.cause)}${c.rationale ? ` · ${c.rationale}` : ""}</span>
                <span class="conf">${c.confidence || ""}</span>
              </div>
            `).join(""))}
          </div>
        ` : ""}

        ${r.customer_explanation ? html`
          <div class="dx-talk">
            <div class="head">
              <h3>Da dire al cliente</h3>
              <button class="copy" data-act="copy-customer">${raw(icon("share"))} Copia</button>
            </div>
            <blockquote id="cust-quote">${r.customer_explanation}</blockquote>
          </div>
        ` : ""}

        ${r.technical_rebuttal ? html`
          <details style="background:var(--surface-1); border:1px solid var(--border); border-radius:var(--r-5); padding:12px 16px">
            <summary style="font-family:var(--font-mono); font-size:11px; letter-spacing:.14em; color:var(--ink-2); text-transform:uppercase; cursor:pointer">Spiegazione tecnica difendibile</summary>
            <p style="margin-top:12px; font-size:14px; line-height:1.5; color:var(--ink)">${r.technical_rebuttal}</p>
          </details>
        ` : ""}
      </div>

      <div class="dx-foot">
        <button class="reject" data-act="discard">Solo storico</button>
        <button class="commit" data-act="quote">${raw(icon("receipt"))} <span>Apri preventivo</span></button>
      </div>
    </section>
  `);

  on($("[data-act=copy-customer]", root), "click", async () => {
    const text = $("#cust-quote", root).textContent;
    await navigator.clipboard.writeText(text);
    toast("Copiato per il cliente", "ok");
    haptic(15);
  });
  on($("[data-act=quote]", root), "click", () => {
    haptic(20);
    goto("quote");
  });
  on($("[data-act=discard]", root), "click", () => goto("bay"));
}

function fact(k, v, cls = "") {
  return `<div class="dx-fact"><span class="k">${k}</span><span class="v ${cls}">${v}</span></div>`;
}
function treadCls(mm) {
  if (mm == null) return "";
  if (mm >= 4) return "ok";
  if (mm >= 2) return "warn";
  return "danger";
}
function kmCls(r) {
  if (r.remaining_km_estimate == null) return "";
  if (r.remaining_km_estimate < 3000) return "danger";
  if (r.remaining_km_estimate < 8000) return "warn";
  return "ok";
}
function sidewallLabel(s) {
  return ({ ok: "Integro", scuffed: "Graffiato", bulge: "Rigonfiamento", crack: "Crepe", puncture: "Forato", unclear: "Non determinabile" })[s] || s;
}
function mountLabel(m) {
  return ({ none: "Corretto", asymmetric: "Asimmetrico", "rotation-error": "Rotazione errata", unclear: "Non determinabile" })[m] || m;
}
