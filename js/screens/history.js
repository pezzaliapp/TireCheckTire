import * as history from '../modules/history.js';
import { escapeHtml, formatDateTime } from '../core/utils.js';
import { go } from '../core/router.js';
import { state } from '../core/state.js';
import { toast } from '../ui/toast.js';
import * as sheet from '../ui/sheet.js';
import * as modal from '../ui/modal.js';
import * as exportMod from '../modules/export.js';

let filter = 'all'; // all|analysis|quote
let query = '';

export function mount() {
  filter = 'all';
  query = '';
  render();
}

function render() {
  const root = document.getElementById('screen-history');
  let items = history.all();
  if (filter !== 'all') items = items.filter(x => x.kind === filter);
  if (query) {
    const q = query.toLowerCase();
    items = items.filter(x => JSON.stringify(x).toLowerCase().includes(q));
  }

  root.innerHTML = `
    <div class="screen-sub">${items.length} elementi</div>

    <div class="segmented">
      <button class="seg-opt ${filter === 'all' ? 'active' : ''}" data-f="all">Tutto</button>
      <button class="seg-opt ${filter === 'analysis' ? 'active' : ''}" data-f="analysis">Analisi</button>
      <button class="seg-opt ${filter === 'quote' ? 'active' : ''}" data-f="quote">Preventivi</button>
    </div>

    <label class="field">
      <input class="input" id="h-q" placeholder="🔍 Cerca cliente, targa, misura…" value="${escapeHtml(query)}">
    </label>

    <div class="btn-row" style="margin-bottom:14px">
      <button class="btn btn-secondary btn-small" id="h-csv">⬇ CSV</button>
      <button class="btn btn-secondary btn-small" id="h-json">⬇ JSON</button>
      <button class="btn btn-danger btn-small" id="h-clear">🗑 Pulisci</button>
    </div>

    ${items.length ? items.map(r => `
      <div class="history-item" data-id="${r.id}">
        ${r.image ? `<img class="history-thumb" src="${r.image}" alt="">` : `<div class="history-thumb" style="display:grid;place-items:center">${r.kind === 'quote' ? '📋' : '📸'}</div>`}
        <div class="history-info">
          <div class="history-title">${escapeHtml(r.kind === 'quote' ? ('Preventivo · ' + (r.cliente?.nome || '')) : (r.targa || 'Analisi'))} ${r.esito ? '· ' + escapeHtml(r.esito) : ''}</div>
          <div class="history-meta">${escapeHtml(r.misura || (r.totale ? '€' + Number(r.totale).toFixed(2) : ''))}${r.cliente ? ' · ' + escapeHtml(typeof r.cliente === 'string' ? r.cliente : r.cliente.nome || '') : ''}</div>
          <div class="history-meta">${formatDateTime(r.timestamp)}</div>
        </div>
      </div>
    `).join('') : `<div class="empty"><div class="empty-ico">🗂</div>Nessun elemento</div>`}
  `;

  root.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => { filter = b.dataset.f; render(); }));
  const q = root.querySelector('#h-q');
  q.addEventListener('input', (e) => { query = e.target.value; render(); q.focus(); });

  root.querySelector('#h-csv').addEventListener('click', () => exportMod.downloadCSV(history.all().map(flatten)));
  root.querySelector('#h-json').addEventListener('click', () => exportMod.downloadJSON({ exportedAt: new Date().toISOString(), items: history.all() }));
  root.querySelector('#h-clear').addEventListener('click', async () => {
    if (await modal.confirm('Eliminare TUTTO lo storico?', 'Conferma')) {
      history.clear();
      toast('Storico svuotato', 'success');
      render();
    }
  });

  root.querySelectorAll('.history-item').forEach(it => it.addEventListener('click', () => openDetail(it.dataset.id)));
}

function flatten(r) {
  return {
    id: r.id,
    kind: r.kind,
    timestamp: r.timestamp,
    esito: r.esito || '',
    urgenza: r.urgenza || '',
    targa: r.targa || r.cliente?.targa || '',
    cliente: typeof r.cliente === 'string' ? r.cliente : (r.cliente?.nome || ''),
    misura: r.misura || '',
    dot: r.dot || '',
    marca: r.marca || r.marca_gomma || '',
    totale: r.totale || '',
    commento: (r.commento || '').replace(/\s+/g, ' ').slice(0, 200),
  };
}

function openDetail(id) {
  const r = history.get(id);
  if (!r) return;
  sheet.open({
    title: r.kind === 'quote' ? 'Preventivo' : 'Analisi',
    subtitle: formatDateTime(r.timestamp),
    bodyHTML: `
      ${r.image ? `<img src="${r.image}" style="width:100%;border-radius:8px;margin-bottom:10px">` : ''}
      <div style="color:var(--text-2);font-size:13px;line-height:1.5">
        ${Object.entries(flatten(r)).map(([k, v]) => v ? `<div><b style="color:var(--text)">${k}:</b> ${escapeHtml(v)}</div>` : '').join('')}
      </div>
    `,
    footerHTML: `
      <div class="btn-row">
        <button class="btn btn-secondary" id="d-open">Apri</button>
        <button class="btn btn-danger" id="d-del">Elimina</button>
      </div>
    `,
  });
  document.getElementById('d-open').addEventListener('click', () => {
    sheet.close();
    if (r.kind === 'analysis') {
      state.analysisResult = r;
      go('analysis');
    } else {
      toast('Preventivo aperto — duplica per modificarlo', 'info');
    }
  });
  document.getElementById('d-del').addEventListener('click', async () => {
    if (await modal.confirm('Eliminare questo elemento?')) {
      history.remove(id);
      sheet.close();
      render();
    }
  });
}
