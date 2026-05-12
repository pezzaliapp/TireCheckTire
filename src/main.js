// TireCheckTire — entry.

import { settings } from "./core/state.js";
import { stage, goto, applyToDOM } from "./ui/stage.js";
import { mountBay } from "./ui/bay.js";
import { mountCameraLayer } from "./ui/camera.js";
import { mountDiagnoseLayer } from "./ui/diagnose.js";
import { mountQuote } from "./ui/quote.js";
import { mountCommand, open as openCommand } from "./ui/command.js";
import { ensureSheet, openSheet, closeSheet } from "./ui/sheet.js";
import { startJob, job } from "./core/job.js";
import { mountIntro, shouldShowIntro } from "./ui/intro.js";
import { icon } from "./ui/icons.js";
import { html, raw, setHTML, on } from "./ui/dom.js";
import { PROFILES } from "./data/profiles.js";
import { PROVIDERS, activeProviderId, hasUsableConfig } from "./ai/providers.js";

bootstrap();

function bootstrap() {
  installShell();
  registerSW();
  bumpLaunchCount();
  if (shouldShowIntro()) {
    mountIntro(profileId => boot(profileId));
  } else {
    boot(settings.get("profile", "shop"));
  }
}

function installShell() {
  const root = document.getElementById("app");
  setHTML(root, html`
    <div class="app-root">
      <header class="topbar" id="topbar">
        <button class="tb-profile" id="tb-profile" aria-label="Cambia profilo">
          <span class="tb-profile-glyph" id="tb-profile-glyph" aria-hidden="true"></span>
          <span class="tb-profile-name" id="tb-profile-name">—</span>
          <span class="tb-chevron" aria-hidden="true">▾</span>
        </button>
        <button class="tb-ai" id="tb-ai" aria-label="Stato AI">
          <span class="tb-ai-dot" id="tb-ai-dot" aria-hidden="true"></span>
          <span class="tb-ai-label" id="tb-ai-label">—</span>
        </button>
        <button class="tb-gear" id="tb-gear" aria-label="Impostazioni">${raw(icon("gear"))}</button>
      </header>
      <main class="stage">
        <div class="scene">
          <section class="layer is-active" data-scene="bay"></section>
          <section class="layer" data-scene="capture"></section>
          <section class="layer" data-scene="diagnose"></section>
          <section class="layer" data-scene="quote"></section>
          <section class="layer" data-scene="vault"></section>
          <section class="layer" data-scene="entry"></section>
        </div>
      </main>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>
      <button class="cmd-hint" id="cmd-hint" hidden type="button" aria-label="Apri comandi rapidi">
        <span class="kbd">⌘K</span><span class="kbd">/</span>
        <span class="cmd-hint-label">comandi rapidi</span>
      </button>
    </div>
  `);

  mountCameraLayer(document.querySelector("[data-scene=capture]"));
  mountDiagnoseLayer(document.querySelector("[data-scene=diagnose]"));
  mountBay();
  mountQuote();
  mountCommand();
  ensureSheet();

  on(document.getElementById("tb-profile"), "click", openProfileSwitch);
  on(document.getElementById("tb-ai"), "click", openProviderSettings);
  on(document.getElementById("tb-gear"), "click", async () => {
    const m = await import("./ui/settings.js");
    m.openSettingsSheet();
  });

  // AI badge re-renders whenever localStorage changes (settings save, cross-tab).
  window.addEventListener("storage", e => {
    if (e.key && e.key.startsWith("tct.ai.")) renderAiBadge();
  });
  // Re-render badge whenever a settings sheet may have closed.
  document.addEventListener("tct:settings-saved", renderAiBadge);

  applyToDOM();
  renderAiBadge();
  maybeShowCmdHint();
}

function renderProfileChip(profileId) {
  const p = PROFILES[profileId] || PROFILES.shop;
  const nameEl = document.getElementById("tb-profile-name");
  const glyphEl = document.getElementById("tb-profile-glyph");
  if (nameEl) nameEl.textContent = p.label;
  if (glyphEl) glyphEl.innerHTML = p.glyph || "";
}

export function renderAiBadge() {
  const dot = document.getElementById("tb-ai-dot");
  const label = document.getElementById("tb-ai-label");
  const btn = document.getElementById("tb-ai");
  if (!dot || !label || !btn) return;
  const ok = hasUsableConfig();
  const providerId = activeProviderId();
  const p = PROVIDERS[providerId];
  if (ok) {
    dot.className = "tb-ai-dot is-ok";
    label.textContent = (p && p.label) ? shortProviderName(p.label) : "AI";
    btn.classList.remove("is-warn");
    btn.classList.add("is-ok");
  } else {
    dot.className = "tb-ai-dot is-warn";
    label.textContent = "AI non configurata";
    btn.classList.remove("is-ok");
    btn.classList.add("is-warn");
  }
}

function shortProviderName(label) {
  // "Google Gemini" → "Gemini". "OpenAI GPT" → "OpenAI".
  if (/gemini/i.test(label)) return "Gemini";
  if (/openai/i.test(label)) return "OpenAI";
  if (/anthropic/i.test(label)) return "Claude";
  if (/mistral/i.test(label)) return "Mistral";
  if (/ollama/i.test(label)) return "Ollama";
  return label;
}

async function openProviderSettings() {
  const m = await import("./ui/settings.js");
  m.openSettingsSheet({ focus: "provider" });
}

function openProfileSwitch() {
  openSheet({
    title: "Cambia profilo",
    body: Object.values(PROFILES).map(p => `
      <button class="intro-card" data-pick="${p.id}" style="margin-bottom:8px; width:100%">
        <span class="ico">${p.glyph}</span>
        <span class="body"><span class="label">${p.label}</span><span class="desc">${p.description}</span></span>
      </button>
    `).join(""),
    onPick: id => {
      settings.set("profile", id);
      closeSheet();
      location.reload();
    }
  });
}

function bumpLaunchCount() {
  const n = settings.get("ui.launchCount", 0);
  settings.set("ui.launchCount", n + 1);
}

function maybeShowCmdHint() {
  const launches = settings.get("ui.launchCount", 1);
  const hint = document.getElementById("cmd-hint");
  if (!hint) return;
  on(hint, "click", () => {
    openCommand();
    hint.classList.remove("is-show");
    setTimeout(() => { hint.hidden = true; }, 320);
  });
  if (launches > 3) return;
  hint.hidden = false;
  requestAnimationFrame(() => hint.classList.add("is-show"));
  setTimeout(() => {
    hint.classList.remove("is-show");
    setTimeout(() => { hint.hidden = true; }, 320);
  }, 6500);
}

function boot(profileId) {
  renderProfileChip(profileId);
  if (!job.get()) startJob(profileId);
  goto("bay");
  renderAiBadge();
}

function registerSW() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
