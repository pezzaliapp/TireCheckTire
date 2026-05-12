// Bottom sheet
let activeSheet = null;

export function open({ title = '', subtitle = '', bodyHTML = '', footerHTML = '', onClose } = {}) {
  close();
  const ov = document.createElement('div');
  ov.className = 'sheet-overlay open';
  const sh = document.createElement('div');
  sh.className = 'sheet';
  sh.innerHTML = `
    <div class="sheet-handle"></div>
    ${(title || subtitle) ? `<div class="sheet-head"><div class="sheet-title">${title}</div>${subtitle ? `<div class="sheet-sub">${subtitle}</div>` : ''}</div>` : ''}
    <div class="sheet-body">${bodyHTML}</div>
    ${footerHTML ? `<div class="sheet-foot">${footerHTML}</div>` : ''}
  `;
  document.body.appendChild(ov);
  document.body.appendChild(sh);
  // animate open
  requestAnimationFrame(() => sh.classList.add('open'));

  const closeFn = () => { close(); if (onClose) onClose(); };
  ov.addEventListener('click', closeFn);

  activeSheet = { ov, sh, closeFn };
  return { el: sh, close: closeFn };
}

export function close() {
  if (!activeSheet) return;
  const { ov, sh } = activeSheet;
  sh.classList.remove('open');
  setTimeout(() => { sh.remove(); ov.remove(); }, 250);
  activeSheet = null;
}
