// A Job is the atomic unit: one vehicle on the lift right now.
// Append-only philosophy: each step adds to the structure.

import { createStore, settings } from "./state.js";
import { ulid } from "./id.js";
import { jobs as jobStore } from "./db.js";
import { hashJob } from "./hash.js";

export function newJob(profile = "shop") {
  return {
    id: ulid(),
    createdAt: new Date().toISOString(),
    profile,
    operator: settings.get("operator", { name: "", phone: "", piva: "", shopName: "" }),
    vehicle: { plate: "", type: profile === "fleet" ? "truck" : "auto", brand: "", model: "" },
    customer: { name: "", phone: "", email: "", piva: "" },
    shots: [],
    diagnoses: [],
    tires: [],
    services: [],
    notes: "",
    totals: { sub: 0, vat: 22, total: 0, currency: "EUR" },
    signature: null,
    documents: [],
    status: "open"
  };
}

export const job = createStore(null);

export function startJob(profile) {
  const j = newJob(profile);
  job.set(j);
  return j;
}

export function loadJob(j) { job.set(j); }

export function update(patch) {
  job.set(j => {
    const next = typeof patch === "function" ? patch(j) : { ...j, ...patch };
    recompute(next);
    return next;
  });
}

export function addShot(shot) {
  update(j => ({ ...j, shots: [...j.shots, shot] }));
}
export function addDiagnosis(dx) {
  update(j => ({ ...j, diagnoses: [...j.diagnoses, dx] }));
}

export async function persist() {
  const j = job.get();
  if (!j) return;
  await jobStore.put(j);
}

export async function archive() {
  const j = job.get();
  if (!j) return;
  j.status = j.signature ? "signed" : "quoted";
  j.archivedAt = new Date().toISOString();
  await jobStore.put(j);
}

function recompute(j) {
  const tireSub = j.tires.reduce((a, t) => a + (Number(t.priceUnit) || 0) * (Number(t.qty) || 1), 0);
  const svcSub  = j.services.reduce((a, s) => a + (Number(s.price) || 0) * (Number(s.qty) || 1), 0);
  const sub = tireSub + svcSub;
  const vat = Number(j.totals?.vat ?? 22);
  const total = sub * (1 + vat / 100);
  j.totals = { ...(j.totals || {}), sub, vat, total, currency: j.totals?.currency || "EUR" };
}

export async function rehash() {
  const j = job.get();
  if (!j) return null;
  const minimal = { ...j };
  delete minimal.shots; // hash captures only structured data, not blobs
  delete minimal.documents;
  delete minimal.signature?.dataUrl;
  return hashJob(minimal);
}
