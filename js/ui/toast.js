function ensureWrap() {
  let w = document.getElementById('toast-wrap');
  if (!w) {
    w = document.createElement('div');
    w.id = 'toast-wrap';
    w.className = 'toast-wrap';
    document.body.appendChild(w);
  }
  return w;
}

export function toast(message, kind = 'info', timeout = 2600) {
  const w = ensureWrap();
  const t = document.createElement('div');
  t.className = 'toast ' + (kind || '');
  t.textContent = message;
  w.appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity .25s ease';
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 280);
  }, timeout);
}
