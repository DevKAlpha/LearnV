import { normalizeTestProgress } from "./language-path";
import { normalizeLearningJourney, sortRecentActivities } from "./learning-journey";
import { normalizeReviewState } from "./review-deck";
import { normalizeStickers } from "./milestones";

/**
 * Pure rules of account synchronisation: what to do with each stored entry, and how to merge
 * two copies that both changed since the last sync (three-way merge against that last copy).
 */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
/** Which copy changed most recently, for values that cannot be combined. */
export type Side = "local" | "remote";

type Sides = { base: Json | undefined; local: Json; remote: Json; newer: Side };
/**
 * - sum: counters; both increments are kept (base + Δlocal + Δremote).
 * - max / min: best scores, first or last dates (ISO strings compare in order).
 * - any: a flag that stays true once either copy set it.
 * - newer: the whole value from the most recent copy, never mixed field by field.
 * - a function: custom choice, e.g. the card with the latest review.
 */
export type MergeRule = "sum" | "max" | "min" | "any" | "newer" | ((sides: Sides) => Json);
export type MergeSpec = {
  /** Matched against the dotted path of a value both copies changed (array items with an `id` use it). */
  rules?: ReadonlyArray<readonly [RegExp, MergeRule]>;
  /** Re-validates a merged value. Runs only after a real merge. */
  finalize?: (merged: Json, sides: { base: Json | undefined; local: Json; remote: Json }) => Json;
};

const isObject = (value: Json | undefined): value is { [key: string]: Json } => typeof value === "object" && value !== null && !Array.isArray(value);
const hasOwn = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);

