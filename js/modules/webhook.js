import { state } from '../core/state.js';

export async function send(payload) {
  const url = (state.settings.webhook || '').trim();
  if (!url) throw new Error('Webhook Make.com non configurato');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      _source: 'TireCheckTire',
      _ts: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return true;
}
