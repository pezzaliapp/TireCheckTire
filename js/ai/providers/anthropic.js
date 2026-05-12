// Anthropic Claude provider (browser direct access)
export const ID = 'anthropic';
export const NAME = 'Anthropic Claude';
export const KEY_LINK = 'https://console.anthropic.com/settings/keys';
export const DEFAULT_MODEL = 'claude-haiku-4-5';
export const MODELS = [
  { value: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5 (veloce)' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (qualità)' },
];

function endpoint(override) {
  return (override && override.trim()) || 'https://api.anthropic.com/v1/messages';
}

export async function generate({ prompt, image, settings, generationConfig = {} }) {
  if (!settings.aiKey) throw new Error('Anthropic API key mancante');
  const model = settings.aiModel || DEFAULT_MODEL;
  const content = [];
  if (image) {
    const base64 = image.split(',')[1];
    const mimeMatch = image.match(/data:(image\/[^;]+);/);
    const mediaType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    content.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } });
  }
  content.push({ type: 'text', text: prompt });

  const body = {
    model,
    max_tokens: generationConfig.maxOutputTokens ?? 800,
    temperature: generationConfig.temperature ?? 0.2,
    messages: [{ role: 'user', content }],
  };

  const res = await fetch(endpoint(settings.aiEndpoint), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.aiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error('Anthropic: ' + (errData.error?.message || 'HTTP ' + res.status));
  }

  const data = await res.json();
  const raw = data.content?.find(c => c.type === 'text')?.text || data.content?.[0]?.text || '';
  if (!raw) throw new Error('Risposta Claude vuota');
  return raw;
}

export async function testConnection(settings) {
  const raw = await generate({
    prompt: 'Rispondi solo con la parola OK.',
    image: null,
    settings,
    generationConfig: { maxOutputTokens: 5 },
  });
  return raw.trim().toUpperCase().includes('OK');
}
