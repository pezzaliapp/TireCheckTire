// IndexedDB wrapper. Keeps jobs + photos. Designed for the legal vault: append-only writes
// of "documents" (signed, hashed) and append-only "events" (audit log).

const DB_NAME = "tct";
const DB_VERSION = 1;

let dbPromise = null;

function open() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("jobs")) {
        const s = db.createObjectStore("jobs", { keyPath: "id" });
        s.createIndex("by_created", "createdAt");
        s.createIndex("by_plate", "vehicle.plate");
        s.createIndex("by_status", "status");
      }
      if (!db.objectStoreNames.contains("events")) {
        const s = db.createObjectStore("events", { keyPath: "id" });
        s.createIndex("by_job", "jobId");
        s.createIndex("by_time", "at");
      }
      if (!db.objectStoreNames.contains("kv")) {
        db.createObjectStore("kv");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(store, mode = "readonly") {
  return open().then(db => db.transaction(store, mode).objectStore(store));
}

function p(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const jobs = {
  async put(job) { const s = await tx("jobs", "readwrite"); return p(s.put(job)); },
  async get(id)   { const s = await tx("jobs"); return p(s.get(id)); },
  async all() {
    const s = await tx("jobs");
    return new Promise(resolve => {
      const out = [];
      const cur = s.index("by_created").openCursor(null, "prev");
      cur.onsuccess = e => {
        const c = e.target.result;
        if (!c) return resolve(out);
        out.push(c.value);
        c.continue();
      };
    });
  },
  async byPlate(plate) {
    const s = await tx("jobs");
    return p(s.index("by_plate").getAll(plate));
  },
  async remove(id) { const s = await tx("jobs", "readwrite"); return p(s.delete(id)); },
};

export const events = {
  async push(e) { const s = await tx("events", "readwrite"); return p(s.put(e)); },
  async forJob(jobId) {
    const s = await tx("events");
    return p(s.index("by_job").getAll(jobId));
  },
};

export const kv = {
  async get(k) { const s = await tx("kv"); return p(s.get(k)); },
  async set(k, v) { const s = await tx("kv", "readwrite"); return p(s.put(v, k)); },
};
