/**
 * The copy of each entry as it was at the last successful sync: the common ancestor of a
 * three-way merge. Kept in IndexedDB so it does not compete with learner data for the
 * localStorage quota. Without IndexedDB (private modes, old browsers) merges fall back to
 * two-way, which keeps data from both copies.
 */
export type SyncBaseStore = {
  get(key: string): Promise<string | null>;
  set(entries: ReadonlyArray<readonly [string, string | null]>): Promise<void>;
  clear(): Promise<void>;
};

export function memoryBaseStore(): SyncBaseStore {
  const values = new Map<string, string>();
  return {
    async get(key) { return values.get(key) ?? null; },
    async set(entries) {
      for (const [key, value] of entries) {
        if (value === null) values.delete(key);
        else values.set(key, value);
      }
    },
    async clear() { values.clear(); },
  };
}

const DATABASE = "learnv-sync";
const STORE = "base";

function request<T>(operation: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    operation.onsuccess = () => resolve(operation.result);
    operation.onerror = () => reject(operation.error);
  });
}

function openDatabase(): Promise<IDBDatabase> {
  const opening = indexedDB.open(DATABASE, 1);
  opening.onupgradeneeded = () => opening.result.createObjectStore(STORE);
  return request(opening);
}

export function indexedDbBaseStore(): SyncBaseStore {
  if (typeof indexedDB === "undefined") return memoryBaseStore();
  let database: Promise<IDBDatabase> | null = null;
  const fallback = memoryBaseStore();
  const open = () => (database ??= openDatabase().catch((error: unknown) => { database = null; throw error; }));
  const run = async <T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T> | void, empty: T) => {
    try {
      const transaction = (await open()).transaction(STORE, mode);
      const result = work(transaction.objectStore(STORE));
      const done = new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
      const value = result ? await request(result) : empty;
      await done;
      return { ok: true as const, value };
    } catch {
      return { ok: false as const, value: empty };
    }
  };
  return {
    async get(key) {
      const result = await run<unknown>("readonly", (store) => store.get(key), null);
      if (!result.ok) return fallback.get(key);
      return typeof result.value === "string" ? result.value : null;
    },
    async set(entries) {
      const result = await run<undefined>("readwrite", (store) => {
        for (const [key, value] of entries) {
          if (value === null) store.delete(key);
          else store.put(value, key);
        }
      }, undefined);
      if (!result.ok) await fallback.set(entries);
    },
    async clear() {
      await run<undefined>("readwrite", (store) => { store.clear(); }, undefined);
      await fallback.clear();
    },
  };
}
