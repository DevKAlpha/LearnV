import { describe, expect, it } from "vitest";
import { canonicalJson, decideSync, hashText, mergeJson, mergeStoredText, type Json } from "./sync-merge";
import { createLearningJourney } from "./learning-journey";

describe("decideSync", () => {
  const base = { revision: 3, hash: "aaa" };
  it("skips untouched entries and pushes local edits", () => {
    expect(decideSync("aaa", base, { revision: 3, deleted: false })).toBe("skip");
    expect(decideSync("bbb", base, { revision: 3, deleted: false })).toBe("push");
    expect(decideSync("new", null, null)).toBe("push");
    expect(decideSync(null, null, null)).toBe("skip");
  });
  it("pulls remote edits and merges when both changed", () => {
    expect(decideSync("aaa", base, { revision: 4, deleted: false })).toBe("pull");
    expect(decideSync("aaa", base, { revision: 4, deleted: true })).toBe("pull");
    expect(decideSync("bbb", base, { revision: 4, deleted: false })).toBe("merge");
    // Second device signing in with its own data: no base yet.
    expect(decideSync("bbb", null, { revision: 2, deleted: false })).toBe("merge");
  });
  it("uploads again when the account lost an entry this device synced", () => {
    expect(decideSync("aaa", base, null)).toBe("push");
    expect(decideSync(null, base, null)).toBe("skip");
  });
});

describe("mergeJson", () => {
  it("takes the only side that changed", () => {
    expect(mergeJson({ a: 1 }, { a: 1 }, { a: 2 }, "local")).toEqual({ a: 2 });
    expect(mergeJson({ a: 1 }, { a: 3 }, { a: 1 }, "remote")).toEqual({ a: 3 });
  });

  it("merges objects key by key and keeps edits over deletions", () => {
    const base = { a: 1, b: 1, c: 1 };
    expect(mergeJson(base, { a: 2, b: 1 }, { a: 1, b: 5, c: 1, d: 1 }, "local")).toEqual({ a: 2, b: 5, d: 1 });
    expect(mergeJson({ a: 1 }, {}, { a: 9 }, "local")).toEqual({ a: 9 });
  });

  it("resolves conflicting single values with the newer copy", () => {
    expect(mergeJson({ a: 1 }, { a: 2 }, { a: 3 }, "local")).toEqual({ a: 2 });
    expect(mergeJson({ a: 1 }, { a: 2 }, { a: 3 }, "remote")).toEqual({ a: 3 });
  });

  it("treats plain lists as sets and keeps removals", () => {
    expect(mergeJson(["x", "y"], ["x", "y", "l"], ["y", "r"], "local")).toEqual(["y", "l", "r"]);
  });

  it("merges lists of items with ids item by item", () => {
    const base = [{ id: "1", t: "a" }, { id: "2", t: "b" }];
    const local = [{ id: "1", t: "A" }, { id: "2", t: "b" }, { id: "3", t: "c" }];
    const remote = [{ id: "2", t: "B" }, { id: "1", t: "a" }];
    expect(mergeJson(base, local, remote, "local")).toEqual([{ id: "1", t: "A" }, { id: "2", t: "B" }, { id: "3", t: "c" }]);
  });

  it("ignores key order when comparing", () => {
    expect(canonicalJson({ b: 1, a: [{ d: 1, c: 2 }] })).toBe(canonicalJson({ a: [{ c: 2, d: 1 }], b: 1 }));
    expect(hashText("abc")).toBe(hashText("abc"));
    expect(hashText("abc")).not.toBe(hashText("abd"));
  });
});

