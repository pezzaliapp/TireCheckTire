// Ollama-compatible endpoint. For Gemma / LLaVA / Qwen-VL running on the local LAN.
// User configures a base URL (e.g. http://192.168.1.20:11434). Key field doubles as model name override.

import { extractJSON } from "./prompts.js";

export const id = "ollama";
export const label = "Ollama / locale";
export const defaultModel = "gemma3:4b";
export const keyHint = "http://host:11434 (LAN locale)";
export const placeholder = "http://10.0.0.10:11434";
export const usesEndpointAsKey = true;

export async function vision({ image, prompt, apiKey, endpoint, model = defaultModel, signal }) {
  const base = (endpoint || apiKey || "http://localhost:11434").replace(/\/+$/, "");
  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      messages: [{
        role: "user",
        content: prompt,
        images: [image.base64]
      }],
      options: { temperature: 0.2 }
    })
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Ollama · ${txt || res.status}`);
  }
  const data = await res.json();
  const raw = data?.message?.content || "";
  const parsed = extractJSON(raw);
  if (!parsed) throw new Error(`Ollama · risposta non parsabile`);
  return { result: parsed, raw, providerMeta: { provider: id, model } };
}
