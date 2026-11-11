// Tiny on purpose: imported at start-up, so it must not pull the backup module into the entry chunk.
/**
 * Asks the browser to keep LearnV's storage under storage pressure (and, in Safari, to
 * avoid the 7-day eviction of script-writable storage). Resolves null when unsupported.
 */
export async function requestPersistentStorage(): Promise<boolean | null> {
  try {
    if (typeof navigator === "undefined" || !navigator.storage?.persist) return null;
    if (await navigator.storage.persisted?.()) return true;
    return await navigator.storage.persist();
  } catch {
    return null;
  }
}

export async function isStoragePersisted(): Promise<boolean | null> {
  try {
    if (typeof navigator === "undefined" || !navigator.storage?.persisted) return null;
    return await navigator.storage.persisted();
  } catch {
    return null;
  }
}