describe("LearnV entries", () => {
  const text = (value: unknown) => JSON.stringify(value);
  const parse = (value: string | null) => JSON.parse(value!) as Record<string, Json>;

  it("adds both devices' practice to the learning journey and recomputes the streak", () => {
    const base = { ...createLearningJourney(new Date("2026-11-10T08:00:00Z")), activeDates: ["2026-11-10"], sessionCount: 4, totalActiveSeconds: 600, routeVisits: { "/": 2 } };
    const phone = { ...base, activeDates: ["2026-11-10", "2026-11-11"], sessionCount: 5, totalActiveSeconds: 900, routeVisits: { "/": 3 } };
    const laptop = { ...base, activeDates: ["2026-11-10", "2026-11-12"], sessionCount: 6, totalActiveSeconds: 700, routeVisits: { "/": 2, "/study": 1 } };
    const merged = parse(mergeStoredText("learnv-learning-journey-v1", text(base), text(phone), text(laptop), "local"));
    expect(merged.sessionCount).toBe(7);
    expect(merged.totalActiveSeconds).toBe(1000);
    expect(merged.routeVisits).toEqual({ "/": 3, "/study": 1 });
    expect([...(merged.activeDates as string[])].sort()).toEqual(["2026-11-10", "2026-11-11", "2026-11-12"]);
    expect(merged.longestStreak).toBe(3);
  });

  it("keeps the best result and every attempt of a stage practised on two devices", () => {
    const stage = (attempts: number, best: number, last: number, passed: boolean, at: string) => ({ attempts, bestScore: best, lastScore: last, passed, lastCompletedAt: at });
    const base = { en: { "en-1": stage(1, 40, 40, false, "2026-11-01T10:00:00Z") }, ko: {} };
    const phone = { en: { "en-1": stage(2, 90, 90, true, "2026-11-02T10:00:00Z") }, ko: {} };
    const laptop = { en: { "en-1": stage(3, 60, 60, false, "2026-11-03T10:00:00Z") }, ko: {} };
    const merged = parse(mergeStoredText("learnv-language-tests-v1", text(base), text(phone), text(laptop), "remote"));
    expect(merged.en).toEqual({ "en-1": { attempts: 4, bestScore: 90, lastScore: 60, passed: true, lastCompletedAt: "2026-11-03T10:00:00Z" } });
  });

  it("keeps the most recently reviewed copy of a card whole", () => {
    const card = (stability: number, lastReview: string) => ({ id: "c1", due: "2026-11-20T00:00:00.000Z", stability, difficulty: 5, reps: 2, lapses: 0, lastReview });
    const base = { version: 1, cards: { c1: card(1, "2026-11-01T00:00:00.000Z") }, mistakes: [], days: { "2026-11-01": 3 }, introduced: {} };
    const phone = { ...base, cards: { c1: card(9, "2026-11-05T00:00:00.000Z") }, days: { "2026-11-01": 5 } };
    const laptop = { ...base, cards: { c1: card(4, "2026-11-03T00:00:00.000Z") }, days: { "2026-11-01": 4 } };
    const merged = parse(mergeStoredText("learnv-review-v1", text(base), text(phone), text(laptop), "remote"));
    expect((merged.cards as Record<string, { stability: number }>).c1!.stability).toBe(9);
    expect(merged.days).toEqual({ "2026-11-01": 6 });
  });

  it("merges board tasks by their own update time and bumps the revision", () => {
    const task = (id: string, title: string, updatedAt: number) => ({ id, title, area: "gks", status: "todo", dueDate: null, createdAt: 1, updatedAt });
    const base = { version: 1, revision: 4, tasks: [task("a", "Old", 10), task("b", "B", 10)] };
    const phone = { version: 1, revision: 5, tasks: [task("a", "Phone", 30), task("b", "B", 10)] };
    const laptop = { version: 1, revision: 6, tasks: [task("a", "Laptop", 20), task("b", "B", 10), task("c", "New", 25)] };
    const merged = parse(mergeStoredText("learnv-task-board-v1", text(base), text(phone), text(laptop), "remote"));
    expect(merged.revision).toBe(7);
    expect((merged.tasks as Array<{ id: string; title: string }>).map((item) => `${item.id}:${item.title}`)).toEqual(["a:Phone", "b:B", "c:New"]);
  });

  it("first sync of a second device keeps data from both", () => {
    expect(parse(mergeStoredText("learnv-progress-v1", null, text({ completedDocuments: ["passport"] }), text({ completedDocuments: ["essay"] }), "local")))
      .toEqual({ completedDocuments: ["passport", "essay"] });
  });

  it("falls back to the readable copy when one is corrupted", () => {
    expect(mergeStoredText("learnv-x-v1", null, "{oops", '{"a":1}', "local")).toBe('{"a":1}');
  });
});
