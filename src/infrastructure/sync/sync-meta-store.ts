import { createLocalStore } from "@/infrastructure/storage/local-store";

/** Why the last synchronisation stopped, shown in Profile. */
export type SyncIssue = "offline" | "signed-out" | "quota" | "server" | "conflict";

/** What this device knew about one entry at the last successful sync. */
export type SyncDocumentMeta = {
  /** Account revision of the copy this device holds. */
  revision: number;
  /** Hash of that copy (null: absent). */
  hash: string | null;
  /** Hash last seen in localStorage, to timestamp local edits. */
  seenHash: string | null;
  /** When this device first saw its current local copy (approximate time of the last local edit). */
  changedAt: string | null;
};

export type SyncMeta = {
  version: 1;
  account: { id: string; email: string } | null;
  /** Free-text drafts are synchronised only when the person turns this on. */
  includeDrafts: boolean;
  lastSyncAt: string | null;
  lastIssue: SyncIssue | null;
  docs: Record<string, SyncDocumentMeta>;
};

export const SYNC_META_KEY = "learnv-sync-v1";
export const emptySyncMeta: SyncMeta = { version: 1, account: null, includeDrafts: false, lastSyncAt: null, lastIssue: null, docs: {} };

const ISSUES = new Set<SyncIssue>(["offline", "signed-out", "quota", "server", "conflict"]);
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const isoOrNull = (value: unknown) => typeof value === "string" && value.length <= 40 && Number.isFinite(Date.parse(value)) ? value : null;
const shortText = (value: unknown, max: number) => typeof value === "string" && value.length > 0 && value.length <= max ? value : null;
const hashOrNull = (value: unknown) => typeof value === "string" && /^[0-9a-z]{1,16}$/.test(value) ? value : null;

export function normalizeSyncMeta(raw: unknown): SyncMeta {
  if (!isRecord(raw) || raw.version !== 1) return emptySyncMeta;
  const account = isRecord(raw.account) && shortText(raw.account.id, 64) && shortText(raw.account.email, 254)
    ? { id: raw.account.id as string, email: raw.account.email as string }
    : null;
  const docs: Record<string, SyncDocumentMeta> = {};
  if (account && isRecord(raw.docs)) {
    for (const [key, value] of Object.entries(raw.docs)) {
      if (!/^learnv-[a-z0-9:-]{1,100}$/.test(key) || !isRecord(value)) continue;
      const revision = value.revision;
      if (typeof revision !== "number" || !Number.isSafeInteger(revision) || revision < 0) continue;
      docs[key] = { revision, hash: hashOrNull(value.hash), seenHash: hashOrNull(value.seenHash), changedAt: isoOrNull(value.changedAt) };
    }
  }
  return {
    version: 1,
    account,
    includeDrafts: raw.includeDrafts === true,
    lastSyncAt: account ? isoOrNull(raw.lastSyncAt) : null,
    lastIssue: typeof raw.lastIssue === "string" && ISSUES.has(raw.lastIssue as SyncIssue) ? raw.lastIssue as SyncIssue : null,
    docs,
  };
}

/** Device-only bookkeeping (never synchronised, never in device backups). */
export const syncMetaStore = createLocalStore<SyncMeta>({ key: SYNC_META_KEY, parse: normalizeSyncMeta, fallback: emptySyncMeta });
