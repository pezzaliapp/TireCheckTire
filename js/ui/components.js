import { escapeHtml } from '../core/utils.js';

export function field(label, inputHtml, hint = '') {
  return `
    <label class="field">
      <div class="field-label">${escapeHtml(label)}</div>
      ${inputHtml}
      ${hint ? `<div class="field-label" style="margin-top:4px;color:var(--text-3);text-transform:none;letter-spacing:.02em">${escapeHtml(hint)}</div>` : ''}
    </label>`;
}

export function input({ id, type = 'text', value = '', placeholder = '', autocomplete = 'off' }) {
  return `<input class="input" id="${id}" type="${type}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" autocomplete="${autocomplete}">`;
}

export function select({ id, value = '', options = [] }) {
  return `<select class="select" id="${id}">${options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const lbl = typeof o === 'object' ? o.label : o;
    const sel = String(v) === String(value) ? ' selected' : '';
    return `<option value="${escapeHtml(v)}"${sel}>${escapeHtml(lbl)}</option>`;
  }).join('')}</select>`;
}

export function textarea({ id, value = '', placeholder = '', rows = 3 }) {
  return `<textarea class="textarea" id="${id}" rows="${rows}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(value)}</textarea>`;
}

export function stepper(total, active) {
  return `<div class="stepper">${Array.from({ length: total }, (_, i) =>
    `<span class="dot ${i === active ? 'active' : ''}"></span>`
  ).join('')}</div>`;
}
