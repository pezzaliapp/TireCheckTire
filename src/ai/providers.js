// AI provider registry — every provider exposes { id, label, vision(image, prompt, opts) }.

import * as gemini from "./gemini.js";
import * as openai from "./openai.js";
import * as anthropic from "./anthropic.js";
import * as mistral from "./mistral.js";
import * as ollama from "./ollama.js";
import { settings } from "../core/state.js";
import { buildVisionPrompt, normalize } from "./prompts.js";

export const PROVIDERS = { gemini, openai, anthropic, mistral, ollama };
export const PROVIDER_ORDER = ["gemini", "openai", "anthropic", "mistral", "ollama"];

export function activeProviderId() {
  return settings.get("ai.provider", "gemini");
}

export function activeProvider() {
  return PROVIDERS[activeProviderId()] || gemini;
}

export function activeModel() {
  const p = activeProvider();
  return settings.get(`ai.model.${p.id}`, p.defaultModel);
}

export function activeKey() {
  const p = activeProvider();
  return settings.get(`ai.key.${p.id}`, "");
}

export function activeEndpoint() {
  const p = activeProvider();
  return settings.get(`ai.endpoint.${p.id}`, "");
}

export function hasUsableConfig() {
  const p = activeProvider();
  if (p.id === "ollama") return !!(activeEndpoint() || activeKey() || true);
  return !!activeKey();
}

export async function diagnose({ image, profile, knownSize, knownDot, vehicleHint, position, signal }) {
  const provider = activeProvider();
  const model = activeModel();
  const apiKey = activeKey();
  const endpoint = activeEndpoint();
  const prompt = buildVisionPrompt({ profile, knownSize, knownDot, vehicleHint, position });
  const t0 = performance.now();
  const { result, raw, providerMeta } = await provider.vision({
    image, prompt, apiKey, endpoint, model, signal
  });
  const elapsed = Math.round(performance.now() - t0);
  return {
    result: normalize(result),
    raw,
    elapsedMs: elapsed,
    provider: providerMeta.provider,
    model: providerMeta.model
  };
}
