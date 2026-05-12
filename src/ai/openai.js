import { extractJSON } from "./prompts.js";

export const id = "openai";
export const label = "OpenAI";
export const defaultModel = "gpt-4.1-mini";
export const keyHint = "sk-… (platform.openai.com)";
export const placeholder = "sk-…";

export async function vision({ image, prompt, apiKey, model = defaultModel, signal }) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:${image.mime};base64,${image.base64}` } }
          ]
        }
      ]
    })
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(`OpenAI · ${e?.error?.message || res.status}`);
  }
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content || "";
  const parsed = extractJSON(raw);
  if (!parsed) throw new Error(`OpenAI · risposta non parsabile`);
  return { result: parsed, raw, providerMeta: { provider: id, model } };
}
