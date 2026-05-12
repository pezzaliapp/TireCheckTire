import { state, setMode, isAIConfigured } from '../core/state.js';
import { go } from '../core/router.js';
import { escapeHtml, readFileAsDataURL, compressImage } from '../core/utils.js';
import { toast } from '../ui/toast.js';
import * as providerSys from '../ai/provider.js';
import { analysisPrompt, ocrSidewallPrompt } from '../ai/prompts.js';
import { normalizeAnalysis, normalizeOCR, tryParseJSON } from '../ai/normalize.js';
import * as history from '../modules/history.js';
import { POSIZIONI_AUTO, TIPI_MEZZO_TRUCK, TIPI_ASSE, POSIZIONI_TRUCK, LATI_TRUCK, MONTAGGIO_TRUCK } from '../data/vehicle-types.js';

const draft = {
  battistrada: null,
  fianco: null,
  ocr: null,
  data: {},
};

export function mount() {
  // reset preserva immagini se l'utente torna alla schermata
  render();
}

function render() {
  const root = document.getElementById('screen-scan');
  const mode = state.mode;

  root.innerHTML = `
    <div class="screen-sub">Diagnosi AI · ${mode === 'truck' ? 'Truck/Fleet' : 'Auto'}</div>
    <div class="mode-switch" style="margin-bottom:14px">
      <button class="ms-btn ${mode === 'auto'  ? 'active' : ''}" data-mode="auto">🚗 Auto</button>
      <button class="ms-btn ${mode === 'truck' ? 'active' : ''}" data-mode="truck">🚛 Truck</button>
    </div>

    ${!isAIConfigured() ? `
      <div class="banner warn">
        <span>⚠</span>
        <div>Provider AI non configurato. <a href="#settings">Configura</a> per analizzare con AI.</div>
      </div>` : ''}

    <div class="section">
      <div class="section-title">Foto</div>
      <div class="grid-2">
        ${slot('battistrada', '📷 Battistrada', draft.battistrada)}
        ${slot('fianco', '🔎 Fianco (DOT/misura)', draft.fianco)}
      </div>
      <input type="file" accept="image/*" capture="environment" id="file-battistrada" style="display:none">
      <input type="file" accept="image/*" capture="environment" id="file-fianco" style="display:none">
    </div>

    <div id="ocr-banner" class="banner info hidden">
      <span class="spinner" style="width:18px;height:18px"></span>
      <div id="ocr-text">Lettura fianco in corso…</div>
    </div>

    <div class="section">
      <div class="section-title">Dati pneumatico</div>
      <div class="grid-2">
        ${labelInput('Misura ETRTO', 'f-misura', draft.data.misura, mode === 'truck' ? '315/80 R22.5' : '205/55 R16')}
        ${labelInput('DOT', 'f-dot', draft.data.dot, '2324')}
      </div>
      <div class="grid-2">
        ${labelInput('Marca', 'f-marca', draft.data.marca, 'Michelin')}
        ${mode === 'truck' ? labelInput('Pressione (bar)', 'f-pressione', draft.data.pressione, '8.5') : labelInput('Anno', 'f-anno', draft.data.anno, '2024')}
      </div>
      <label class="field">
        <div class="field-label">Note</div>
        <textarea class="textarea" id="f-note" rows="2" placeholder="Note operatore">${escapeHtml(draft.data.note || '')}</textarea>
      </label>
    </div>

    <div class="section">
      <div class="section-title">Dati mezzo</div>
      ${mode === 'truck' ? truckFields() : autoFields()}
    </div>

    <div class="btn-stack" style="margin-top:20px">
      <button class="btn btn-primary btn-block" id="btn-analyze" ${(!draft.battistrada || !isAIConfigured()) ? 'disabled' : ''}>🤖 Analizza con AI</button>
      <button class="btn btn-ghost btn-block" id="btn-skip-ai">Salta AI · Inserisci a mano</button>
    </div>
  `;

  bind();
}

