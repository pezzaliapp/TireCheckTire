// Command bar — Linear/Raycast style. Open with the corner glyph, or "/" key, or shake.

import { $, $$, on, html, raw, setHTML, haptic } from "./dom.js";
import { icon } from "./icons.js";
import { goto } from "./stage.js";
import { openSettingsSheet } from "./settings.js";
import { open as openCamera } from "./camera.js";
import { startJob, job } from "../core/job.js";
import { settings } from "../core/state.js";
import { PROFILES } from "../data/profiles.js";

let root = null;
let activeIdx = 0;
let filtered = [];

const COMMANDS = [
  { id: "shoot",      icon: "camera",  label: "Scatta foto",            hint: "battistrada · diagnosi AI",          run: () => openCamera({ onShot: (s) => onShotGlobal(s) }), section: "Azioni" },
  { id: "new-job",    icon: "plus",    label: "Nuovo lavoro",           hint: "ripulisce il banco",                run: () => { startJob(settings.get("profile", "shop")); goto("bay"); }, section: "Azioni" },
  { id: "vault",      icon: "vault",   label: "Apri vault legale",      hint: "tutti i preventivi firmati",        run: () => openVault(), section: "Naviga" },
  { id: "current",    icon: "receipt", label: "Riprendi preventivo",    hint: "ritorna al lavoro in corso",        run: () => goto("quote"), section: "Naviga" },
  { id: "profile",    icon: "store",   label: "Cambia profilo",         hint: "gommista · fleet · distributore · noleggio", run: () => openProfileSwitch(), section: "Impostazioni" },
  { id: "settings",   icon: "gear",    label: "Provider AI · officina", hint: "key, modello, intestazione",        run: () => openSettingsSheet(), section: "Impostazioni" },
];

export function mountCommand() {
  if (root) return;
  root = document.createElement("div");
  root.className = "cmd";
  root.id = "cmd";
  document.body.appendChild(root);

  setHTML(root, html`
    <div class="cmd-sheet">
      <div class="cmd-input-wrap">
        <span class="muted">${raw(icon("search"))}</span>
        <input id="cmd-input" placeholder="Cerca o digita un comando…" autocomplete="off" />
        <span class="kbd">esc</span>
      </div>
      <div class="cmd-list scroll" id="cmd-list"></div>
    </div>
  `);

  on(root, "click", e => { if (e.target === root) close(); });
  on($("#cmd-input", root), "input", () => filterAndRender());
  on($("#cmd-input", root), "keydown", e => {
    if (e.key === "Escape") close();
    if (e.key === "Enter") activateAt(activeIdx);
    if (e.key === "ArrowDown") { activeIdx = Math.min(filtered.length - 1, activeIdx + 1); paintActive(); e.preventDefault(); }
    if (e.key === "ArrowUp")   { activeIdx = Math.max(0, activeIdx - 1); paintActive(); e.preventDefault(); }
  });
  on(root, "click", e => {
    const btn = e.target.closest("[data-cmd]");
    if (btn) activateById(btn.dataset.cmd);
  });

  on(window, "keydown", e => {
    if (e.key === "/" && !isTypingTarget(e.target)) { e.preventDefault(); open(); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(); }
  });
}

function isTypingTarget(t) {
  return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
}

export function open() {
  if (!root) mountCommand();
  $("#cmd-input").value = "";
  filtered = COMMANDS;
  activeIdx = 0;
  filterAndRender();
  requestAnimationFrame(() => {
    root.classList.add("is-open");
    setTimeout(() => $("#cmd-input").focus(), 50);
  });
}
export function close() { root && root.classList.remove("is-open"); }

function filterAndRender() {
  const q = $("#cmd-input").value.toLowerCase().trim();
  filtered = q ? COMMANDS.filter(c => (c.label + " " + c.hint).toLowerCase().includes(q)) : COMMANDS;
  activeIdx = Math.min(activeIdx, Math.max(0, filtered.length - 1));
  const sections = {};
  for (const c of filtered) (sections[c.section] = sections[c.section] || []).push(c);
  const list = $("#cmd-list");
  setHTML(list, Object.entries(sections).map(([sec, items]) => `
    <div class="cmd-section-label">${sec}</div>
    ${items.map((c, i) => `
      <button class="cmd-item" data-cmd="${c.id}" data-idx="${filtered.indexOf(c)}">
        <span class="ico">${icon(c.icon)}</span>
        <span class="lbl">${c.label}<small>${c.hint}</small></span>
        <span class="badge">↵</span>
      </button>
    `).join("")}
  `).join(""));
  paintActive();
}

function paintActive() {
  $$("#cmd-list .cmd-item", root).forEach(el => {
    el.classList.toggle("is-active", Number(el.dataset.idx) === activeIdx);
  });
}

function activateAt(idx) {
  const cmd = filtered[idx];
  if (!cmd) return;
  close();
  setTimeout(() => cmd.run(), 60);
  haptic(8);
}
function activateById(id) {
  const idx = filtered.findIndex(c => c.id === id);
  if (idx >= 0) activateAt(idx);
}

function openVault() {
  goto("vault");
  import("./vault.js").then(m => m.renderVault());
}

async function onShotGlobal(shot) {
  // Defer to diagnose module to avoid a circular dep at module load.
  const { processShot } = await import("./diagnose.js");
  processShot(shot);
}

function openProfileSwitch() {
  import("./sheet.js").then(({ openSheet, closeSheet }) => {
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
  });
}
