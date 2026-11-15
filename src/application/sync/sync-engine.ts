import { isDraftKey, isSyncKey, MAX_SYNC_DOCUMENTS } from "@learnv/schemas/sync-keys";
import type { ManifestEntry, PushChange, PushResult, SyncDocument } from "@learnv/schemas/sync-api";
import { decideSync, hashText, mergeStoredText, type Side } from "@/domain/models/sync-merge";
import type { LocalStore } from "@/infrastructure/storage/local-store";
import { SyncApiError, type SyncApi } from "@/infrastructure/sync/sync-api-client";
import type { SyncBaseStore } from "@/infrastructure/sync/sync-base-store";
import type { SyncDocumentMeta, SyncIssue, SyncMeta } from "@/infrastructure/sync/sync-meta-store";

export type SyncStorage = Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length">;

export type SyncDeps = {
  api: SyncApi;
  storage: SyncStorage;
  base: SyncBaseStore;
  meta: LocalStore<SyncMeta>;
  now?: () => Date;
  /** Tells this tab's stores that an entry changed (see announceStorageChange). */
  announce?: (key: string, oldValue: string | null, newValue: string | null) => void;
  /** Push with `keepalive`, for the last sync when the page is being hidden. */
  keepalive?: boolean;
};

export type SyncReport = { pulled: number; pushed: number; merged: number; issue: SyncIssue | null };

/** One request stays well below the API body limit (8 MB) even for non-Latin text. */
const MAX_PUSH_CHARS = 1_800_000;
/** keepalive requests may carry at most 64 KiB. */
const KEEPALIVE_CHARS = 60_000;
const MAX_CONFLICT_ROUNDS = 3;

function issueFor(error: unknown): SyncIssue {
  if (error instanceof SyncApiError) {
    if (error.status === 0) return "offline";
    if (error.status === 401) return "signed-out";
    if (error.status === 413) return "quota";
  }
  return "server";
}

function chunk(changes: PushChange[], limit: number) {
  const batches: PushChange[][] = [];
  let current: PushChange[] = [];
  let size = 0;
  for (const change of changes) {
    const length = change.value?.length ?? 0;
    if (current.length && (size + length > limit || current.length >= MAX_SYNC_DOCUMENTS)) {
      batches.push(current);
      current = [];
      size = 0;
    }
    current.push(change);
    size += length;
  }
  if (current.length) batches.push(current);
  return batches;
}

/**
 * One synchronisation pass. This device stays the source of truth for its own data:
 * 1. local edits are timestamped (first time a new hash is seen);
 * 2. the account manifest says which entries changed elsewhere;
 * 3. untouched local entries take the account copy, untouched account entries take the
 *    local copy, and entries changed on both sides are merged three-way and uploaded;
 * 4. a write refused because another device got there first is merged again (a few rounds).
 */
