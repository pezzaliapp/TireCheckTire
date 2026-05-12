// First-run flow. Step 1: profile picker. Step 2: AI key (Gemini default).
// Both are full-screen takeovers. Step 2 is required-by-default but skippable.

import { $, on, html, raw, setHTML, toast } from "./dom.js";
import { PROFILES } from "../data/profiles.js";
import { settings } from "../core/state.js";

export function shouldShowIntro() {
  return !settings.get("profile", null) || !settings.get("intro.aiSeen", false);
}

export function mountIntro(onDone) {
  const root = document.createElement("div");
  root.className = "intro";
  root.id = "intro";
  document.body.appendChild(root);

  let profileId = settings.get("profile", null);
  if (!profileId) renderProfileStep(root, id => {
    settings.set("profile", id);
    profileId = id;
    renderAiStep(root, () => {
      settings.set("intro.aiSeen", true);
      root.remove();
      onDone(profileId);
    });
  });
  else renderAiStep(root, () => {
    settings.set("intro.aiSeen", true);
    root.remove();
    onDone(profileId);
  });
}

function renderProfileStep(root, next) {
  setHTML(root, html`
    <div class="intro-head">
      <span class="step">Step 1 / 2</span>
      <h1>Cosa fai <em>esattamente</em>?</h1>
      <p>Tre app in una. Scegli il tuo mestiere — cambieremo solo quello che serve, niente di più.</p>
    </div>
    <div class="intro-grid">
      ${raw(Object.values(PROFILES).map(p => `
        <button class="intro-card" data-id="${p.id}">
          <span class="ico">${p.glyph}</span>
          <span class="body">
            <span class="label">${p.label}</span>
            <span class="desc">${p.description}</span>
          </span>
        </button>
      `).join(""))}
    </div>
    <p class="intro-foot">Modificabile in qualunque momento dalla topbar</p>
  `);
  on(root, "click", e => {
    const id = e.target.closest("[data-id]")?.dataset.id;
    if (!id) return;
    next(id);
  });
}

function renderAiStep(root, done) {
  const existing = settings.get("ai.key.gemini", "");
  setHTML(root, html`
    <div class="intro-head">
      <span class="step">Step 2 / 2</span>
      <h1>Aggiungi la tua <em>chiave Gemini</em>.</h1>
      <p>TireCheckTire usa la tua chiave AI personale, gratuita.<br>La chiave resta sul tuo telefono — non passa mai dai nostri server.</p>
    </div>
    <div class="intro-ai">
      <a class="intro-ai-link" id="intro-ai-link" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
        <span class="intro-ai-link-label">aistudio.google.com/apikey</span>
        <span class="intro-ai-link-arrow">↗</span>
      </a>
      <p class="intro-ai-howto">Apri il link, accedi con Google, premi “Create API key” e incolla qui sotto.</p>
      <label class="intro-ai-field">
        <span>API Key Gemini</span>
        <input id="intro-ai-key" type="password" autocomplete="off" placeholder="AIzaSy…" value="${esc(existing)}"/>
      </label>
      <button class="intro-ai-save" id="intro-ai-save">Salva e inizia</button>
      <button class="intro-ai-skip" id="intro-ai-skip">Configurerò dopo</button>
    </div>
  `);

  on($("#intro-ai-save", root), "click", () => {
    const key = ($("#intro-ai-key", root).value || "").trim();
    if (!key) {
      toast("Incolla la chiave o premi 'configurerò dopo'", "error");
      return;
    }
    settings.set("ai.provider", "gemini");
    settings.set("ai.key.gemini", key);
    settings.set("ai.model.gemini", settings.get("ai.model.gemini", "gemini-2.5-flash"));
    toast("Chiave salvata", "ok");
    done();
  });

  on($("#intro-ai-skip", root), "click", () => done());
}

function esc(s) { return s == null ? "" : String(s).replace(/"/g, "&quot;"); }
