// Web Crypto wrappers — for legal document anchoring.

export async function sha256(input) {
  const buf = typeof input === "string"
    ? new TextEncoder().encode(input)
    : input instanceof ArrayBuffer ? input : await input.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return hex(digest);
}

export function hex(buf) {
  const view = new Uint8Array(buf);
  let out = "";
  for (const b of view) out += b.toString(16).padStart(2, "0");
  return out;
}

export async function hashJob(job) {
  const canonical = canonicalize(job);
  return sha256(canonical);
}

// Stable JSON: keys sorted, no whitespace.
export function canonicalize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalize).join(",") + "]";
  const keys = Object.keys(value).sort();
  return "{" + keys.map(k => JSON.stringify(k) + ":" + canonicalize(value[k])).join(",") + "}";
}

export function shortHash(h, n = 12) {
  return h.slice(0, n);
}
