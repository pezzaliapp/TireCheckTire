// Mistral provider (Pixtral models)
export const ID = 'mistral';
export const NAME = 'Mistral';
export const KEY_LINK = 'https://console.mistral.ai/api-keys';
export const DEFAULT_MODEL = 'pixtral-12b-2409';
export const MODELS = [
  { value: 'pixtral-12b-2409',    label: 'Pixtral 12B' },
  { value: 'pixtral-large-latest', label: 'Pixtral Large' },
];

function endpoint(override) {
  return (override && override.trim()) || 'https://api.mistral.ai/v1/chat/completions';
}

export async function generate({ prompt, image, settings, generationConfig = {} }) {
  if (!settings.aiKey) throw new Error('Mistral API key mancante');
  const model = settings.aiModel || DEFAULT_MODEL;
  const content = [];
  if (image) content.push({ type: 'image_url', image_url: image });
  content.push({ type: 'text', text: prompt });

  const body = {
    model,
    messages: [{ role: 'user', content }],
    temperature: generationConfig.temperature ?? 0.2,
    max_tokens: generationConfig.maxOutputTokens ?? 800,
  };

  const res = await fetch(endpoint(settings.aiEndpoint), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + settings.aiKey },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error('Mistral: ' + (errData.message || errData.error?.message || 'HTTP ' + res.status));
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  if (!raw) throw new Error('Risposta Mistral vuota');
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
