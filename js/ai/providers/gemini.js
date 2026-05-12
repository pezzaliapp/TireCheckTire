// Google Gemini provider — multimodal generateContent
const SAFETY = [
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
];

export const ID = 'gemini';
export const NAME = 'Google Gemini';
export const KEY_LINK = 'https://aistudio.google.com/app/apikey';
export const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
export const MODELS = [
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (veloce)' },
  { value: 'gemini-2.5-flash',      label: 'Gemini 2.5 Flash (qualità)' },
];

function endpoint(model, apiKey, override) {
  if (override && override.trim()) return override.trim();
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
}

function imageParts(image) {
  if (!image) return [];
  const base64 = image.split(',')[1];
  const mimeMatch = image.match(/data:(image\/[^;]+);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  return [{ inlineData: { mimeType, data: base64 } }];
}

export async function generate({ prompt, image, settings, generationConfig = {} }) {
  if (!settings.aiKey) throw new Error('Gemini API key mancante');
  const model = settings.aiModel || DEFAULT_MODEL;
  const url = endpoint(model, settings.aiKey, settings.aiEndpoint);

  const body = {
    contents: [{ parts: [...imageParts(image), { text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 800, topP: 0.8, ...generationConfig },
    safetySettings: SAFETY,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Gemini: ${errData.error?.message || 'HTTP ' + res.status}`);
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!raw) {
    const reason = data.candidates?.[0]?.finishReason;
    if (reason === 'SAFETY') throw new Error('Immagine bloccata dai filtri Gemini');
    throw new Error('Risposta Gemini vuota (' + (reason || 'sconosciuto') + ')');
  }
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
