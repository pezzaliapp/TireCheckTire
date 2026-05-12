// TireCheckTire — entry.

import { settings } from "./core/state.js";
import { stage, goto, applyToDOM } from "./ui/stage.js";
import { mountBay } from "./ui/bay.js";
import { mountCameraLayer } from "./ui/camera.js";
import { mountDiagnoseLayer } from "./ui/diagnose.js";
import { mountQuote } from "./ui/quote.js";
import { mountCommand, open as openCommand } from "./ui/command.js";
import { ensureSheet } from "./ui/sheet.js";
import { startJob, job } from "./core/job.js";
import { mountIntro, shouldShowIntro } from "./ui/intro.js";
import { icon } from "./ui/icons.js";
import { html, raw, setHTML, on } from "./ui/dom.js";
import { PROFILES } from "./data/profiles.js";

bootstrap();

function bootstrap() {
  installShell();
  registerSW();
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
      <header class="chrome">
        <div class="brand">
          <span class="dot" aria-hidden="true"></span>
          <span class="name">TireCheckTire</span>
          <span class="profile" id="ch-profile">—</span>
        </div>
        <div class="chrome-side">
          <button class="glyph-btn" id="ch-cmd" aria-label="Comandi">${raw(icon("search"))}</button>
          <button class="glyph-btn" id="ch-vault" aria-label="Vault">${raw(icon("vault"))}</button>
          <button class="glyph-btn" id="ch-set" aria-label="Impostazioni">${raw(icon("gear"))}</button>
        </div>
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
    </div>
  `);

  mountCameraLayer(document.querySelector("[data-scene=capture]"));
  mountDiagnoseLayer(document.querySelector("[data-scene=diagnose]"));
  mountBay();
  mountQuote();
  mountCommand();
  ensureSheet();

  on(document.getElementById("ch-cmd"), "click", () => openCommand());
  on(document.getElementById("ch-vault"), "click", async () => {
    goto("vault");
    const m = await import("./ui/vault.js");
    m.renderVault();
  });
  on(document.getElementById("ch-set"), "click", async () => {
    const m = await import("./ui/settings.js");
    m.openSettingsSheet();
  });

  applyToDOM();
}

function boot(profileId) {
  document.getElementById("ch-profile").textContent = PROFILES[profileId]?.label || profileId;
  if (!job.get()) startJob(profileId);
  goto("bay");
}

function registerSW() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
