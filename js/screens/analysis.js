import { state } from '../core/state.js';
import { go } from '../core/router.js';
import { escapeHtml } from '../core/utils.js';
import { toast } from '../ui/toast.js';
import * as signature from '../modules/signature.js';
import * as pdfReport from '../modules/pdf-report.js';
import * as webhook from '../modules/webhook.js';

let sigPad = null;
let skipSignature = false;

export function mount() {
  skipSignature = false;
  sigPad = null;
  render();
}

function render() {
  const r = state.analysisResult;
  const root = document.getElementById('screen-analysis');

  if (!r) {
    root.innerHTML = `
      <div class="empty">
        <div class="empty-ico">📸</div>
        <p>Nessuna analisi caricata.</p>
        <button class="btn btn-primary" id="a-newscan">Vai alla scansione</button>
      </div>`;
    root.querySelector('#a-newscan').addEventListener('click', () => go('scan'));
    return;
  }

  const esitoIcon = { OK: '✅', ATTENZIONE: '⚠', SOSTITUIRE: '🔴' }[r.esito] || '⚠';

  root.innerHTML = `
    <div class="screen-sub">Risultato analisi</div>
    <div class="esito-badge ${r.esito}">${esitoIcon} ${escapeHtml(r.esito)}</div>

    ${r.image ? `<div class="card" style="padding:8px;margin-top:14px"><img src="${r.image}" alt="battistrada" style="width:100%;border-radius:8px"></div>` : ''}

    <div class="card">
      <div class="card-title">Dati rilevati</div>
      <div class="grid-2">
        <div><div class="field-label">Misura</div><div>${escapeHtml(r.misura || '—')}</div></div>
        <div><div class="field-label">DOT</div><div>${escapeHtml(r.dot || '—')}</div></div>
        <div><div class="field-label">Anno</div><div>${escapeHtml(r.anno_produzione || '—')}</div></div>
        <div><div class="field-label">Marca</div><div>${escapeHtml(r.marca || r.marca_gomma || '—')}</div></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Metriche</div>
      <div class="metrics">
        <div class="metric"><div class="metric-val">${r.profondita_mm != null ? r.profondita_mm + ' mm' : '—'}</div><div class="metric-lbl">Profondità</div></div>
        <div class="metric"><div class="metric-val">${escapeHtml(r.tipo_usura || '—')}</div><div class="metric-lbl">Usura</div></div>
        <div class="metric"><div class="metric-val">${escapeHtml(r.condizione_fianco || '—')}</div><div class="metric-lbl">Fianco</div></div>
        <div class="metric"><div class="metric-val">${escapeHtml(r.urgenza || '—')}</div><div class="metric-lbl">Urgenza</div></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Valutazione tecnica AI</div>
      <p style="margin:0;line-height:1.5">${escapeHtml(r.commento || '—')}</p>
    </div>

    ${(r.raccomandazioni || []).length ? `
      <div class="card">
        <div class="card-title">Raccomandazioni</div>
        <div class="row">
          ${r.raccomandazioni.map(x => `<span class="chip accent">${escapeHtml(x)}</span>`).join('')}
        </div>
      </div>` : ''}

    <div class="card">
      <div class="card-title">Firma cliente</div>
      <div class="signature-box"><canvas id="sigPad"></canvas></div>
      <div class="signature-actions">
        <button class="btn btn-secondary btn-small" id="sig-clear">Pulisci</button>
        <button class="btn btn-ghost btn-small" id="sig-skip">${skipSignature ? '✓ Senza firma' : 'Procedi senza firma'}</button>
      </div>
    </div>

    <div class="btn-stack" style="margin-top:16px">
      <button class="btn btn-primary btn-block" id="a-pdf">📄 Genera Report PDF</button>
      <button class="btn btn-secondary btn-block" id="a-quote">📋 Crea preventivo da questa analisi</button>
      <div class="btn-row">
        <button class="btn btn-secondary" id="a-webhook">📡 Webhook Make</button>
        <button class="btn btn-secondary" id="a-nearby">📍 Officine vicine</button>
      </div>
    </div>
  `;

  // bind signature
  const canvas = root.querySelector('#sigPad');
  sigPad = signature.attach(canvas);
  root.querySelector('#sig-clear').addEventListener('click', () => sigPad?.clear());
  root.querySelector('#sig-skip').addEventListener('click', () => {
    skipSignature = !skipSignature;
    document.querySelector('#sig-skip').textContent = skipSignature ? '✓ Senza firma' : 'Procedi senza firma';
  });

  root.querySelector('#a-pdf').addEventListener('click', genPDF);
  root.querySelector('#a-quote').addEventListener('click', () => {
    state.scanData = { ...r };
    go('quote');
  });
  root.querySelector('#a-webhook').addEventListener('click', send);
  root.querySelector('#a-nearby').addEventListener('click', () => go('nearby'));
}

async function genPDF() {
  if (!state.analysisResult) return;
  const hasSignature = sigPad && !sigPad.isEmpty();
  if (!hasSignature && !skipSignature) {
    return toast('Firma il documento o premi "Procedi senza firma"', 'warn');
  }
  const firma = hasSignature ? sigPad.dataURL() : null;
  try {
    const fn = await pdfReport.generate({ ...state.analysisResult, firma });
    toast('📄 PDF scaricato: ' + fn, 'success');
  } catch (e) {
    toast('Errore PDF: ' + e.message, 'error');
  }
}

async function send() {
  try {
    await webhook.send(state.analysisResult);
    toast('✅ Inviato a Make.com', 'success');
  } catch (e) {
    toast('⚠ ' + e.message, 'error');
  }
}
