// Ollama locale (es. gemma3, llava, minicpm-v)
export const ID = 'ollama';
export const NAME = 'Ollama locale';
export const KEY_LINK = 'https://ollama.com';
export const DEFAULT_MODEL = 'llava';
export const MODELS = [
  { value: 'llava',     label: 'LLaVA' },
  { value: 'gemma3',    label: 'Gemma 3' },
  { value: 'minicpm-v', label: 'MiniCPM-V' },
];

function endpoint(settings) {
  return (settings.aiEndpoint && settings.aiEndpoint.trim())
      || (settings.ollamaEndpoint && settings.ollamaEndpoint.trim())
      || 'http://localhost:11434/api/generate';
}

export async function generate({ prompt, image, settings }) {
  const model = settings.aiModel || DEFAULT_MODEL;
  const body = {
    model,
    prompt,
    stream: false,
  };
  if (image) {
    body.images = [image.split(',')[1]];
  }
  const res = await fetch(endpoint(settings), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Ollama: HTTP ' + res.status);
  const data = await res.json();
  const raw = data.response || '';
  if (!raw) throw new Error('Risposta Ollama vuota');
  return raw;
}

export async function testConnection(settings) {
  try {
    const url = endpoint(settings).replace(/\/api\/.*$/, '/api/tags');
    const res = await fetch(url);
    return res.ok;
  } catch { return false; }
}
