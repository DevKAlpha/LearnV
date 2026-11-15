import { describe, expect, it } from "vitest";
import type { ManifestResponse, PushChange, PushResult, SyncDocument } from "@learnv/schemas/sync-api";
import { createLocalStore } from "@/infrastructure/storage/local-store";
import { SyncApiError, type SyncApi } from "@/infrastructure/sync/sync-api-client";
import { memoryBaseStore } from "@/infrastructure/sync/sync-base-store";
import { emptySyncMeta, normalizeSyncMeta, type SyncMeta } from "@/infrastructure/sync/sync-meta-store";
import { runSync } from "./sync-engine";

class MemoryStorage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
  removeItem(key: string) { this.values.delete(key); }
  json(key: string) { return JSON.parse(this.getItem(key)!); }
}

/** Same revision rules as the API (apps/api/src/routes/sync.ts), in memory. */
class FakeServer {
  docs = new Map<string, { revision: number; value: string | null; updatedAt: string }>();
  clock = Date.parse("2026-11-15T10:00:00Z");
  /** Runs once before the next push: simulates another device writing in between. */
  beforePush: (() => void) | null = null;
  write(key: string, value: string | null) {
    const current = this.docs.get(key);
    this.clock += 1000;
    this.docs.set(key, { revision: (current?.revision ?? 0) + 1, value, updatedAt: new Date(this.clock).toISOString() });
  }
  api(options: { signedOut?: boolean; offline?: boolean } = {}): SyncApi {
    const guard = () => {
      if (options.offline) throw new SyncApiError(0, "offline");
      if (options.signedOut) throw new SyncApiError(401, "signed-out");
    };
    const unused = async () => { throw new Error("not used"); };
    return {
      requestMagicLink: unused, verify: unused, logout: unused, me: unused, exportAccount: unused, deleteAccount: unused, deleteDrafts: unused,
      manifest: async (): Promise<ManifestResponse> => {
        guard();
        return { documents: [...this.docs].map(([key, doc]) => ({ key, revision: doc.revision, updatedAt: doc.updatedAt, deleted: doc.value === null })), usage: { chars: 0, limit: 5_000_000 } };
      },
      pull: async (keys: string[]): Promise<SyncDocument[]> => {
        guard();
        return keys.flatMap((key) => {
          const doc = this.docs.get(key);
          return doc ? [{ key, ...doc }] : [];
        });
      },
      push: async (changes: PushChange[]): Promise<PushResult[]> => {
        guard();
        this.beforePush?.();
        this.beforePush = null;
        return changes.map((change) => {
          const current = this.docs.get(change.key);
          if ((current?.revision ?? 0) !== change.baseRevision) {
            return { key: change.key, status: "conflict", current: current ? { key: change.key, ...current } : { key: change.key, revision: 0, updatedAt: new Date(this.clock).toISOString(), value: null } };
          }
          if (change.value === null && !current) return { key: change.key, status: "ok", revision: 0, updatedAt: new Date(this.clock).toISOString() };
          this.write(change.key, change.value);
          const written = this.docs.get(change.key)!;
          return { key: change.key, status: "ok", revision: written.revision, updatedAt: written.updatedAt };
        });
      },
    };
  }
}

function device(server: FakeServer, meta: Partial<SyncMeta> = {}) {
  const storage = new MemoryStorage();
  const metaStore = createLocalStore<SyncMeta>({ key: "learnv-sync-v1", parse: normalizeSyncMeta, fallback: emptySyncMeta, storage, events: null });
  metaStore.set({ ...emptySyncMeta, account: { id: "user-1", email: "ana@example.com" }, ...meta });
  const base = memoryBaseStore();
  const announced: string[] = [];
  let clock = Date.parse("2026-11-15T09:00:00Z");
  const sync = (options: { signedOut?: boolean; offline?: boolean } = {}) => runSync({
    api: server.api(options), storage, base, meta: metaStore,
    now: () => new Date((clock += 60_000)),
    announce: (key) => announced.push(key),
  });
  return { storage, meta: metaStore, sync, announced, tick: (ms: number) => { clock += ms; } };
}

const journey = (sessionCount: number, activeDates: string[]) => JSON.stringify({ version: 2, firstSeenAt: "2026-11-01T00:00:00.000Z", lastSeenAt: "2026-11-14T00:00:00.000Z", activeDates, currentStreak: 0, longestStreak: 0, sessionCount, totalActiveSeconds: 0, dailySeconds: {}, routeVisits: {}, resourceOpens: {}, skillStats: {}, recentActivities: [] });

