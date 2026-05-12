import { state, setMode, isAIConfigured } from '../core/state.js';
import { go } from '../core/router.js';
import { escapeHtml, formatDateTime } from '../core/utils.js';
import * as history from '../modules/history.js';
import * as scanner from '../modules/scanner.js';
import { on } from '../core/events.js';

export function render() {
  const root = document.getElementById('screen-dashboard');
  if (!root) return;

  const hello = greet();
  const office = state.settings.officina || 'TireCheckTire';
  const aiOk = isAIConfigured();

  const kpi = {
    today: history.todayCount('analysis'),
    monthQuotes: history.monthCount('quote'),
    urg: history.urgenciesOpen().length,
    last: history.lastCustomer(),
  };

  const urgencies = history.urgenciesOpen().slice(0, 4);
  const recent = history.all().slice(0, 5);

  root.innerHTML = `
    <div class="screen-sub">Suite professionale pneumatici</div>

    <div class="mode-switch" role="tablist" aria-label="Modalità">
      <button class="ms-btn ${state.mode === 'auto'  ? 'active' : ''}" data-mode="auto"  aria-pressed="${state.mode === 'auto'}">🚗 Auto</button>
      <button class="ms-btn ${state.mode === 'truck' ? 'active' : ''}" data-mode="truck" aria-pressed="${state.mode === 'truck'}">🚛 Truck</button>
    </div>

    <div class="hero">
      <div class="hello">${hello}</div>
      <div class="title">${escapeHtml(office)}</div>
      <div class="sub">Modalità: ${state.mode === 'truck' ? 'TRUCK · Fleet' : 'AUTO · gomma vettura'}</div>
    </div>

    ${!aiOk ? `
      <div class="banner warn" role="alert">
        <span>⚠</span>
        <div>Provider AI non configurato</div>
        <button class="banner-cta" id="b-config-ai">Configura</button>
      </div>` : ''}

    <div class="section">
      <div class="section-title">Azioni rapide</div>
      <div class="grid-quick">
        <button class="qa-card" data-go="scan">
          <span class="qa-ico">📸</span>
          <div><div class="qa-title">Nuova analisi AI</div><div class="qa-sub">Foto → diagnosi</div></div>
        </button>
        <button class="qa-card" data-go="quote">
          <span class="qa-ico">📋</span>
          <div><div class="qa-title">Nuovo preventivo</div><div class="qa-sub">4 step guidati</div></div>
        </button>
        <button class="qa-card" id="qa-scanner">
          <span class="qa-ico">🔍</span>
          <div><div class="qa-title">Scanner QR/EAN</div><div class="qa-sub">Inquadra il codice</div></div>
        </button>
        <button class="qa-card" data-go="nearby">
          <span class="qa-ico">📍</span>
          <div><div class="qa-title">Officine vicine</div><div class="qa-sub">OpenStreetMap</div></div>
        </button>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Panoramica</div>
      <div class="kpi">
        <div class="kpi-cell"><div class="kpi-val">${kpi.today}</div><div class="kpi-lbl">Analisi oggi</div></div>
        <div class="kpi-cell"><div class="kpi-val">${kpi.monthQuotes}</div><div class="kpi-lbl">Preventivi mese</div></div>
        <div class="kpi-cell"><div class="kpi-val">${kpi.urg}</div><div class="kpi-lbl">Urgenze aperte</div></div>
        <div class="kpi-cell"><div class="kpi-val" style="font-size:13px">${escapeHtml(kpi.last)}</div><div class="kpi-lbl">Ultimo cliente</div></div>
      </div>
    </div>

    ${urgencies.length ? `
      <div class="section">
        <div class="section-title">Urgenze recenti</div>
        ${urgencies.map(u => `
          <div class="history-item" data-id="${u.id}">
            <div class="history-thumb" style="background:rgba(255,71,87,.15);display:grid;place-items:center">⚠</div>
            <div class="history-info">
              <div class="history-title">${escapeHtml(u.targa || 'N/D')} · ${escapeHtml(u.esito)}</div>
              <div class="history-meta">${escapeHtml(u.misura || '')}${u.cliente ? ' · ' + escapeHtml(u.cliente) : ''}</div>
              <div class="history-meta">${formatDateTime(u.timestamp)}</div>
            </div>
          </div>`).join('')}
      </div>` : ''}

    <div class="section">
      <div class="section-title">Ultime attività</div>
      ${recent.length ? recent.map(r => `
        <div class="history-item" data-id="${r.id}">
          ${r.image ? `<img class="history-thumb" src="${r.image}" alt="">` : `<div class="history-thumb" style="display:grid;place-items:center">${r.kind === 'quote' ? '📋' : '📸'}</div>`}
          <div class="history-info">
            <div class="history-title">${escapeHtml(r.kind === 'quote' ? ('Preventivo ' + (r.cliente?.nome || '')) : (r.targa || 'Analisi'))}</div>
            <div class="history-meta">${escapeHtml(r.esito || (r.totale ? '€' + Number(r.totale).toFixed(2) : ''))}</div>
            <div class="history-meta">${formatDateTime(r.timestamp)}</div>
          </div>
        </div>`).join('') : `<div class="empty"><div class="empty-ico">🛞</div>Nessuna attività ancora. Inizia da una scansione.</div>`}
    </div>
  `;

  // bind
  root.querySelectorAll('.ms-btn').forEach(b => b.addEventListener('click', () => {
    setMode(b.dataset.mode);
    render();
  }));
  root.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
  const ba = root.querySelector('#b-config-ai');
  if (ba) ba.addEventListener('click', () => go('settings', { section: 'ai' }));
  root.querySelector('#qa-scanner').addEventListener('click', () => {
    scanner.open(() => go('quote'));
  });
}

function greet() {
  const h = new Date().getHours();
  if (h < 6)  return 'Buona notte 🌙';
  if (h < 13) return 'Buongiorno ☀';
  if (h < 18) return 'Buon pomeriggio 👋';
  return 'Buonasera 🌆';
}

export function mount() {
  render();
}

on('settings:changed', () => {
  if (state.currentScreen === 'dashboard') render();
});
on('mode:changed', () => {
  if (state.currentScreen === 'dashboard') render();
});
