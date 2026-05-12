// Camera capture. getUserMedia, environment-facing by default. Falls back to file picker.

import { $, $$, on, html, raw, setHTML, haptic, toast } from "./dom.js";
import { icon } from "./icons.js";
import { goto } from "./stage.js";

let stream = null;
let video = null;
let currentRole = "tread";
let facing = "environment";
let onCapture = null;

const ROLES = [
  { id: "tread",    label: "Battistrada" },
  { id: "sidewall", label: "Fianco" },
  { id: "plate",    label: "Targa" },
  { id: "context",  label: "Veicolo" },
];

export function mountCameraLayer(root) {
  setHTML(root, html`
    <div class="cam" id="cam">
      <video id="cam-video" autoplay playsinline muted></video>
      <div class="flash" id="cam-flash"></div>
      <div class="cam-overlay">
        <div class="cam-top">
          <button class="cam-x" data-act="close" aria-label="Chiudi">${raw(icon("close"))}</button>
          <div class="cam-hint" id="cam-hint">Inquadra il battistrada — luce frontale</div>
          <div class="cam-stack" id="cam-stack"></div>
        </div>
        <div class="cam-frame" aria-hidden="true"></div>
        <div class="cam-bottom">
          <div class="cam-roles" role="tablist">
            ${raw(ROLES.map(r => `<button data-role="${r.id}" class="${r.id === "tread" ? "is-on" : ""}">${r.label}</button>`).join(""))}
          </div>
          <button class="cam-shutter" data-act="shoot" aria-label="Scatta"></button>
          <button class="cam-flip" data-act="flip" aria-label="Inverti camera">${raw(icon("flip"))}</button>
        </div>
      </div>
    </div>
  `);

  on(root, "click", e => {
    const act = e.target.closest("[data-act]")?.dataset.act;
    const role = e.target.closest("[data-role]")?.dataset.role;
    if (role) {
      currentRole = role;
      $$(".cam-roles button", root).forEach(b => b.classList.toggle("is-on", b.dataset.role === role));
      $("#cam-hint", root).textContent = roleHint(role);
      haptic(6);
    }
    if (act === "shoot") shoot();
    if (act === "flip") flip();
    if (act === "close") close();
  });
}

function roleHint(role) {
  switch (role) {
    case "tread":    return "Inquadra il battistrada — luce frontale";
    case "sidewall": return "Fianco intero — leggibile il DOT";
    case "plate":    return "Inquadra la targa per intero";
    case "context":  return "Tutta l'auto, posizionata bene";
    default:         return "";
  }
}

export async function open({ onShot } = {}) {
  onCapture = onShot;
  goto("capture");
  await start();
}

export async function close() {
  stop();
  goto("bay");
}

async function start() {
  video = $("#cam-video");
  if (!video) return;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false
    });
    video.srcObject = stream;
  } catch (err) {
    toast("Camera non disponibile · uso file picker", "error");
    pickFile();
  }
}

function stop() {
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  if (video) { video.srcObject = null; video = null; }
}

async function flip() {
  facing = facing === "environment" ? "user" : "environment";
  stop();
  await start();
}

async function shoot() {
  if (!video || !stream) return pickFile();
  const flash = $("#cam-flash");
  flash.classList.add("is-firing");
  setTimeout(() => flash.classList.remove("is-firing"), 320);
  haptic(20);

  const w = video.videoWidth || 1280;
  const h = video.videoHeight || 720;
  const c = document.createElement("canvas");
  // Cap long edge to 1600 — quality plenty, payload small.
  const maxEdge = 1600;
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  c.width = Math.round(w * scale);
  c.height = Math.round(h * scale);
  c.getContext("2d").drawImage(video, 0, 0, c.width, c.height);
  const dataUrl = c.toDataURL("image/jpeg", 0.85);
  appendThumb(dataUrl);
  onCapture && onCapture({ role: currentRole, dataUrl });
}

function appendThumb(src) {
  const stack = $("#cam-stack");
  const img = new Image();
  img.src = src;
  stack.prepend(img);
  while (stack.children.length > 3) stack.lastElementChild.remove();
}

function pickFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "environment";
  input.onchange = () => {
    const f = input.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => onCapture && onCapture({ role: currentRole, dataUrl: r.result });
    r.readAsDataURL(f);
  };
  input.click();
}
