import { extractJSON } from "./prompts.js";

export const id = "gemini";
export const label = "Google Gemini";
export const defaultModel = "gemini-2.5-flash";
export const keyHint = "AIza… (aistudio.google.com)";
export const placeholder = "AIzaSy…";

export async function vision({ image, prompt, apiKey, model = defaultModel, signal }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      contents: [{
        parts: [
          { inlineData: { mimeType: image.mime, data: image.base64 } },
          { text: prompt }
        ]
      }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1200, topP: 0.85, responseMimeType: "application/json" },
      safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      ],
    })
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(`Gemini · ${e?.error?.message || res.status}`);
  }
  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const parsed = extractJSON(raw);
  if (!parsed) throw new Error(`Gemini · risposta non parsabile`);
  return { result: parsed, raw, providerMeta: { provider: id, model } };
}
