import { state } from '../core/state.js';
import { go } from '../core/router.js';
import { escapeHtml, formatEuro, uid } from '../core/utils.js';
import { toast } from '../ui/toast.js';
import * as sheet from '../ui/sheet.js';
import * as scanner from '../modules/scanner.js';
import { parseTireSize, formatTireSize } from '../modules/tire-parser.js';
import * as eprel from '../modules/eprel.js';
import { SERVICE_CATALOG_AUTO, SERVICE_CATALOG_TRUCK } from '../data/service-catalog.js';
import { TIPO_VEICOLO_QUOTE } from '../data/vehicle-types.js';
import * as pdfQuote from '../modules/pdf-quote.js';
import * as history from '../modules/history.js';
import * as webhook from '../modules/webhook.js';
import { stepper } from '../ui/components.js';
import * as suppliers from '../modules/suppliers.js';

const quote = {
  step: 0,
  cliente: { nome: '', tel: '', targa: '', tipo: 'Auto' },
  tires: [],
  servizi: [],
};

export function mount() {
  // se l'utente arriva da analisi/scan: pre-popola
  if (state.scanData) {
    if (state.scanData.targa) quote.cliente.targa = state.scanData.targa;
    if (state.scanData.cliente) quote.cliente.nome = state.scanData.cliente;
    if (state.scanData.misura) {
      const sz = parseTireSize(state.scanData.misura);
      if (sz) {
        quote.tires.push({
          id: uid(),
          brand: state.scanData.marca || '',
          size: sz,
          dot: state.scanData.dot || '',
          qty: 1,
          price: 0,
          kind: 'new',
        });
      }
    }
    state.scanData = null;
  }
  render();
}

function render() {
  const root = document.getElementById('screen-quote');
  root.innerHTML = `
    <div class="screen-sub">Preventivo · step ${quote.step + 1} di 4</div>
    ${stepper(4, quote.step)}
    <div id="quote-step"></div>
    <div class="btn-row" style="margin-top:18px">
      <button class="btn btn-secondary" id="q-back" ${quote.step === 0 ? 'disabled' : ''}>← Indietro</button>
      <button class="btn btn-primary" id="q-next">${quote.step === 3 ? '✓ Genera' : 'Avanti →'}</button>
    </div>
  `;
  root.querySelector('#q-back').addEventListener('click', back);
  root.querySelector('#q-next').addEventListener('click', next);
  renderStep();
}

function renderStep() {
  const c = document.getElementById('quote-step');
  if (quote.step === 0) c.innerHTML = stepCliente();
  else if (quote.step === 1) c.innerHTML = stepTires();
  else if (quote.step === 2) c.innerHTML = stepServices();
  else c.innerHTML = stepOutput();
  bindStep();
}

