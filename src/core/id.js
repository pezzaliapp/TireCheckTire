// Crockford-base32 ULID. Sortable, no external dep.
const C = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function rand(n) {
  const out = new Uint8Array(n);
  crypto.getRandomValues(out);
  return out;
}

function enc(num, len) {
  let out = "";
  for (let i = len - 1; i >= 0; i--) {
    out = C[Number(num & 31n)] + out;
    num >>= 5n;
  }
  return out;
}

export function ulid(time = Date.now()) {
  const t = enc(BigInt(time), 10);
  const r = rand(10);
  let acc = 0n;
  for (let i = 0; i < 10; i++) acc = (acc << 8n) | BigInt(r[i]);
  return t + enc(acc, 16);
}

export function shortId(n = 6) {
  const r = rand(n);
  let out = "";
  for (const b of r) out += C[b % 32];
  return out;
}
