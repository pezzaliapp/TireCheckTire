import { extractJSON } from "./prompts.js";

export const id = "mistral";
export const label = "Mistral";
export const defaultModel = "pixtral-large-latest";
export const keyHint = "sk-… (console.mistral.ai)";
export const placeholder = "…";

export async function vision({ image, prompt, apiKey, model = defaultModel, signal }) {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    signal,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 1500,
      response_format: { type: "json_object" },
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: `data:${image.mime};base64,${image.base64}` }
        ]
      }]
    })
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(`Mistral · ${e?.message || e?.error?.message || res.status}`);
  }
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content || "";
  const parsed = extractJSON(raw);
  if (!parsed) throw new Error(`Mistral · risposta non parsabile`);
  return { result: parsed, raw, providerMeta: { provider: id, model } };
}
