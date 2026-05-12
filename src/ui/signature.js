// Signature pad — single-gesture, no separate screen.

import { $, on, html, raw, setHTML, haptic } from "./dom.js";
import { icon } from "./icons.js";
import { job, update, persist } from "../core/job.js";
import { fetchGeo, formatGeo } from "../core/geo.js";
import { sha256 } from "../core/hash.js";
import { fmtDateTime } from "../core/format.js";

let root = null;
let cv = null;
let ctx = null;
let drawing = false;
let lastPt = null;
let dirty = false;
let onCommit = null;

function ensure() {
  if (root) return root;
  root = document.createElement("div");
  root.className = "sig";
  root.id = "sig";
  document.body.appendChild(root);
  return root;
}

export function openSignature(onCommitFn) {
  ensure();
  onCommit = onCommitFn;
  dirty = false;

  const j = job.get();
  const customer = j?.customer?.name || "il cliente";

  setHTML(root, html`
    <div class="sig-head">
      <div>
        <h2>Firma di ${customer}</h2>
        <p>${j?.vehicle?.plate || ""} · totale ${j ? new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR"}).format(j.totals.total) : ""}</p>
      </div>
      <button class="sig-x" data-act="cancel">${raw(icon("close"))}</button>
    </div>
    <div class="sig-pad-wrap">
      <canvas id="sig-canvas"></canvas>
      <div class="sig-baseline"></div>
      <div class="sig-x-mark">×</div>
    </div>
    <div class="sig-foot">
      <button class="clear" data-act="clear">Cancella</button>
      <div class="meta">
        <span>${fmtDateTime(new Date())}</span>
        <span id="sig-geo">attendo GPS…</span>
      </div>
      <button class="commit" data-act="confirm" disabled>Conferma</button>
    </div>
  `);

  cv = $("#sig-canvas", root);
  ctx = cv.getContext("2d");
  sizeCanvas();

  on(window, "resize", sizeCanvas);
  on(cv, "pointerdown", down);
  on(cv, "pointermove", move);
  on(cv, "pointerup", up);
  on(cv, "pointercancel", up);
  on(cv, "pointerleave", up);

  on(root, "click", e => {
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "clear") clear();
    if (act === "cancel") close();
    if (act === "confirm") confirm();
  });

  requestAnimationFrame(() => root.classList.add("is-open"));
  fetchGeo().then(g => {
    const el = $("#sig-geo", root);
    if (el) el.textContent = formatGeo(g);
  });
}

function sizeCanvas() {
  if (!cv) return;
  const r = cv.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  cv.width = Math.floor(r.width * dpr);
  cv.height = Math.floor(r.height * dpr);
  cv.style.width = r.width + "px";
  cv.style.height = r.height + "px";
  ctx.scale(dpr, dpr);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#f5f5f4";
  ctx.lineWidth = 2.4;
}

function localPt(e) {
  const r = cv.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}
function down(e) { drawing = true; lastPt = localPt(e); cv.setPointerCapture?.(e.pointerId); }
function move(e) {
  if (!drawing) return;
  const p = localPt(e);
  ctx.beginPath();
  ctx.moveTo(lastPt.x, lastPt.y);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  lastPt = p;
  if (!dirty) {
    dirty = true;
    const btn = $("[data-act=confirm]", root);
    if (btn) btn.disabled = false;
  }
}
function up(e) { drawing = false; lastPt = null; }
function clear() {
  ctx.clearRect(0, 0, cv.width, cv.height);
  dirty = false;
  const btn = $("[data-act=confirm]", root);
  if (btn) btn.disabled = true;
}
function close() { if (root) root.classList.remove("is-open"); }
async function confirm() {
  if (!dirty) return;
  haptic([20, 30, 20]);
  const dataUrl = cv.toDataURL("image/png");
  const hash = await sha256(dataUrl);
  const geo = await fetchGeo();
  const sig = {
    dataUrl,
    hash,
    geo,
    signedAt: new Date().toISOString(),
    signerName: job.get()?.customer?.name || "",
    userAgent: navigator.userAgent
  };
  update({ signature: sig });
  await persist();
  close();
  onCommit && onCommit();
}
