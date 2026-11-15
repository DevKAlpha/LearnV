/**
 * localStorage only fires `storage` events in *other* tabs. Code that rewrites entries in this
 * tab on someone else's behalf (account sync, backup restore) announces the change with the
 * same event, so stores and pages that already follow other tabs pick it up too.
 */
export function announceStorageChange(key: string, oldValue: string | null, newValue: string | null) {
  if (typeof window === "undefined") return;
  let storageArea: Storage | null = null;
  try { storageArea = window.localStorage; } catch { /* Storage blocked: listeners re-read anyway. */ }
  window.dispatchEvent(new StorageEvent("storage", { key, oldValue, newValue, storageArea, url: window.location.href }));
}

/** Calls `listener` when `key` changes in another tab or through `announceStorageChange`. Returns an unsubscribe function. */
export function onStorageKeyChange(key: string, listener: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (event: StorageEvent) => {
    if (event.key === key || event.key === null) listener();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
