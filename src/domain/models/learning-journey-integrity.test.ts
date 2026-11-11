import { describe, expect, it } from "vitest";
import {
  createLearningJourney,
  normalizeLearningEvent,
  normalizeLearningJourney,
  recordLearningEvent,
  sortRecentActivities,
} from "./learning-journey";

const now = new Date("2026-11-10T10:00:00.000Z");

describe("learning journey integrity", () => {
  it("rebuilds a safe journey from corrupted storage instead of crashing", () => {
    for (const value of [null, "oops", [], { recentActivities: "x", skillStats: [], activeDates: {} }]) {
      const journey = normalizeLearningJourney(value, now);
      expect(Array.isArray(journey.recentActivities)).toBe(true);
      expect(journey.skillStats).toEqual({});
      expect(journey.activeDates).toEqual([]);
    }
  });

  it("drops malformed events and clamps scores", () => {
    const journey = normalizeLearningJourney({
      version: 2,
      recentActivities: [null, { kind: "hack" }, { kind: "practice", skill: "reading", score: 250, occurredAt: now.toISOString() }],
      skillStats: { reading: { attempts: "3" }, __proto__: { attempts: 1 } },
    }, now);
    expect(journey.recentActivities).toHaveLength(1);
    expect(journey.recentActivities[0]?.score).toBe(100);
    expect(journey.skillStats.reading?.attempts).toBe(0);
  });

  it("rejects untyped event payloads", () => {
    expect(normalizeLearningEvent(null)).toBeNull();
    expect(normalizeLearningEvent({ kind: "task", itemId: 5 })).toEqual({ kind: "task" });
  });

  it("does not inflate completions when a task is toggled repeatedly on the same day", () => {
    let journey = createLearningJourney(now);
    for (let index = 0; index < 5; index += 1) {
      journey = recordLearningEvent(journey, { kind: "task", itemId: "topik", skill: "reading", passed: true, occurredAt: now.toISOString() });
    }
    expect(journey.skillStats.reading?.completions).toBe(1);
    expect(journey.recentActivities).toHaveLength(1);
    const tomorrow = new Date(now.getTime() + 86_400_000).toISOString();
    journey = recordLearningEvent(journey, { kind: "task", itemId: "topik", skill: "reading", passed: true, occurredAt: tomorrow });
    expect(journey.skillStats.reading?.completions).toBe(2);
  });

  it("keeps session heartbeats out of the evidence window", () => {
    let journey = recordLearningEvent(createLearningJourney(now), { kind: "practice", itemId: "s1", skill: "grammar", score: 80, occurredAt: now.toISOString() });
    for (let index = 0; index < 80; index += 1) journey = recordLearningEvent(journey, { kind: "session", activeSeconds: 30 });
    expect(journey.recentActivities.map((event) => event.itemId)).toEqual(["s1"]);
    expect(journey.totalActiveSeconds).toBe(2400);
  });

  it("orders migrated activities newest first", () => {
    const journey = sortRecentActivities({
      ...createLearningJourney(now),
      recentActivities: [
        { kind: "practice", itemId: "old", occurredAt: "2026-01-01T00:00:00.000Z" },
        { kind: "practice", itemId: "new", occurredAt: "2026-10-01T00:00:00.000Z" },
      ],
    });
    expect(journey.recentActivities.map((event) => event.itemId)).toEqual(["new", "old"]);
  });
});
