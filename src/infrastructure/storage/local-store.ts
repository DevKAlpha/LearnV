/**
 * A validated, shared view of one localStorage key.
 *
 * - Reads go through `parse`, so corrupted or hand-edited data never reaches the UI.
 * - Every subscriber shares one cached value and one `storage` listener, instead of each
 *   component re-reading storage and attaching its own listeners.
 * - Changes from other tabs (and `localStorage.clear()`) are picked up automatically.
 * - `get()` returns a stable reference until the value changes, as `useSyncExternalStore` requires.
 */
export type StoreStorage = Pick<Storage, "getItem" | "setItem">;

export type LocalStore<T> = {
  readonly key: string;
  get(): T;
  /** Applies an update; returns false when storage refused it (the value is still kept in memory). */
  set(next: T | ((current: T) => T)): boolean;
  /** Re-reads storage, e.g. before a read-modify-write that must include other tabs' changes. */
  refresh(): T;
  subscribe(listener: () => void): () => void;
};

type StoreOptions<T> = {
  key: string;
  parse: (raw: unknown) => T;
  fallback: T;
  storage?: StoreStorage | null;
  events?: Pick<Window, "addEventListener" | "removeEventListener"> | null;
  onError?: (code: "read-failed" | "write-failed", error: unknown) => void;
};

function defaultStorage(): StoreStorage | null {
  try { return typeof localStorage === "undefined" ? null : localStorage; } catch { return null; }
}

export function createLocalStore<T>({
  key,
  parse,
  fallback,
  storage = defaultStorage(),
  events = typeof window === "undefined" ? null : window,
  onError,
}: StoreOptions<T>): LocalStore<T> {
  const listeners = new Set<() => void>();
  let lastRaw: string | null | undefined;
  let value = fallback;

  const read = () => {
    let raw: string | null = null;
    try { raw = storage?.getItem(key) ?? null; } catch (error) { onError?.("read-failed", error); }
    if (raw === lastRaw) return value;
    lastRaw = raw;
    try {
      value = raw === null ? fallback : parse(JSON.parse(raw));
    } catch (error) {
      onError?.("read-failed", error);
      value = fallback;
    }
    return value;
  };

  const notify = () => listeners.forEach((listener) => listener());

  const onStorage = (event: Event) => {
    const changedKey = (event as StorageEvent).key;
    if (changedKey !== key && changedKey !== null) return;
    const previous = value;
    if (read() !== previous) notify();
  };

  read();

  return {
    key,
    get: () => value,
    refresh: () => {
      const previous = value;
      const next = read();
      if (next !== previous) notify();
      return next;
    },
    set(next) {
      const resolved = typeof next === "function" ? (next as (current: T) => T)(value) : next;
      if (Object.is(resolved, value)) return true;
      value = resolved;
      let saved = true;
      try {
        const raw = JSON.stringify(resolved);
        storage?.setItem(key, raw);
        lastRaw = raw;
      } catch (error) {
        saved = false;
        onError?.("write-failed", error);
      }
      notify();
      return saved;
    },
    subscribe(listener) {
      if (listeners.size === 0) events?.addEventListener("storage", onStorage);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) events?.removeEventListener("storage", onStorage);
      };
    },
  };
}
