import type { Account } from "@learnv/schemas/sync-api";
import { announceStorageChange } from "@/infrastructure/storage/storage-events";
import { createSyncApi, type SyncApi } from "@/infrastructure/sync/sync-api-client";
import { indexedDbBaseStore, type SyncBaseStore } from "@/infrastructure/sync/sync-base-store";
import { syncApiBase } from "@/infrastructure/sync/sync-config";
import { emptySyncMeta, syncMetaStore } from "@/infrastructure/sync/sync-meta-store";
import { runSync, type SyncReport } from "./sync-engine";

/**
 * Wires the sync engine to the browser. Lazy module: it pulls in the API client and zod,
 * so the startup bundle only carries the small auto-sync trigger (useAccountAutoSync).
 */
let api: SyncApi | null = null;
let base: SyncBaseStore | null = null;
let running: Promise<SyncReport | null> | null = null;

export function syncApi(): SyncApi {
  if (!syncApiBase) throw new Error("This build has no account API");
  return (api ??= createSyncApi(syncApiBase));
}

function baseStore() {
  return (base ??= indexedDbBaseStore());
}

/** One pass at a time per browser: other tabs skip while one is syncing. */
function exclusive(work: () => Promise<SyncReport>): Promise<SyncReport | null> {
  if (typeof navigator === "undefined" || !navigator.locks) return work();
  return navigator.locks.request("learnv-sync", { ifAvailable: true }, (lock) => (lock ? work() : null)) as Promise<SyncReport | null>;
}

export function syncNow(options: { keepalive?: boolean } = {}): Promise<SyncReport | null> {
  if (!syncApiBase || !syncMetaStore.get().account) return Promise.resolve(null);
  running ??= exclusive(() => runSync({
    api: syncApi(),
    storage: localStorage,
    base: baseStore(),
    meta: syncMetaStore,
    announce: announceStorageChange,
    keepalive: options.keepalive,
  })).finally(() => { running = null; });
  return running;
}

/** Records a sign-in. A different account than before starts from a clean slate. */
export async function rememberAccount(account: Account) {
  const current = syncMetaStore.refresh();
  if (current.account?.id !== account.id) {
    await baseStore().clear();
    syncMetaStore.set({ ...emptySyncMeta, includeDrafts: current.account ? false : current.includeDrafts, account: { id: account.id, email: account.email } });
  } else if (current.account.email !== account.email) {
    syncMetaStore.set({ ...current, account: { id: account.id, email: account.email } });
  }
}

/** Forgets the account on this device. Local data stays: it belongs to the device. */
export async function forgetAccount() {
  await baseStore().clear();
  syncMetaStore.set((current) => ({ ...emptySyncMeta, includeDrafts: current.includeDrafts }));
}