describe("runSync", () => {
  it("uploads learner data, never device-only entries or drafts unless enabled", async () => {
    const server = new FakeServer();
    const phone = device(server);
    phone.storage.setItem("learnv-language-tests-v1", '{"en":{},"ko":{}}');
    phone.storage.setItem("learnv-theme-v1", '"dark"');
    phone.storage.setItem("learnv-reminders-v1", "{}");
    phone.storage.setItem("learnv-written-simulator-v1", '{"essay":"secret"}');
    phone.storage.setItem("other-app", "1");
    const report = await phone.sync();
    expect(report).toEqual({ pulled: 0, pushed: 1, merged: 0, issue: null });
    expect([...server.docs.keys()]).toEqual(["learnv-language-tests-v1"]);
    expect(phone.meta.get().lastSyncAt).not.toBeNull();

    phone.meta.set((current) => ({ ...current, includeDrafts: true }));
    await phone.sync();
    expect(server.docs.has("learnv-written-simulator-v1")).toBe(true);
  });

  it("brings a second device up to date and tells its stores", async () => {
    const server = new FakeServer();
    const phone = device(server);
    phone.storage.setItem("learnv-review-v1", '{"version":1,"cards":{},"mistakes":[],"days":{"2026-11-14":4},"introduced":{}}');
    await phone.sync();
    const laptop = device(server);
    const report = await laptop.sync();
    expect(report.pulled).toBe(1);
    expect(laptop.storage.getItem("learnv-review-v1")).toBe(phone.storage.getItem("learnv-review-v1"));
    expect(laptop.announced).toEqual(["learnv-review-v1"]);
    expect(await laptop.sync()).toEqual({ pulled: 0, pushed: 0, merged: 0, issue: null });
  });

  it("merges an entry both devices changed and both converge", async () => {
    const server = new FakeServer();
    const phone = device(server);
    phone.storage.setItem("learnv-learning-journey-v1", journey(2, ["2026-11-10"]));
    await phone.sync();
    const laptop = device(server);
    await laptop.sync();

    phone.storage.setItem("learnv-learning-journey-v1", journey(3, ["2026-11-10", "2026-11-11"]));
    laptop.storage.setItem("learnv-learning-journey-v1", journey(5, ["2026-11-10", "2026-11-12"]));
    await phone.sync();
    const report = await laptop.sync();
    expect(report.merged).toBe(1);
    await phone.sync();

    for (const side of [phone, laptop]) {
      const merged = side.storage.json("learnv-learning-journey-v1");
      expect(merged.sessionCount).toBe(6);
      expect([...merged.activeDates].sort()).toEqual(["2026-11-10", "2026-11-11", "2026-11-12"]);
    }
  });

  it("first sign-in on a device with its own progress keeps both", async () => {
    const server = new FakeServer();
    const phone = device(server);
    phone.storage.setItem("learnv-progress-v1", '{"completedDocuments":["passport"]}');
    await phone.sync();
    const laptop = device(server);
    laptop.storage.setItem("learnv-progress-v1", '{"completedDocuments":["essay"]}');
    await laptop.sync();
    expect(laptop.storage.json("learnv-progress-v1").completedDocuments).toEqual(["essay", "passport"]);
    await phone.sync();
    expect(phone.storage.json("learnv-progress-v1").completedDocuments).toEqual(["essay", "passport"]);
  });

  it("propagates deletions", async () => {
    const server = new FakeServer();
    const phone = device(server);
    phone.storage.setItem("learnv-placement-v1", "{}");
    await phone.sync();
    const laptop = device(server);
    await laptop.sync();
    phone.storage.removeItem("learnv-placement-v1");
    await phone.sync();
    expect(server.docs.get("learnv-placement-v1")?.value).toBeNull();
    await laptop.sync();
    expect(laptop.storage.getItem("learnv-placement-v1")).toBeNull();
  });

  it("merges again when another device writes between reading and uploading", async () => {
    const server = new FakeServer();
    const phone = device(server);
    phone.storage.setItem("learnv-progress-v1", '{"completedDocuments":["a"]}');
    await phone.sync();
    phone.storage.setItem("learnv-progress-v1", '{"completedDocuments":["a","b"]}');
    server.beforePush = () => server.write("learnv-progress-v1", '{"completedDocuments":["a","c"]}');
    const report = await phone.sync();
    expect(report.issue).toBeNull();
    expect(JSON.parse(server.docs.get("learnv-progress-v1")!.value!).completedDocuments).toEqual(["a", "b", "c"]);
    expect(phone.storage.json("learnv-progress-v1").completedDocuments).toEqual(["a", "b", "c"]);
  });

  it("signs the device out when the session ended, and keeps local data", async () => {
    const server = new FakeServer();
    const phone = device(server);
    phone.storage.setItem("learnv-review-v1", "{}");
    const report = await phone.sync({ signedOut: true });
    expect(report.issue).toBe("signed-out");
    expect(phone.meta.get().account).toBeNull();
    expect(phone.storage.getItem("learnv-review-v1")).toBe("{}");
  });

  it("reports offline without losing what is pending", async () => {
    const server = new FakeServer();
    const phone = device(server);
    phone.storage.setItem("learnv-review-v1", "{}");
    expect((await phone.sync({ offline: true })).issue).toBe("offline");
    expect(phone.meta.get().lastSyncAt).toBeNull();
    expect((await phone.sync()).pushed).toBe(1);
  });
});
