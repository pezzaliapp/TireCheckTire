// Settings — provider, model, key, workshop identity. Lives in a bottom sheet.

import { html, raw, setHTML, on, toast } from "./dom.js";
import { icon } from "./icons.js";
import { settings } from "../core/state.js";
import { PROVIDERS, PROVIDER_ORDER } from "../ai/providers.js";
import { openSheet, closeSheet } from "./sheet.js";

export function openSettingsSheet() {
  const op = settings.get("operator", { shopName: "", name: "", phone: "", piva: "", address: "" });
  const provider = settings.get("ai.provider", "gemini");
  const epreProxy = settings.get("eprel.proxy", "");
  const webhook = settings.get("webhook.makecom", "");
  const vatRate = settings.get("vat.rate", 22);

  openSheet({
    title: "Impostazioni",
    body: html`
      <div style="display:flex; flex-direction:column; gap:8px">
        <span class="mono" style="font-size:11px; letter-spacing:.14em; color:var(--ink-3); text-transform:uppercase; padding:8px 4px 4px">Provider AI</span>
        <div class="sheet-field"><label>Provider</label>
          <select id="st-provider">
            ${raw(PROVIDER_ORDER.map(id => {
              const p = PROVIDERS[id];
              return `<option value="${id}" ${id === provider ? "selected" : ""}>${p.label}</option>`;
            }).join(""))}
          </select>
        </div>
        <div id="st-provider-cfg"></div>

        <span class="mono" style="font-size:11px; letter-spacing:.14em; color:var(--ink-3); text-transform:uppercase; padding:12px 4px 4px">Officina</span>
        <div class="sheet-field"><label>Insegna</label><input id="st-shop" value="${esc(op.shopName)}" placeholder="Pneumatici Rossi"/></div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px">
          <div class="sheet-field"><label>Telefono</label><input id="st-phone" value="${esc(op.phone)}" placeholder="+39…"/></div>
          <div class="sheet-field"><label>P.IVA</label><input id="st-piva" value="${esc(op.piva)}" placeholder="IT…"/></div>
        </div>
        <div class="sheet-field"><label>Indirizzo</label><input id="st-addr" value="${esc(op.address)}" placeholder="Via, città"/></div>

        <span class="mono" style="font-size:11px; letter-spacing:.14em; color:var(--ink-3); text-transform:uppercase; padding:12px 4px 4px">Avanzate</span>
        <div class="sheet-field"><label>Aliquota IVA %</label><input id="st-vat" type="number" min="0" max="100" value="${vatRate}"/></div>
        <div class="sheet-field"><label>EPREL proxy URL (opz.)</label><input id="st-eprel" value="${esc(epreProxy)}" placeholder="https://…workers.dev/?id={id}"/></div>
        <div class="sheet-field"><label>Webhook Make.com (opz.)</label><input id="st-webhook" value="${esc(webhook)}" placeholder="https://hook.eu1.make.com/…"/></div>

        <div class="sheet-actions" style="margin-top:16px">
          <button class="ghost" id="st-cancel">Chiudi</button>
          <button class="solid" id="st-save">Salva</button>
        </div>
      </div>
    `,
    onPick: null
  });

  renderProviderConfig(provider);

  on(document.getElementById("st-provider"), "change", e => {
    renderProviderConfig(e.target.value);
  });

  on(document.getElementById("st-save"), "click", () => {
    const id = val("st-provider");
    settings.set("ai.provider", id);
    settings.set(`ai.key.${id}`, val(`st-key-${id}`).trim());
    settings.set(`ai.model.${id}`, val(`st-model-${id}`).trim() || PROVIDERS[id].defaultModel);
    if (PROVIDERS[id].usesEndpointAsKey) {
      settings.set(`ai.endpoint.${id}`, val(`st-key-${id}`).trim());
    }
    settings.set("operator", {
      shopName: val("st-shop"),
      phone: val("st-phone"),
      piva: val("st-piva"),
      address: val("st-addr"),
      name: ""
    });
    settings.set("vat.rate", Number(val("st-vat")) || 22);
    settings.set("eprel.proxy", val("st-eprel"));
    settings.set("webhook.makecom", val("st-webhook"));
    toast("Impostazioni salvate", "ok");
    closeSheet();
  });

  on(document.getElementById("st-cancel"), "click", () => closeSheet());
}

function renderProviderConfig(id) {
  const p = PROVIDERS[id];
  const key = settings.get(`ai.key.${id}`, "");
  const model = settings.get(`ai.model.${id}`, p.defaultModel);
  setHTML(document.getElementById("st-provider-cfg"), html`
    <div class="sheet-field">
      <label>${p.usesEndpointAsKey ? "Endpoint" : "API Key"}</label>
      <input id="st-key-${id}" type="${p.usesEndpointAsKey ? "text" : "password"}" autocomplete="off" value="${esc(key)}" placeholder="${esc(p.placeholder)}"/>
    </div>
    <div class="sheet-field">
      <label>Modello</label>
      <input id="st-model-${id}" value="${esc(model)}" placeholder="${esc(p.defaultModel)}"/>
    </div>
    <p style="font-family:var(--font-mono); font-size:11px; color:var(--ink-3); letter-spacing:.04em; padding:0 4px 8px">${esc(p.keyHint)}</p>
  `);
}

function val(id) { return document.getElementById(id)?.value || ""; }
function esc(s) { return s == null ? "" : String(s).replace(/"/g, "&quot;"); }