function slot(id, label, img) {
  return `
    <div class="photo-slot" data-slot="${id}">
      ${img ? `<img src="${img}" alt=""><div class="ps-badge ok">${id === 'battistrada' ? 'Battistrada' : 'Fianco'} ✓</div>` :
              `<div style="text-align:center"><div class="ps-ico">📷</div><div class="ps-lbl">${label}</div></div>`}
    </div>`;
}

function labelInput(label, id, val, ph) {
  return `<label class="field"><div class="field-label">${label}</div><input class="input" id="${id}" type="text" value="${escapeHtml(val || '')}" placeholder="${escapeHtml(ph)}"></label>`;
}

function autoFields() {
  return `
    <div class="grid-2">
      ${labelInput('Targa', 'f-targa', draft.data.targa, 'AB123CD')}
      ${labelInput('Marca veicolo', 'f-veicolo', draft.data.marca_veicolo, 'Fiat')}
    </div>
    <div class="grid-2">
      <label class="field"><div class="field-label">Posizione</div>
        <select class="select" id="f-posizione">
          ${POSIZIONI_AUTO.map(p => `<option ${draft.data.posizione === p ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
      </label>
      ${labelInput('Cliente', 'f-cliente', draft.data.cliente, 'Mario Rossi')}
    </div>
  `;
}

function truckFields() {
  return `
    <div class="grid-2">
      ${labelInput('Targa', 'f-targa', draft.data.targa, 'AB123CD')}
      <label class="field"><div class="field-label">Tipo mezzo</div>
        <select class="select" id="f-tipo-mezzo">
          ${TIPI_MEZZO_TRUCK.map(t => `<option ${draft.data.tipo_mezzo === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </label>
    </div>
    <div class="grid-2">
      <label class="field"><div class="field-label">Asse</div>
        <select class="select" id="f-posizione">
          ${POSIZIONI_TRUCK.map(t => `<option ${draft.data.posizione === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </label>
      <label class="field"><div class="field-label">Lato/ruota</div>
        <select class="select" id="f-lato">
          ${LATI_TRUCK.map(t => `<option ${draft.data.lato === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </label>
    </div>
    <div class="grid-2">
      <label class="field"><div class="field-label">Tipo asse</div>
        <select class="select" id="f-tipo-asse">
          ${TIPI_ASSE.map(t => `<option ${draft.data.tipo_asse === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </label>
      <label class="field"><div class="field-label">Montaggio</div>
        <select class="select" id="f-montaggio">
          ${MONTAGGIO_TRUCK.map(t => `<option ${draft.data.montaggio === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </label>
    </div>
    <div class="grid-2">
      ${labelInput('Marca mezzo', 'f-veicolo', draft.data.marca_veicolo, 'Iveco')}
      ${labelInput('Km mezzo', 'f-km', draft.data.km_mezzo, '320000')}
    </div>
    ${labelInput('Cliente / Flotta', 'f-cliente', draft.data.cliente, 'Logistica SRL')}
  `;
}

function bind() {
  const root = document.getElementById('screen-scan');
  root.querySelectorAll('.ms-btn').forEach(b => b.addEventListener('click', () => {
    setMode(b.dataset.mode);
    render();
  }));
  root.querySelectorAll('.photo-slot').forEach(s => {
    s.addEventListener('click', () => {
      const id = s.dataset.slot;
      document.getElementById('file-' + id).click();
    });
  });
  ['battistrada', 'fianco'].forEach(slot => {
    const inp = document.getElementById('file-' + slot);
    inp.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const raw = await readFileAsDataURL(file);
      const compressed = await compressImage(raw, 1280, 0.85);
      if (slot === 'battistrada') draft.battistrada = compressed;
      else draft.fianco = compressed;
      render();
      if (slot === 'fianco' && isAIConfigured()) runOCR();
    });
  });
  document.getElementById('btn-analyze').addEventListener('click', analyze);
  document.getElementById('btn-skip-ai').addEventListener('click', () => {
    captureFields();
    state.scanData = { ...draft.data, mode: state.mode, image: draft.battistrada, image_sidewall: draft.fianco };
    go('quote');
  });
}

function captureFields() {
  const get = id => document.getElementById(id)?.value.trim() || '';
  draft.data.misura = get('f-misura');
  draft.data.dot = get('f-dot');
  draft.data.marca = get('f-marca');
  draft.data.note = get('f-note');
  draft.data.targa = get('f-targa').toUpperCase();
  draft.data.cliente = get('f-cliente');
  draft.data.marca_veicolo = get('f-veicolo');
  if (state.mode === 'truck') {
    draft.data.tipo_mezzo = get('f-tipo-mezzo');
    draft.data.posizione = get('f-posizione');
    draft.data.lato = get('f-lato');
    draft.data.tipo_asse = get('f-tipo-asse');
    draft.data.montaggio = get('f-montaggio');
    draft.data.km_mezzo = get('f-km');
    draft.data.pressione = get('f-pressione');
  } else {
    draft.data.posizione = get('f-posizione');
    draft.data.anno = get('f-anno');
  }
}

async function runOCR() {
  const banner = document.getElementById('ocr-banner');
  const text = document.getElementById('ocr-text');
  banner.classList.remove('hidden');
  text.textContent = 'Lettura fianco in corso…';
  try {
    const raw = await providerSys.generate({
      prompt: ocrSidewallPrompt(),
      image: draft.fianco,
      settings: state.settings,
      generationConfig: { maxOutputTokens: 300, temperature: 0.1 },
    });
    const ocr = normalizeOCR(tryParseJSON(raw) || raw);
    draft.ocr = ocr;
    // pre-fill se vuoti
    if (ocr.misura && !document.getElementById('f-misura').value) document.getElementById('f-misura').value = ocr.misura;
    if (ocr.dot && !document.getElementById('f-dot').value) document.getElementById('f-dot').value = ocr.dot;
    if (ocr.marca && !document.getElementById('f-marca').value) document.getElementById('f-marca').value = ocr.marca;
    text.textContent = `✓ OCR completata · leggibilità ${ocr.leggibilita}`;
    setTimeout(() => banner.classList.add('hidden'), 4000);
  } catch (e) {
    text.textContent = '⚠ OCR fallita: ' + e.message;
    setTimeout(() => banner.classList.add('hidden'), 5000);
  }
}

async function analyze() {
  if (!draft.battistrada) return toast('Scatta prima la foto del battistrada', 'warn');
  if (!isAIConfigured()) return toast('Configura prima il provider AI', 'warn');
  captureFields();

  const btn = document.getElementById('btn-analyze');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Analisi in corso…';
  toast('🤖 Analisi AI in corso…');

  try {
    const prompt = analysisPrompt({
      mode: state.mode,
      context: {
        misura: draft.data.misura,
        dot: draft.data.dot,
        tipoMezzo: draft.data.tipo_mezzo,
        tipoAsse: draft.data.tipo_asse,
        montaggio: draft.data.montaggio,
        posizione: draft.data.posizione,
      },
    });
    const raw = await providerSys.generate({
      prompt,
      image: draft.battistrada,
      settings: state.settings,
    });
    const normalized = normalizeAnalysis(raw, draft.data);
    state.analysisResult = {
      ...normalized,
      ...draft.data,
      misura: normalized.misura || draft.data.misura,
      dot: normalized.dot || draft.data.dot,
      marca: normalized.marca || draft.data.marca,
      mode: state.mode,
      image: draft.battistrada,
      image_sidewall: draft.fianco,
      timestamp: new Date().toISOString(),
    };
    history.add('analysis', state.analysisResult);
    toast('✅ Analisi completata', 'success');
    go('analysis');
  } catch (e) {
    toast('⚠ ' + e.message, 'error');
    btn.disabled = false;
    btn.innerHTML = '🤖 Analizza con AI';
  }
}
