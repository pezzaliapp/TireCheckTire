// Dispatcher dei provider AI
import * as gemini    from './providers/gemini.js';
import * as openai    from './providers/openai.js';
import * as anthropic from './providers/anthropic.js';
import * as mistral   from './providers/mistral.js';
import * as ollama    from './providers/ollama.js';

const PROVIDERS = { gemini, openai, anthropic, mistral, ollama };

export function list() {
  return Object.values(PROVIDERS).map(p => ({
    id: p.ID,
    name: p.NAME,
    keyLink: p.KEY_LINK,
    defaultModel: p.DEFAULT_MODEL,
    models: p.MODELS,
  }));
}

export function get(id) {
  return PROVIDERS[id] || PROVIDERS.gemini;
}

export async function generate({ prompt, image, settings, generationConfig }) {
  const p = get(settings.aiProvider);
  return p.generate({ prompt, image, settings, generationConfig });
}

export async function test(settings) {
  const p = get(settings.aiProvider);
  return p.testConnection(settings);
}