// ── STEP 1 Cliente ──
function stepCliente() {
  return `
    <div class="card">
      <h3 style="margin-bottom:10px">Dati cliente</h3>
      <label class="field"><div class="field-label">Nome</div><input class="input" id="c-nome" value="${escapeHtml(quote.cliente.nome)}" placeholder="Mario Rossi"></label>
      <label class="field"><div class="field-label">Telefono</div><input class="input" id="c-tel" type="tel" value="${escapeHtml(quote.cliente.tel)}" placeholder="+39…"></label>
      <div class="grid-2">
        <label class="field"><div class="field-label">Targa</div><input class="input" id="c-targa" value="${escapeHtml(quote.cliente.targa)}" placeholder="AB123CD"></label>
        <label class="field"><div class="field-label">Tipo</div>
          <select class="select" id="c-tipo">${TIPO_VEICOLO_QUOTE.map(t => `<option ${quote.cliente.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
        </label>
      </div>
    </div>
  `;
}

// ── STEP 2 Tires ──
function stepTires() {
  return `
    <div class="card">
      <h3 style="margin-bottom:10px">Pneumatici</h3>
      <div class="btn-row">
        <button class="btn btn-secondary" id="t-scanner">🔍 Scanner QR/EAN</button>
        <button class="btn btn-secondary" id="t-add">＋ Aggiungi a mano</button>
      </div>
      <div id="tires-list" style="margin-top:12px">${renderTiresList()}</div>
    </div>
    <div class="card">
      <div class="card-title">Fornitori B2B</div>
      <div class="row" id="suppliers-row">
        ${suppliers.list().map((s, i) => `<button class="chip" data-sup="${i}">${escapeHtml(s.name)}</button>`).join('')}
      </div>
      <div class="field-label" style="margin-top:8px;text-transform:none;letter-spacing:.02em">Apre la ricerca per la misura del primo pneumatico inserito.</div>
    </div>
  `;
}

function renderTiresList() {
  if (!quote.tires.length) return `<div class="empty"><div class="empty-ico">🛞</div>Nessun pneumatico</div>`;
  return quote.tires.map((t, i) => {
    const sz = formatTireSize(t.size);
    return `
      <div class="tire-card">
        <div class="tc-badge">${t.kind === 'used' ? '♻️' : '🛞'}</div>
        <div>
          <div class="tc-title">${escapeHtml(t.brand || 'Pneumatico')}</div>
          <div class="tc-sub">${escapeHtml(sz || '—')}${t.dot ? ' · DOT ' + escapeHtml(t.dot) : ''}</div>
        </div>
        <div class="tc-right">
          <button class="tc-remove" data-rm="${i}" title="Rimuovi">✕</button>
          <div class="tc-price">${formatEuro((t.price || 0) * (t.qty || 1))}</div>
          <div class="tc-qty">${t.qty}× ${formatEuro(t.price || 0)}</div>
        </div>
      </div>`;
  }).join('');
}

// ── STEP 3 Servizi ──
function stepServices() {
  const catalog = state.mode === 'truck' ? SERVICE_CATALOG_TRUCK : SERVICE_CATALOG_AUTO;
  const userCatalog = state.settings.serviceCatalog;
  const list = Array.isArray(userCatalog) && userCatalog.length ? userCatalog : catalog;
  return `
    <div class="card">
      <h3 style="margin-bottom:10px">Servizi</h3>
      <div class="servizi-grid">
        ${list.map(s => {
          const selected = quote.servizi.find(x => x.id === s.id);
          return `<button class="servizio-tile ${selected ? 'selected' : ''}" data-s="${s.id}">
            <span class="st-ico">${s.icona}</span>
            <div class="st-name">${escapeHtml(s.nome)}</div>
            <div class="st-price">${formatEuro(s.price)} ${s.desc || ''}</div>
          </button>`;
        }).join('')}
      </div>
    </div>
  `;
}

// ── STEP 4 Output ──
function stepOutput() {
  const totTires = quote.tires.reduce((a, t) => a + (t.price || 0) * (t.qty || 1), 0);
  const totSvc = quote.servizi.reduce((a, s) => a + (s.price || 0) * (s.qty || 1), 0);
  const tot = totTires + totSvc;
  return `
    <div class="card">
      <h3 style="margin-bottom:8px">Riepilogo</h3>
      <div style="color:var(--text-2);font-size:13px;margin-bottom:12px">${escapeHtml(quote.cliente.nome || 'Cliente')} · ${escapeHtml(quote.cliente.targa || '')}</div>
      ${quote.tires.map(t => `<div class="row between"><span>${t.qty}× ${escapeHtml(t.brand || 'Pneumatico')} ${escapeHtml(formatTireSize(t.size))}</span><b>${formatEuro((t.price||0)*(t.qty||1))}</b></div>`).join('')}
      ${quote.servizi.map(s => `<div class="row between"><span>${s.qty || 1}× ${escapeHtml(s.nome)}</span><b>${formatEuro((s.price||0)*(s.qty||1))}</b></div>`).join('')}
      <hr style="border:0;border-top:1px solid var(--border);margin:12px 0">
      <div class="row between" style="font-size:20px"><b>Totale</b><b style="color:var(--accent)">${formatEuro(tot)}</b></div>
    </div>
    <div class="btn-stack" style="margin-top:14px">
      <button class="btn btn-primary btn-block" id="q-pdf">📄 Scarica PDF</button>
      <div class="btn-row">
        <button class="btn btn-secondary" id="q-txt">📋 Copia testo</button>
        <button class="btn btn-whatsapp" id="q-wa">💬 WhatsApp</button>
      </div>
      <button class="btn btn-secondary btn-block" id="q-webhook">📡 Webhook Make.com</button>
    </div>
  `;
}

function bindStep() {
  if (quote.step === 0) {
    document.getElementById('c-nome').addEventListener('input', e => quote.cliente.nome = e.target.value);
    document.getElementById('c-tel').addEventListener('input', e => quote.cliente.tel = e.target.value);
    document.getElementById('c-targa').addEventListener('input', e => quote.cliente.targa = e.target.value.toUpperCase());
    document.getElementById('c-tipo').addEventListener('change', e => quote.cliente.tipo = e.target.value);
  } else if (quote.step === 1) {
    document.getElementById('t-scanner').addEventListener('click', () => scanner.open(onScan));
    document.getElementById('t-add').addEventListener('click', addManual);
    document.querySelectorAll('#tires-list .tire-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const rm = e.target.closest('[data-rm]');
        if (rm) { quote.tires.splice(+rm.dataset.rm, 1); renderStep(); return; }
        const i = +card.querySelector('[data-rm]')?.dataset.rm;
        if (Number.isInteger(i)) editTire(i);
      });
    });
    document.querySelectorAll('#suppliers-row [data-sup]').forEach(b => {
      b.addEventListener('click', () => {
        const sup = suppliers.list()[+b.dataset.sup];
        const first = quote.tires[0];
        if (!first?.size) return toast('Aggiungi prima un pneumatico', 'warn');
        const url = suppliers.deepLink(sup, first.size);
        if (url) window.open(url, '_blank');
      });
    });
  } else if (quote.step === 2) {
    const catalog = state.mode === 'truck' ? SERVICE_CATALOG_TRUCK : SERVICE_CATALOG_AUTO;
    const userCatalog = state.settings.serviceCatalog;
    const list = Array.isArray(userCatalog) && userCatalog.length ? userCatalog : catalog;
    document.querySelectorAll('[data-s]').forEach(tile => {
      tile.addEventListener('click', () => {
        const id = tile.dataset.s;
        const idx = quote.servizi.findIndex(x => x.id === id);
        if (idx >= 0) quote.servizi.splice(idx, 1);
        else {
          const svc = list.find(x => x.id === id);
          if (svc) quote.servizi.push({ ...svc, qty: svc.perGomma ? (quote.tires.length || 4) : 1 });
        }
        renderStep();
      });
    });
  } else if (quote.step === 3) {
    document.getElementById('q-pdf').addEventListener('click', genPDF);
    document.getElementById('q-txt').addEventListener('click', copyTxt);
    document.getElementById('q-wa').addEventListener('click', sendWA);
    document.getElementById('q-webhook').addEventListener('click', sendWebhook);
  }
}

function addManual() {
  sheet.open({
    title: 'Aggiungi pneumatico',
    bodyHTML: `
      <label class="field"><div class="field-label">Marca</div><input class="input" id="nt-brand" placeholder="Michelin"></label>
      <label class="field"><div class="field-label">Misura ETRTO</div><input class="input" id="nt-size" placeholder="205/55 R16"></label>
      <div class="grid-2">
        <label class="field"><div class="field-label">Quantità</div><input class="input" id="nt-qty" type="number" value="4" min="1"></label>
        <label class="field"><div class="field-label">Prezzo unit.</div><input class="input" id="nt-price" type="number" value="0" step="0.01"></label>
      </div>
      <label class="field"><div class="field-label">DOT (opz.)</div><input class="input" id="nt-dot" placeholder="2324"></label>
    `,
    footerHTML: `<button class="btn btn-primary btn-block" id="nt-save">Aggiungi</button>`,
  });
  document.getElementById('nt-save').addEventListener('click', () => {
    const size = parseTireSize(document.getElementById('nt-size').value);
    if (!size) return toast('Misura non valida', 'warn');
    quote.tires.push({
      id: uid(),
      brand: document.getElementById('nt-brand').value.trim(),
      size,
      qty: Math.max(1, +document.getElementById('nt-qty').value || 1),
      price: +document.getElementById('nt-price').value || 0,
      dot: document.getElementById('nt-dot').value.trim(),
      kind: 'new',
    });
    sheet.close();
    renderStep();
  });
}

function editTire(i) {
  const t = quote.tires[i];
  if (!t) return;
  sheet.open({
    title: 'Modifica pneumatico',
    bodyHTML: `
      <label class="field"><div class="field-label">Marca</div><input class="input" id="et-brand" value="${escapeHtml(t.brand)}"></label>
      <label class="field"><div class="field-label">Misura</div><input class="input" id="et-size" value="${escapeHtml(formatTireSize(t.size))}"></label>
      <div class="grid-2">
        <label class="field"><div class="field-label">Quantità</div><input class="input" id="et-qty" type="number" value="${t.qty}" min="1"></label>
        <label class="field"><div class="field-label">Prezzo</div><input class="input" id="et-price" type="number" value="${t.price}" step="0.01"></label>
      </div>
    `,
    footerHTML: `<button class="btn btn-primary btn-block" id="et-save">Salva</button>`,
  });
  document.getElementById('et-save').addEventListener('click', () => {
    t.brand = document.getElementById('et-brand').value.trim();
    t.size = parseTireSize(document.getElementById('et-size').value) || t.size;
    t.qty = Math.max(1, +document.getElementById('et-qty').value || 1);
    t.price = +document.getElementById('et-price').value || 0;
    sheet.close();
    renderStep();
  });
}

async function onScan(parsed) {
  if (parsed.type === 'eprel') {
    toast('🇪🇺 EPREL ' + parsed.eprelId);
    const data = await eprel.fetchData(parsed.eprelId);
    if (data) {
      const sz = parseTireSize(data.size);
      quote.tires.push({
        id: uid(),
        brand: data.brand || '',
        size: sz || null,
        eprelId: parsed.eprelId,
        season: eprel.mapSeason(data.season),
        qty: 1,
        price: 0,
        kind: 'new',
      });
    } else {
      window.open(parsed.link, '_blank');
      toast('Worker EPREL non configurato — apertura sito UE', 'info');
    }
  } else if (parsed.type === 'ean') {
    quote.tires.push({ id: uid(), ean: parsed.ean, qty: 1, price: 0, kind: 'new' });
  } else if (parsed.type === 'dot') {
    quote.tires.push({ id: uid(), dot: parsed.dot, year: parsed.year, qty: 1, price: 0, kind: 'used' });
  } else if (parsed.type === 'size-text') {
    quote.tires.push({ id: uid(), size: parsed.size, qty: 1, price: 0, kind: 'new' });
  } else if (parsed.type === 'json' && parsed.data) {
    const d = parsed.data;
    quote.tires.push({
      id: uid(),
      brand: d.brand || '',
      size: parseTireSize(d.size) || null,
      qty: d.qty || 1,
      price: d.price || 0,
      kind: d.used ? 'used' : 'new',
    });
  } else {
    toast('Codice non riconosciuto', 'warn');
    return;
  }
  renderStep();
}

function back() { if (quote.step > 0) { quote.step--; render(); } }
function next() {
  if (quote.step < 3) {
    if (quote.step === 0 && !quote.cliente.nome.trim()) return toast('Inserisci il nome cliente', 'warn');
    if (quote.step === 1 && !quote.tires.length) return toast('Aggiungi almeno un pneumatico', 'warn');
    quote.step++;
    render();
  } else {
    save();
  }
}

function buildPayload() {
  const totale = quote.tires.reduce((a, t) => a + (t.price || 0) * (t.qty || 1), 0)
               + quote.servizi.reduce((a, s) => a + (s.price || 0) * (s.qty || 1), 0);
  return {
    id: uid().toUpperCase(),
    cliente: quote.cliente,
    tires: quote.tires,
    servizi: quote.servizi,
    totale,
    timestamp: new Date().toISOString(),
    mode: state.mode,
  };
}

async function save() {
  const payload = buildPayload();
  history.add('quote', payload);
  toast('💾 Preventivo salvato', 'success');
}

async function genPDF() {
  const payload = buildPayload();
  try {
    await pdfQuote.generate(payload);
    history.add('quote', payload);
    toast('📄 PDF preventivo scaricato', 'success');
  } catch (e) {
    toast('Errore PDF: ' + e.message, 'error');
  }
}

async function copyTxt() {
  const payload = buildPayload();
  const txt = pdfQuote.toText(payload);
  try {
    await navigator.clipboard.writeText(txt);
    toast('✅ Testo copiato', 'success');
  } catch {
    toast('Impossibile copiare', 'error');
  }
}

function sendWA() {
  const payload = buildPayload();
  const txt = pdfQuote.toText(payload);
  let num = (quote.cliente.tel || state.settings.whatsappNumber || '').replace(/[^\d+]/g, '');
  num = num.replace(/^\+/, '');
  const url = `https://wa.me/${num}?text=${encodeURIComponent(txt)}`;
  window.open(url, '_blank');
}

async function sendWebhook() {
  try {
    await webhook.send(buildPayload());
    toast('✅ Webhook inviato', 'success');
  } catch (e) {
    toast('⚠ ' + e.message, 'error');
  }
}
