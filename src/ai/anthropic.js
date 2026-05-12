import { extractJSON } from "./prompts.js";

export const id = "anthropic";
export const label = "Anthropic Claude";
export const defaultModel = "claude-sonnet-4-6";
export const keyHint = "sk-ant-… (console.anthropic.com)";
export const placeholder = "sk-ant-…";

export async function vision({ image, prompt, apiKey, model = defaultModel, signal }) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal,
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      temperature: 0.2,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: image.mime, data: image.base64 } },
          { type: "text", text: prompt + "\n\nIMPORTANT: respond with strict JSON only, no other text." }
        ]
      }]
    })
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(`Anthropic · ${e?.error?.message || res.status}`);
  }
  const data = await res.json();
  const raw = data?.content?.map(b => b.text || "").join("") || "";
  const parsed = extractJSON(raw);
  if (!parsed) throw new Error(`Anthropic · risposta non parsabile`);
  return { result: parsed, raw, providerMeta: { provider: id, model } };
}
