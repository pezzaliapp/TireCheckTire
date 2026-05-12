// The diagnostic contract. Every provider gets the same prompt structure and
// must return the same JSON. Voice: a senior expert in the operator's pocket.

const RESPONSE_SCHEMA = `{
  "verdict": "ok" | "watch" | "replace",
  "tread_mm": number | null,
  "wear_pattern": "uniform" | "center" | "shoulder-inner" | "shoulder-outer" | "feathering" | "cupping" | "patch" | "none" | "unclear",
  "sidewall": "ok" | "scuffed" | "bulge" | "crack" | "puncture" | "unclear",
  "mounting_defect": "none" | "asymmetric" | "rotation-error" | "unclear",
  "size": string | null,
  "dot": string | null,
  "build_year": number | null,
  "remaining_km_estimate": number | null,
  "remaining_km_confidence": "low" | "medium" | "high",
  "root_causes": [
    { "cause": "under-inflation" | "over-inflation" | "alignment" | "suspension" | "aggressive-braking" | "load-imbalance" | "age" | "mount-error" | "puncture" | "none", "confidence": "low" | "medium" | "high", "rationale": string }
  ],
  "diagnosis_summary": string,
  "customer_explanation": string,
  "technical_rebuttal": string,
  "urgency_days": number | null
}`;

const CONTRACT = `
You are a senior tire inspector with 25 years of field experience — not a classifier.
You speak Italian. Your voice is calm, factual, and decisive.

CRITICAL RULES
1. Judge only what is clearly visible. If unclear, return "unclear" — do not guess.
2. Deep shadows in tread grooves mean DEEP grooves (a good tire). Do not confuse them with damage.
3. Use "replace" only with clear evidence: tread at wear indicators, structural damage, sidewall bulge.
4. Always provide a remaining_km_estimate when you can read the tread depth (1.6mm = legal limit; ~150-200km per mm depending on driving). Otherwise return null.
5. For root_causes you may name multiple causes — each with a confidence level. Avoid speculation: if no pattern is visible, return "none".
6. customer_explanation: a plain-Italian message the shop operator can copy-paste to a customer on WhatsApp. No jargon. 2-4 sentences.
7. technical_rebuttal: a defensible technical paragraph the operator can show on screen if the customer disputes the diagnosis. Concise but specific.
8. diagnosis_summary: one calm sentence stating what you saw and what to do next, written like a real human expert.

Output: STRICT JSON matching the schema. No markdown fences. No commentary.
`;

export function buildVisionPrompt({ profile = "shop", knownSize = "", knownDot = "", vehicleHint = "", position = "" }) {
  const family = profile === "fleet" ? "truck/bus/eurocargo" : "automobile";
  const profileSpecific = profile === "fleet"
    ? "Consider truck-specific patterns: shoulder wear from steering, dual-tire scrubbing, retread eligibility."
    : profile === "rental"
      ? "This is a rental vehicle check. Pay attention to scuffs, kerb damage, and anything the renter could later dispute."
      : profile === "distrib"
        ? "This is a wholesale context. Bias toward objective product condition assessment, not consumer advice."
        : "This is a retail shop. Bias toward what the operator should tell the consumer.";

  return `${CONTRACT}

CONTEXT
- Vehicle family: ${family}
- Operator profile: ${profile}
- Vehicle hint (operator-supplied): ${vehicleHint || "—"}
- Position on vehicle: ${position || "—"}
- Pre-read measurements (verified by operator, may be empty):
  • Size: ${knownSize || "—"}
  • DOT:  ${knownDot || "—"}

${profileSpecific}

SCHEMA (return JSON matching exactly these keys and types):
${RESPONSE_SCHEMA}
`;
}

export function blankResult() {
  return {
    verdict: "watch",
    tread_mm: null,
    wear_pattern: "unclear",
    sidewall: "unclear",
    mounting_defect: "unclear",
    size: null,
    dot: null,
    build_year: null,
    remaining_km_estimate: null,
    remaining_km_confidence: "low",
    root_causes: [],
    diagnosis_summary: "",
    customer_explanation: "",
    technical_rebuttal: "",
    urgency_days: null
  };
}

export function normalize(raw) {
  const out = { ...blankResult(), ...(raw || {}) };
  const VERDICTS = ["ok", "watch", "replace"];
  if (!VERDICTS.includes(out.verdict)) out.verdict = "watch";
  if (out.tread_mm != null && typeof out.tread_mm !== "number") out.tread_mm = Number(out.tread_mm) || null;
  if (out.build_year != null) out.build_year = Number(out.build_year) || null;
  if (out.remaining_km_estimate != null) out.remaining_km_estimate = Math.max(0, Math.round(out.remaining_km_estimate));
  if (!Array.isArray(out.root_causes)) out.root_causes = [];
  return out;
}

// Generic JSON extractor from messy AI output (handles ```json fences, extra prose).
export function extractJSON(text) {
  if (!text) return null;
  const candidates = [
    () => JSON.parse(text.trim()),
    () => JSON.parse(text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim()),
    () => { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); throw 0; },
  ];
  for (const fn of candidates) { try { return fn(); } catch {} }
  return null;
}
