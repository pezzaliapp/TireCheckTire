export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[<>&"']/g, c =>
    ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
}

export function formatEuro(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);
}

export function formatDate(d) {
  try { return new Date(d).toLocaleDateString('it-IT'); } catch { return ''; }
}

export function formatDateTime(d) {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString('it-IT') + ' ' + dt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

export function debounce(fn, ms = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export async function compressImage(dataURL, maxW = 1280, quality = 0.85) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      const ctx = cv.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      resolve(cv.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataURL);
    img.src = dataURL;
  });
}

export function downloadBlob(content, filename, type = 'application/octet-stream') {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 800);
}

export function parseDOT(s) {
  if (!s) return null;
  const m = String(s).toUpperCase().match(/(?:DOT[^0-9]*)?(\d{2})(\d{2})\s*$/);
  if (!m) return null;
  const w = +m[1], y = +m[2];
  if (w < 1 || w > 53) return null;
  const fullYear = y < 50 ? 2000 + y : 1900 + y;
  return { dot: m[1] + m[2], week: w, year: fullYear };
}

export async function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Script load failed: ' + src));
    document.head.appendChild(s);
  });
}
