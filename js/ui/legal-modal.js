// Blocking terms-of-use modal. Shown on first launch (or when TERMS_VERSION
// bumps) and prevents interaction with the rest of the app until the user
// ticks the acceptance checkbox and confirms.
import { state, saveSettings } from '../core/state.js';
import { TERMS_VERSION, TERMS_DATE, TERMS_SECTIONS, TERMS_SHORT } from '../data/legal.js';
import { escapeHtml } from '../core/utils.js';

function renderSection(s) {
  const bodyHtml = escapeHtml(s.body)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  return `
    <section style="margin-bottom:14px">
      <h4 style="font-size:13px;font-weight:800;color:var(--accent);margin:0 0 6px;text-transform:uppercase;letter-spacing:.05em">${escapeHtml(s.title)}</h4>
      <div style="font-size:12.5px;line-height:1.5;color:var(--text)"><p>${bodyHtml}</p></div>
    </section>`;
}

export function isAccepted() {
  return state.settings.termsAccepted === TERMS_VERSION;
}

export function showIfNeeded() {
  if (isAccepted()) return Promise.resolve();
  return show();
}

export function show() {
  return new Promise((resolve) => {
    const ov = document.createElement('div');
    ov.className = 'modal-overlay open';
    ov.id = 'legal-modal-overlay';
    ov.style.zIndex = '600';
    ov.style.padding = '12px';

    ov.innerHTML = `
      <div class="modal" style="max-width:640px;width:100%;max-height:92vh;display:flex;flex-direction:column;padding:18px">
        <div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:6px">
          <h3 style="margin:0">Termini d'uso e responsabilità</h3>
          <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-2)">v${TERMS_VERSION} · ${TERMS_DATE}</span>
        </div>
        <p style="font-size:12.5px;line-height:1.45;color:var(--text-2);margin:0 0 12px">
          ${escapeHtml(TERMS_SHORT)}
        </p>
        <div id="legal-scroll" style="flex:1;overflow-y:auto;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--r-md);padding:16px;margin-bottom:14px;-webkit-overflow-scrolling:touch">
          ${TERMS_SECTIONS.map(renderSection).join('')}
          <p style="font-size:11px;color:var(--text-3);text-align:center;margin:14px 0 0">— fine documento —</p>
        </div>
        <label style="display:flex;align-items:flex-start;gap:10px;font-size:13px;line-height:1.45;cursor:pointer;margin-bottom:12px;user-select:none">
          <input type="checkbox" id="legal-check" style="margin-top:3px;flex-shrink:0;width:18px;height:18px;accent-color:var(--accent)">
          <span>Dichiaro di aver letto e di accettare integralmente i termini e la limitazione di responsabilità sopra esposti.</span>
        </label>
        <button class="btn btn-primary btn-block" id="legal-accept" disabled>Accetta e continua</button>
      </div>
    `;

    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';

    const check = ov.querySelector('#legal-check');
    const btn = ov.querySelector('#legal-accept');

    check.addEventListener('change', () => { btn.disabled = !check.checked; });

    btn.addEventListener('click', () => {
      if (!check.checked) return;
      saveSettings({ termsAccepted: TERMS_VERSION });
      document.body.style.overflow = '';
      ov.remove();
      resolve(true);
    });
  });
}
