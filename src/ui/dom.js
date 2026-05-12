// DOM micro-helpers. Tagged template literal for safe HTML construction.

export function $(sel, root = document) { return root.querySelector(sel); }
export function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

export function on(el, ev, fn, opts) { el.addEventListener(ev, fn, opts); return () => el.removeEventListener(ev, fn, opts); }

const escapeMap = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export function escapeHtml(s) {
  if (s == null) return "";
  return String(s).replace(/[&<>"']/g, c => escapeMap[c]);
}

// Tagged template — string interpolations are HTML-escaped; raw()/nested html()/arrays pass through.
export function html(strings, ...values) {
  let out = "";
  for (let i = 0; i < strings.length; i++) {
    out += strings[i];
    if (i < values.length) {
      const v = values[i];
      if (v == null || v === false) continue;
      if (Array.isArray(v)) out += v.map(x => x && x.__raw ? x.html : escapeHtml(x)).join("");
      else if (typeof v === "object" && v.__raw) out += v.html;
      else out += escapeHtml(v);
    }
  }
  return { __raw: true, html: out, toString() { return out; } };
}

export const raw = h => {
  if (h && typeof h === "object" && h.__raw) return h;
  return { __raw: true, html: String(h ?? ""), toString() { return String(h ?? ""); } };
};

export function setHTML(el, h) {
  el.innerHTML = h && typeof h === "object" && h.__raw ? h.html : (h ?? "");
  return el;
}

export function toast(message, kind = "") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.className = "toast" + (kind ? " is-" + kind : "");
  t.textContent = message;
  requestAnimationFrame(() => t.classList.add("is-show"));
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("is-show"), 2400);
}

// Haptic — optional, no-op when not supported.
export function haptic(pattern = 10) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}
