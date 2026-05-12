// First-run profile picker. Single screen, no wizard. One choice, one tap.

import { $, on, html, raw, setHTML } from "./dom.js";
import { PROFILES } from "../data/profiles.js";
import { settings } from "../core/state.js";

export function shouldShowIntro() {
  return !settings.get("profile", null);
}

export function mountIntro(onDone) {
  const root = document.createElement("div");
  root.className = "intro";
  root.id = "intro";
  setHTML(root, html`
    <div class="intro-head">
      <span class="step">Step 1 / 1</span>
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
    <p class="intro-foot">Scelta modificabile dopo, dal command bar (⌘K → cambia profilo)</p>
  `);
  document.body.appendChild(root);
  on(root, "click", e => {
    const id = e.target.closest("[data-id]")?.dataset.id;
    if (!id) return;
    settings.set("profile", id);
    root.remove();
    onDone(id);
  });
}
