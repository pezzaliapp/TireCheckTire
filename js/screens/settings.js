import { state, saveSettings, setMode } from '../core/state.js';
import { escapeHtml } from '../core/utils.js';
import * as storage from '../core/storage.js';
import * as providerSys from '../ai/provider.js';
import { toast } from '../ui/toast.js';
import * as modal from '../ui/modal.js';
import * as exportMod from '../modules/export.js';
import { DEFAULT_SUPPLIERS } from '../data/default-suppliers.js';
import { SERVICE_CATALOG_AUTO } from '../data/service-catalog.js';

export function mount(params = {}) {
  render(params.section);
}

function render(focus) {
  const root = document.getElementById('screen-settings');
  const s = state.settings;
  const providers = providerSys.list();
  const currentProvider = providers.find(p => p.id === s.aiProvider) || providers[0];
  const suppliers = s.suppliers || DEFAULT_SUPPLIERS;

  root.innerHTML = `
    <div class="screen-sub">Configurazione · v1.0.0</div>

    <details ${focus === 'office' || !focus ? 'open' : ''}>
      <summary class="section-title" style="cursor:pointer;padding:10px 0">1 · Profilo officina</summary>
      <div class="card">
        <label class="field"><div class="field-label">Nome</div><input class="input" id="s-officina" value="${escapeHtml(s.officina)}"></label>
        <div class="grid-2">
          <label class="field"><div class="field-label">P.IVA</div><input class="input" id="s-piva" value="${escapeHtml(s.piva)}"></label>
          <label class="field"><div class="field-label">Telefono</div><input class="input" id="s-tel" value="${escapeHtml(s.tel)}"></label>
        </div>
        <label class="field"><div class="field-label">Indirizzo</div><input class="input" id="s-addr" value="${escapeHtml(s.addr)}"></label>
        <label class="field"><div class="field-label">Email</div><input class="input" id="s-email" type="email" value="${escapeHtml(s.email)}"></label>
      </div>
    </details>

    <details ${focus === 'ai' ? 'open' : ''}>
      <summary class="section-title" style="cursor:pointer;padding:10px 0">2 · Provider AI</summary>
      <div class="card">
        <label class="field"><div class="field-label">Provider</div>
          <select class="select" id="s-provider">${providers.map(p => `<option value="${p.id}" ${s.aiProvider === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}</select>
        </label>
        <label class="field"><div class="field-label">Modello</div>
          <select class="select" id="s-model">${currentProvider.models.map(m => `<option value="${m.value}" ${s.aiModel === m.value ? 'selected' : ''}>${m.label}</option>`).join('')}</select>
        </label>
        <label class="field"><div class="field-label">API Key</div><input class="input" id="s-key" type="password" autocomplete="off" value="${escapeHtml(s.aiKey)}"></label>
        <div class="row" style="gap:8px"><a href="${currentProvider.keyLink}" target="_blank" rel="noopener" class="chip">🔑 Ottieni key (${currentProvider.name})</a></div>
        <label class="field" style="margin-top:10px"><div class="field-label">Endpoint custom (opz.)</div><input class="input" id="s-endpoint" value="${escapeHtml(s.aiEndpoint)}" placeholder="lascia vuoto per default"></label>
        ${s.aiProvider === 'ollama' ? `<label class="field"><div class="field-label">Ollama endpoint</div><input class="input" id="s-ollama" value="${escapeHtml(s.ollamaEndpoint)}"></label>` : ''}
        <button class="btn btn-secondary btn-block" id="s-test" style="margin-top:6px">🧪 Testa connessione</button>
      </div>
    </details>

    <details>
      <summary class="section-title" style="cursor:pointer;padding:10px 0">3 · EPREL Proxy</summary>
      <div class="card">
        <label class="field"><div class="field-label">URL Worker EPREL</div><input class="input" id="s-eprel" value="${escapeHtml(s.eprelProxy)}" placeholder="https://eprel-proxy.workers.dev/?id={id}"></label>
        <p style="font-size:12px;color:var(--text-3)">Vuoto = apertura diretta del sito EPREL UE.</p>
      </div>
    </details>

    <details>
      <summary class="section-title" style="cursor:pointer;padding:10px 0">4 · Webhook Make.com</summary>
      <div class="card">
        <label class="field"><div class="field-label">Webhook URL</div><input class="input" id="s-webhook" value="${escapeHtml(s.webhook)}" placeholder="https://hook.eu1.make.com/…"></label>
      </div>
    </details>

    <details>
      <summary class="section-title" style="cursor:pointer;padding:10px 0">5 · WhatsApp</summary>
      <div class="card">
        <label class="field"><div class="field-label">Numero default</div><input class="input" id="s-whatsapp" type="tel" value="${escapeHtml(s.whatsappNumber)}" placeholder="+39…"></label>
      </div>
    </details>

    <details>
      <summary class="section-title" style="cursor:pointer;padding:10px 0">6 · Fornitori B2B</summary>
      <div class="card">
        <div id="sup-list">${suppliers.map((sp, i) => `
          <div class="row between" style="background:var(--bg-elevated);padding:10px;border-radius:8px;margin-bottom:6px">
            <div style="flex:1;min-width:0">
              <div style="font-weight:700">${escapeHtml(sp.name)}</div>
              <div style="font-size:11px;color:var(--text-3);font-family:var(--font-mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(sp.urlTpl)}</div>
            </div>
            <button class="btn btn-danger btn-small" data-sup-del="${i}">✕</button>
          </div>`).join('')}</div>
        <button class="btn btn-secondary btn-block" id="sup-add">＋ Aggiungi fornitore</button>
        <button class="btn btn-ghost btn-block" id="sup-reset">Ripristina default</button>
      </div>
    </details>

    <details>
      <summary class="section-title" style="cursor:pointer;padding:10px 0">7 · Modalità default</summary>
      <div class="card">
        <div class="mode-switch">
          <button class="ms-btn ${s.modeDefault === 'auto' ? 'active' : ''}" data-m="auto">🚗 Auto</button>
          <button class="ms-btn ${s.modeDefault === 'truck' ? 'active' : ''}" data-m="truck">🚛 Truck</button>
        </div>
      </div>
    </details>

    <details>
      <summary class="section-title" style="cursor:pointer;padding:10px 0">8 · Avanzate</summary>
      <div class="card">
        <div class="btn-stack">
          <button class="btn btn-secondary" id="adv-export">⬇ Esporta backup JSON</button>
          <button class="btn btn-secondary" id="adv-import">⬆ Importa backup JSON</button>
          <button class="btn btn-danger" id="adv-reset">🗑 Reset app</button>
        </div>
      </div>
    </details>

    <details>
      <summary class="section-title" style="cursor:pointer;padding:10px 0">9 · Info</summary>
      <div class="card">
        <h3>TireCheckTire</h3>
        <p style="color:var(--text-2);margin:8px 0">Versione 1.0.0 · The Tire Intelligence Suite</p>
        <p style="font-size:12px;color:var(--text-3)">Sviluppato da <a href="https://www.pezzaliapp.com" target="_blank" rel="noopener" style="color:var(--accent)">PezzaliApp</a>.</p>
      </div>
    </details>

    <button class="btn btn-primary btn-block" id="s-save" style="margin-top:20px">💾 Salva impostazioni</button>
  `;

  bind(focus);
}

function bind() {
  document.getElementById('s-provider').addEventListener('change', (e) => {
    const p = providerSys.list().find(x => x.id === e.target.value);
    saveSettings({ aiProvider: e.target.value, aiModel: p?.defaultModel || '' });
    render('ai');
  });

  document.getElementById('s-test').addEventListener('click', async () => {
    saveSettings({
      aiProvider: document.getElementById('s-provider').value,
      aiModel:    document.getElementById('s-model').value,
      aiKey:      document.getElementById('s-key').value.trim(),
      aiEndpoint: document.getElementById('s-endpoint').value.trim(),
      ollamaEndpoint: document.getElementById('s-ollama')?.value.trim() || state.settings.ollamaEndpoint,
    });
    toast('Test in corso…');
    try {
      const ok = await providerSys.test(state.settings);
      toast(ok ? '✅ Provider raggiungibile' : '⚠ Risposta non valida', ok ? 'success' : 'warn');
    } catch (e) { toast('⚠ ' + e.message, 'error'); }
  });

  document.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => {
    saveSettings({ modeDefault: b.dataset.m });
    setMode(b.dataset.m);
    render();
  }));

  document.querySelectorAll('[data-sup-del]').forEach(b => b.addEventListener('click', () => {
    const list = (state.settings.suppliers || DEFAULT_SUPPLIERS).slice();
    list.splice(+b.dataset.supDel, 1);
    saveSettings({ suppliers: list });
    render();
  }));

  document.getElementById('sup-add').addEventListener('click', async () => {
    const name = await modal.prompt('Nome fornitore', '', 'Nuovo fornitore');
    if (!name) return;
    const url = await modal.prompt('URL template con {w} {h} {r}', 'https://example.com/?s={w}/{h}+R{r}');
    if (!url) return;
    const list = (state.settings.suppliers || DEFAULT_SUPPLIERS).slice();
    list.push({ name, urlTpl: url });
    saveSettings({ suppliers: list });
    render();
  });

  document.getElementById('sup-reset').addEventListener('click', () => {
    saveSettings({ suppliers: null });
    render();
  });

  document.getElementById('adv-export').addEventListener('click', () => {
    exportMod.downloadJSON(storage.exportAll(), 'tirechecktire-backup.json');
  });

  document.getElementById('adv-import').addEventListener('click', () => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'application/json';
    inp.onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try {
        const txt = await f.text();
        const j = JSON.parse(txt);
        storage.importAll(j);
        toast('✅ Import completato. Ricarica.', 'success');
        setTimeout(() => location.reload(), 800);
      } catch (err) { toast('⚠ JSON non valido', 'error'); }
    };
    inp.click();
  });

  document.getElementById('adv-reset').addEventListener('click', async () => {
    if (await modal.confirm('Tutti i dati locali verranno cancellati. Procedere?', 'Reset app')) {
      storage.clearAll();
      toast('Reset completato. Ricarico…', 'warn');
      setTimeout(() => location.reload(), 700);
    }
  });

  document.getElementById('s-save').addEventListener('click', () => {
    saveSettings({
      officina: document.getElementById('s-officina').value.trim(),
      piva:     document.getElementById('s-piva').value.trim(),
      tel:      document.getElementById('s-tel').value.trim(),
      addr:     document.getElementById('s-addr').value.trim(),
      email:    document.getElementById('s-email').value.trim(),
      aiProvider: document.getElementById('s-provider').value,
      aiModel:    document.getElementById('s-model').value,
      aiKey:      document.getElementById('s-key').value.trim(),
      aiEndpoint: document.getElementById('s-endpoint').value.trim(),
      ollamaEndpoint: document.getElementById('s-ollama')?.value.trim() || state.settings.ollamaEndpoint,
      eprelProxy: document.getElementById('s-eprel').value.trim(),
      webhook:    document.getElementById('s-webhook').value.trim(),
      whatsappNumber: document.getElementById('s-whatsapp').value.trim(),
    });
    toast('✅ Impostazioni salvate', 'success');
  });
}
