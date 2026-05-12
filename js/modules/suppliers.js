import { state } from '../core/state.js';
import { DEFAULT_SUPPLIERS } from '../data/default-suppliers.js';

export function list() {
  const s = state.settings.suppliers;
  if (Array.isArray(s) && s.length) return s;
  return DEFAULT_SUPPLIERS.slice();
}

export function deepLink(supplier, size) {
  if (!supplier || !size) return null;
  return supplier.urlTpl
    .replace(/\{w\}/g, encodeURIComponent(size.w))
    .replace(/\{h\}/g, encodeURIComponent(size.h))
    .replace(/\{r\}/g, encodeURIComponent(size.r));
}
