// OpenAI provider — chat completions con vision
export const ID = 'openai';
export const NAME = 'OpenAI';
export const KEY_LINK = 'https://platform.openai.com/api-keys';
export const DEFAULT_MODEL = 'gpt-4o-mini';
export const MODELS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o mini (economico)' },
  { value: 'gpt-4o',      label: 'GPT-4o (qualità)' },
];

function endpoint(override) {
  return (override && override.trim()) || 'https://api.openai.com/v1/chat/completions';
}

export async function generate({ prompt, image, settings, generationConfig = {} }) {
  if (!settings.aiKey) throw new Error('OpenAI API key mancante');
  const model = settings.aiModel || DEFAULT_MODEL;
  const content = [];
  if (image) content.push({ type: 'image_url', image_url: { url: image } });
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
    throw new Error('OpenAI: ' + (errData.error?.message || 'HTTP ' + res.status));
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  if (!raw) throw new Error('Risposta OpenAI vuota');
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