export async function runSync(deps: SyncDeps): Promise<SyncReport> {
  const now = deps.now ?? (() => new Date());
  const report: SyncReport = { pulled: 0, pushed: 0, merged: 0, issue: null };
  const meta = deps.meta.refresh();
  if (!meta.account) return { ...report, issue: "signed-out" };
  const wanted = (key: string) => isSyncKey(key) && (meta.includeDrafts || !isDraftKey(key));
  const docs: Record<string, SyncDocumentMeta> = { ...meta.docs };
  const stamp = now().toISOString();

  const readLocal = () => {
    const local = new Map<string, string>();
    for (let index = 0; index < deps.storage.length; index += 1) {
      const key = deps.storage.key(index);
      if (!key || !wanted(key)) continue;
      const value = deps.storage.getItem(key);
      if (value !== null) local.set(key, value);
    }
    return local;
  };

  const writeLocal = (key: string, value: string | null) => {
    const previous = deps.storage.getItem(key);
    if (previous === value) return;
    if (value === null) deps.storage.removeItem(key);
    else deps.storage.setItem(key, value);
    deps.announce?.(key, previous, value);
  };

  const remember = (key: string, revision: number, value: string | null) => {
    const hash = value === null ? null : hashText(value);
    docs[key] = { revision, hash, seenHash: hash, changedAt: docs[key]?.changedAt ?? null };
  };

  const finish = (issue: SyncIssue | null) => {
    deps.meta.set((current) => {
      // Signed out, or another account signed in meanwhile: this pass's bookkeeping no longer applies.
      if (current.account?.id !== meta.account!.id) return current;
      if (issue === "signed-out") return { ...current, account: null, docs: {}, lastSyncAt: null, lastIssue: issue };
      const completed = issue === null || issue === "quota" || issue === "conflict";
      return { ...current, docs, lastSyncAt: completed ? stamp : current.lastSyncAt, lastIssue: issue };
    });
    return { ...report, issue };
  };

  try {
    const local = readLocal();
    // 1. Notice local edits since the last pass.
    for (const key of new Set([...local.keys(), ...Object.keys(docs)])) {
      if (!wanted(key)) continue;
      const hash = local.has(key) ? hashText(local.get(key)!) : null;
      const known = docs[key];
      if (known && known.seenHash !== hash) docs[key] = { ...known, seenHash: hash, changedAt: stamp };
      else if (!known && hash !== null) docs[key] = { revision: 0, hash: null, seenHash: hash, changedAt: stamp };
    }

    // 2. What changed on the account.
    const manifest = await deps.api.manifest();
    const remote = new Map<string, ManifestEntry>(manifest.documents.filter((entry) => wanted(entry.key)).map((entry) => [entry.key, entry]));

    const decisions = new Map<string, ReturnType<typeof decideSync>>();
    for (const key of new Set([...local.keys(), ...remote.keys(), ...Object.keys(docs).filter(wanted)])) {
      const known = docs[key];
      const base = known && (known.revision > 0 || known.hash !== null) ? { revision: known.revision, hash: known.hash } : null;
      const entry = remote.get(key);
      const decision = decideSync(local.has(key) ? hashText(local.get(key)!) : null, base, entry ? { revision: entry.revision, deleted: entry.deleted } : null);
      if (decision !== "skip") decisions.set(key, decision);
      // Forget entries that exist nowhere any more.
      else if (!local.has(key) && !entry) delete docs[key];
    }

    const needed = [...decisions].filter(([key, decision]) => decision !== "push" && remote.get(key)?.deleted === false).map(([key]) => key);
    const pulled = new Map<string, SyncDocument>((needed.length ? await deps.api.pull(needed) : []).map((document) => [document.key, document]));
    const baseUpdates: Array<[string, string | null]> = [];
    let pending: PushChange[] = [];

    const mergeWith = async (key: string, current: { revision: number; updatedAt: string; value: string | null }) => {
      const mine = deps.storage.getItem(key);
      const newer: Side = (docs[key]?.changedAt ?? "") > current.updatedAt ? "local" : "remote";
      const base = docs[key]?.hash ? await deps.base.get(key) : null;
      const merged = mergeStoredText(key, base, mine, current.value, newer);
      report.merged += 1;
      if (merged !== mine) writeLocal(key, merged);
      return { key, baseRevision: current.revision, value: merged };
    };

    // 3. Apply account copies and prepare uploads.
    for (const [key, decision] of decisions) {
      const entry = remote.get(key);
      if (decision === "pull" && entry) {
        const value = entry.deleted ? null : pulled.get(key)?.value ?? null;
        writeLocal(key, value);
        remember(key, entry.revision, value);
        baseUpdates.push([key, value]);
        report.pulled += 1;
      } else if (decision === "push") {
        pending.push({ key, baseRevision: entry?.revision ?? 0, value: local.get(key) ?? null });
      } else if (decision === "merge" && entry) {
        const current = pulled.get(key) ?? { revision: entry.revision, updatedAt: entry.updatedAt, value: null };
        pending.push(await mergeWith(key, current));
      }
    }

    // 4. Upload, merging again when another device wrote first.
    let quota = false;
    for (let round = 0; pending.length && round < MAX_CONFLICT_ROUNDS; round += 1) {
      const limit = deps.keepalive ? KEEPALIVE_CHARS : MAX_PUSH_CHARS;
      const retry: PushChange[] = [];
      for (const batch of chunk(pending, limit)) {
        const size = batch.reduce((sum, change) => sum + (change.value?.length ?? 0), 0);
        const results: PushResult[] = await deps.api.push(batch, { keepalive: deps.keepalive === true && size <= KEEPALIVE_CHARS });
        for (const result of results) {
          const sent = batch.find((change) => change.key === result.key);
          if (!sent) continue;
          if (result.status === "ok") {
            remember(result.key, result.revision, sent.value);
            baseUpdates.push([result.key, sent.value]);
            report.pushed += 1;
          } else if (result.status === "conflict") {
            retry.push(await mergeWith(result.key, result.current));
          } else {
            quota = true;
          }
        }
      }
      pending = retry;
    }
    await deps.base.set(baseUpdates);
    return finish(quota ? "quota" : pending.length ? "conflict" : null);
  } catch (error) {
    return finish(issueFor(error));
  }
}