/** JSON with sorted object keys: equal values give equal text whatever the key order. */
export function canonicalJson(value: Json | undefined): string {
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (isObject(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

const same = (a: Json | undefined, b: Json | undefined) => a === b || canonicalJson(a) === canonicalJson(b);

/** cyrb53: fast 53-bit text hash, enough to notice that a stored value changed. Not cryptographic. */
export function hashText(text: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

function applyRule(rule: MergeRule, sides: Sides): Json | undefined {
  const { base, local, remote, newer } = sides;
  if (typeof rule === "function") return rule(sides);
  if (rule === "newer") return newer === "local" ? local : remote;
  if (rule === "sum" && typeof local === "number" && typeof remote === "number") {
    const start = typeof base === "number" ? base : 0;
    return Math.max(0, local + remote - start);
  }
  if ((rule === "max" || rule === "min") && typeof local === typeof remote && (typeof local === "number" || typeof local === "string")) {
    const localWins = rule === "max" ? local > (remote as typeof local) : local < (remote as typeof local);
    return localWins ? local : remote;
  }
  if (rule === "any" && typeof local === "boolean" && typeof remote === "boolean") return local || remote;
  return undefined;
}

const itemId = (item: Json) => isObject(item) && typeof item.id === "string" ? item.id : null;
const keyed = (items: Json[]) => items.length > 0 && items.every((item) => itemId(item) !== null);

function mergeArrays(path: string, base: Json | undefined, local: Json[], remote: Json[], newer: Side, spec: MergeSpec): Json[] {
  const baseItems = Array.isArray(base) ? base : [];
  if (keyed(local) && keyed(remote) && (baseItems.length === 0 || keyed(baseItems))) {
    // Items with an id (tasks, mistakes, log entries): merge item by item, keep local order.
    const byId = (items: Json[]) => new Map(items.map((item) => [itemId(item)!, item]));
    const [b, l, r] = [byId(baseItems), byId(local), byId(remote)];
    const order = [...l.keys(), ...[...r.keys()].filter((id) => !l.has(id))];
    return order.flatMap((id) => {
      const merged = mergeValue(`${path}.${id}`, b.get(id), l.get(id), r.get(id), newer, spec);
      return merged === undefined ? [] : [merged];
    });
  }
  // Plain values (dates, ids, events): a set. Items removed on one side stay removed.
  const text = (items: Json[]) => new Set(items.map(canonicalJson));
  const [b, l, r] = [text(baseItems), text(local), text(remote)];
  const removed = (item: string) => b.has(item) && (!l.has(item) || !r.has(item));
  const seen = new Set<string>();
  return [...local, ...remote].filter((item) => {
    const key = canonicalJson(item);
    if (seen.has(key) || removed(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeValue(path: string, base: Json | undefined, local: Json | undefined, remote: Json | undefined, newer: Side, spec: MergeSpec): Json | undefined {
  if (same(local, remote)) return local;
  if (same(base, local)) return remote;
  if (same(base, remote)) return local;
  // Both copies changed this value. A deletion loses against an edit: no work is thrown away.
  if (local === undefined) return remote;
  if (remote === undefined) return local;
  const rule = spec.rules?.find(([pattern]) => pattern.test(path))?.[1];
  if (rule) {
    const ruled = applyRule(rule, { base, local, remote, newer });
    if (ruled !== undefined) return ruled;
  }
  if (isObject(local) && isObject(remote)) {
    const baseObject = isObject(base) ? base : {};
    const result: { [key: string]: Json } = {};
    for (const key of new Set([...Object.keys(local), ...Object.keys(remote)])) {
      const merged = mergeValue(path ? `${path}.${key}` : key, hasOwn(baseObject, key) ? baseObject[key] : undefined,
        hasOwn(local, key) ? local[key] : undefined, hasOwn(remote, key) ? remote[key] : undefined, newer, spec);
      if (merged !== undefined) result[key] = merged;
    }
    return result;
  }
  if (Array.isArray(local) && Array.isArray(remote)) return mergeArrays(path, base, local, remote, newer, spec);
  return newer === "local" ? local : remote;
}

/** Three-way merge of two JSON values. `undefined` stands for a missing or deleted entry. */
export function mergeJson(base: Json | undefined, local: Json | undefined, remote: Json | undefined, newer: Side, spec: MergeSpec = {}): Json | undefined {
  if (same(local, remote) || same(base, local) || same(base, remote) || local === undefined || remote === undefined) {
    return mergeValue("", base, local, remote, newer, spec);
  }
  const merged = mergeValue("", base, local, remote, newer, spec);
  return merged === undefined || !spec.finalize ? merged : spec.finalize(merged, { base, local, remote });
}

/** The copy whose `field` (an ISO date or a timestamp) is later; ties go to the newer copy. */
export const latestBy = (field: string): MergeRule => ({ local, remote, newer }) => {
  const value = (item: Json) => isObject(item) ? item[field] : undefined;
  const [l, r] = [value(local), value(remote)];
  const rank = (item: Json | undefined) => typeof item === "number" ? item : typeof item === "string" ? Date.parse(item) || 0 : -1;
  if (rank(l) === rank(r)) return newer === "local" ? local : remote;
  return rank(l) > rank(r) ? local : remote;
};

/**
 * How each LearnV entry merges. Entries not listed merge generically: objects key by key,
 * lists as sets, and conflicting single values from the most recent copy.
 */
export const syncMergeSpecs: Record<string, MergeSpec> = {
  "learnv-learning-journey-v1": {
    rules: [
      [/^(sessionCount|totalActiveSeconds)$/, "sum"],
      [/^(dailySeconds|routeVisits|resourceOpens)\.[^.]+$/, "sum"],
      [/^skillStats\.[^.]+\.(attempts|completions)$/, "sum"],
      [/^skillStats\.[^.]+\.bestScore$/, "max"],
      [/^skillStats\.[^.]+\.lastActivityAt$/, "max"],
      [/^longestStreak$/, "max"],
      [/^firstSeenAt$/, "min"],
      [/^lastSeenAt$/, "max"],
    ],
    // Streaks are recomputed from the merged practice days; activities are re-sorted and capped.
    finalize: (merged) => sortRecentActivities(normalizeLearningJourney(merged)) as unknown as Json,
  },
  "learnv-language-tests-v1": {
    rules: [
      [/^(en|ko)\.[^.]+\.attempts$/, "sum"],
      [/^(en|ko)\.[^.]+\.bestScore$/, "max"],
      [/^(en|ko)\.[^.]+\.passed$/, "any"],
      [/^(en|ko)\.[^.]+\.lastCompletedAt$/, "max"],
    ],
    finalize: (merged) => normalizeTestProgress(merged) as unknown as Json,
  },
  "learnv-review-v1": {
    // A card's memory state only makes sense as a whole: keep the most recently reviewed one.
    rules: [[/^cards\.[^.]+$/, latestBy("lastReview")], [/^(days|introduced)\.[^.]+$/, "sum"]],
    finalize: (merged) => normalizeReviewState(merged) as unknown as Json,
  },
  "learnv-stickers-v1": {
    // A sticker earned on two devices keeps the first date.
    rules: [[/^earned\.[^.]+$/, "min"]],
    finalize: (merged) => normalizeStickers(merged) as unknown as Json,
  },
  "learnv-task-board-v1": {
    rules: [[/^tasks\.[^.]+$/, latestBy("updatedAt")]],
    // A new revision, so open tabs holding either copy notice the change before saving over it.
    finalize: (merged, { base, local, remote }) => {
      const revision = (value: Json | undefined) => isObject(value) && typeof value.revision === "number" ? value.revision : 0;
      return isObject(merged) ? { ...merged, revision: Math.max(revision(base), revision(local), revision(remote)) + 1 } : merged;
    },
  },
};

/** Merges two stored texts (null = absent). Unparseable copies lose to parseable ones. */
export function mergeStoredText(key: string, base: string | null, local: string | null, remote: string | null, newer: Side): string | null {
  const parse = (text: string | null): Json | undefined => {
    if (text === null) return undefined;
    try { return JSON.parse(text) as Json; } catch { return undefined; }
  };
  const merged = mergeJson(parse(base), parse(local), parse(remote), newer, syncMergeSpecs[key.split(":")[0]!]);
  return merged === undefined ? null : JSON.stringify(merged);
}

export type SyncBase = { revision: number; hash: string | null };
export type SyncRemote = { revision: number; deleted: boolean };
export type SyncDecision = "skip" | "pull" | "push" | "merge";

/**
 * What to do with one entry, comparing this device's copy with the copy at the last sync
 * (`base`) and the account's current revision (`remote`).
 */
export function decideSync(localHash: string | null, base: SyncBase | null, remote: SyncRemote | null): SyncDecision {
  const localChanged = localHash !== (base?.hash ?? null);
  const remoteChanged = (remote?.revision ?? 0) !== (base?.revision ?? 0);
  if (!remoteChanged) return localChanged ? "push" : "skip";
  // The account no longer has an entry this device synced (erased drafts, an expired deletion
  // marker): upload this device's copy again.
  if (!remote) return localHash === null ? "skip" : "push";
  if (!localChanged) return "pull";
  return "merge";
}
