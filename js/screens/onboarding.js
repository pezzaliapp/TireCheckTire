import { state, saveSettings } from '../core/state.js';
import { go } from '../core/router.js';
import * as providerSys from '../ai/provider.js';
import { toast } from '../ui/toast.js';
import { escapeHtml } from '../core/utils.js';

let step = 0;

export function mount() {
  step = 0;
  render();
}

function render() {
  const root = document.getElementById('screen-onboarding');
  const providers = providerSys.list();
  const currentProvider = providers.find(p => p.id === (state.settings.aiProvider || 'gemini')) || providers[0];

  root.innerHTML = `
    <div class="screen-sub">Setup iniziale · ${step + 1} di 3</div>
    <div class="stepper" style="margin-bottom:18px">
      ${[0, 1, 2].map(i => `<span class="dot ${i === step ? 'active' : ''}"></span>`).join('')}
    </div>

    ${step === 0 ? `
      <div class="card" style="text-align:center;padding:36px 18px">
        <div style="font-size:48px;margin-bottom:8px">🛞</div>
        <h1 style="margin-bottom:6px">Benvenuto in TireCheckTire</h1>
        <p style="color:var(--text-2);margin:0 0 16px">La suite intelligente per gommisti, autofficine e fleet manager.</p>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <span class="chip">Diagnosi AI</span>
          <span class="chip">Preventivi</span>
          <span class="chip">Storico</span>
        </div>
      </div>
    ` : step === 1 ? `
      <div class="card">
        <h2 style="margin-bottom:12px">Profilo officina</h2>
        <p style="color:var(--text-2);margin:0 0 12px;font-size:13px">Tutti i campi sono opzionali. Puoi saltare e configurare dopo.</p>
        <label class="field">
          <div class="field-label">Nome officina</div>
          <input class="input" id="ob-nome" type="text" value="${escapeHtml(state.settings.officina)}" placeholder="Es. Gomme Bianchi">
        </label>
        <label class="field">
          <div class="field-label">Telefono</div>
          <input class="input" id="ob-tel" type="tel" value="${escapeHtml(state.settings.tel)}" placeholder="+39…">
        </label>
        <label class="field">
          <div class="field-label">P.IVA</div>
          <input class="input" id="ob-piva" type="text" value="${escapeHtml(state.settings.piva)}" placeholder="12345678901">
        </label>
      </div>
    ` : `
      <div class="card">
        <h2 style="margin-bottom:6px">Provider AI</h2>
        <p style="color:var(--text-2);margin:0 0 12px;font-size:13px">Scegli il tuo provider preferito e inserisci la chiave. Puoi cambiarla in Impostazioni.</p>
        <label class="field">
          <div class="field-label">Provider</div>
          <select class="select" id="ob-provider">
            ${providers.map(p => `<option value="${p.id}" ${currentProvider.id === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <div class="field-label">API Key</div>
          <input class="input" id="ob-key" type="password" value="${escapeHtml(state.settings.aiKey)}" placeholder="incolla qui">
        </label>
        <a href="${currentProvider.keyLink}" target="_blank" rel="noopener" class="chip" style="margin-top:4px">🔑 Ottieni una key</a>
        <div class="btn-row" style="margin-top:12px">
          <button class="btn btn-secondary" id="ob-test">🧪 Testa connessione</button>
          <button class="btn btn-ghost" id="ob-skip-ai">Salta</button>
        </div>
      </div>
    `}

    <div class="btn-row" style="margin-top:18px">
      <button class="btn btn-secondary" id="ob-back" ${step === 0 ? 'disabled' : ''}>← Indietro</button>
      <button class="btn btn-primary" id="ob-next">${step === 2 ? '✓ Inizia' : 'Avanti →'}</button>
    </div>
    <button class="btn btn-ghost btn-block" id="ob-skip" style="margin-top:8px">Salta tutto</button>
  `;

  document.getElementById('ob-back').addEventListener('click', () => { if (step > 0) { step--; render(); } });
  document.getElementById('ob-next').addEventListener('click', next);
  document.getElementById('ob-skip').addEventListener('click', finish);

  if (step === 2) {
    document.getElementById('ob-skip-ai').addEventListener('click', finish);
    document.getElementById('ob-test').addEventListener('click', testAI);
    document.getElementById('ob-provider').addEventListener('change', (e) => {
      const id = e.target.value;
      const p = providers.find(x => x.id === id);
      saveSettings({ aiProvider: id, aiModel: p?.defaultModel || '' });
      render();
    });
  }
}

async function next() {
  if (step === 1) {
    saveSettings({
      officina: document.getElementById('ob-nome').value.trim(),
      tel:      document.getElementById('ob-tel').value.trim(),
      piva:     document.getElementById('ob-piva').value.trim(),
    });
  } else if (step === 2) {
    saveSettings({
      aiProvider: document.getElementById('ob-provider').value,
      aiKey:      document.getElementById('ob-key').value.trim(),
    });
    return finish();
  }
  step++;
  render();
}

async function testAI() {
  const provider = document.getElementById('ob-provider').value;
  const key = document.getElementById('ob-key').value.trim();
  if (!key && provider !== 'ollama') return toast('Inserisci una API key', 'warn');
  saveSettings({ aiProvider: provider, aiKey: key });
  toast('Test in corso…');
  try {
    const ok = await providerSys.test(state.settings);
    toast(ok ? '✅ Provider raggiungibile' : '⚠ Risposta non valida', ok ? 'success' : 'warn');
  } catch (e) {
    toast('⚠ ' + e.message, 'error');
  }
}

function finish() {
  saveSettings({ onboardingDone: true });
  go('dashboard');
}
