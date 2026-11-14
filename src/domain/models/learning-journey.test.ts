import { describe, expect, it } from "vitest";
import { calculateStreak, createLearningJourney, getLearningRecommendation, recordLearningEvent } from "./learning-journey";

describe("learning journey", () => {
  it("counts consecutive meaningful learning days", () => {
    expect(calculateStreak(["2026-08-28", "2026-08-29", "2026-08-30"], new Date("2026-08-30T12:00:00"))).toEqual({ current: 3, longest: 3 });
  });

  it("keeps the current streak through the following day", () => {
    expect(calculateStreak(["2026-08-28", "2026-08-29"], new Date("2026-08-30T12:00:00"))).toEqual({ current: 2, longest: 2 });
  });

  it("the weekly shield covers one missed day per week, without adding to the streak", () => {
    const shield = { weeklyShield: true };
    // Thu 12, Fri 13 missed, Sat 14 (2026-11): one gap in the week of Mon 9.
    expect(calculateStreak(["2026-11-11", "2026-11-12", "2026-11-14"], new Date("2026-11-14T12:00:00"), shield)).toEqual({ current: 3, longest: 3, shieldUsedThisWeek: true });
    expect(calculateStreak(["2026-11-11", "2026-11-12", "2026-11-14"], new Date("2026-11-14T12:00:00"))).toEqual({ current: 1, longest: 2 });
    // A second missed day in the same week breaks it: 13 and 11 link, 9 does not.
    expect(calculateStreak(["2026-11-09", "2026-11-11", "2026-11-13"], new Date("2026-11-13T12:00:00"), shield).current).toBe(2);
    // Different weeks each get their own shield (Sun 8 is in the week of Mon 2).
    expect(calculateStreak(["2026-11-06", "2026-11-08", "2026-11-10"], new Date("2026-11-10T12:00:00"), shield)).toMatchObject({ current: 3, shieldUsedThisWeek: true });
  });

  it("the shield keeps the streak when yesterday was missed but not two days", () => {
    const shield = { weeklyShield: true };
    expect(calculateStreak(["2026-11-11", "2026-11-12"], new Date("2026-11-14T12:00:00"), shield)).toEqual({ current: 2, longest: 2, shieldUsedThisWeek: true });
    expect(calculateStreak(["2026-11-11", "2026-11-12"], new Date("2026-11-15T12:00:00"), shield).current).toBe(0);
    expect(calculateStreak(["2026-11-13"], new Date("2026-11-14T12:00:00"), shield)).toEqual({ current: 1, longest: 1, shieldUsedThisWeek: false });
  });

  it("only practice counts as a study day: ticks are recorded but keep no streak", () => {
    let state = createLearningJourney(new Date("2026-11-14T08:00:00"));
    for (const kind of ["task", "document", "resource"] as const) state = recordLearningEvent(state, { kind, itemId: kind, passed: true, occurredAt: "2026-11-14T09:00:00" });
    expect(state.activeDates).toEqual([]);
    state = recordLearningEvent(state, { kind: "practice", itemId: "review-session", skill: "vocabulary", score: 80, occurredAt: "2026-11-14T10:00:00" });
    expect(state.activeDates).toEqual(["2026-11-14"]);
    expect(state.currentStreak).toBe(1);
  });

  it("keeps active seconds per day for five weeks", () => {
    let state = createLearningJourney(new Date("2026-10-01T08:00:00"));
    state = recordLearningEvent(state, { kind: "session", activeSeconds: 120, occurredAt: "2026-10-01T09:00:00" });
    state = recordLearningEvent(state, { kind: "session", activeSeconds: 60, occurredAt: "2026-11-14T09:00:00" });
    state = recordLearningEvent(state, { kind: "session", activeSeconds: 30, occurredAt: "2026-11-14T10:00:00" });
    expect(state.dailySeconds).toEqual({ "2026-11-14": 90 });
    expect(state.totalActiveSeconds).toBe(210);
  });

  it("does not treat browsing a route as learning activity", () => {
    const state = recordLearningEvent(createLearningJourney(new Date("2026-08-30T08:00:00")), { kind: "route", route: "/study", occurredAt: "2026-08-30T09:00:00" });
    expect(state.activeDates).toEqual([]);
    expect(state.routeVisits["/study"]).toBe(1);
  });

  it("records scores without storing user answers", () => {
    const state = recordLearningEvent(createLearningJourney(), { kind: "practice", skill: "writing", language: "en", score: 64, passed: false });
    expect(state.skillStats.writing).toMatchObject({ attempts: 1, lastScore: 64, bestScore: 64 });
    expect(state.recentActivities[0]).not.toHaveProperty("answer");
  });

  it("recommends strengthening the weakest tested skill", () => {
    const state = recordLearningEvent(createLearningJourney(), { kind: "practice", skill: "listening", language: "ko", score: 55, passed: false });
    expect(getLearningRecommendation(state)).toEqual({ id: "korean", route: "/tests/ko" });
  });
  it("keeps a new user on the starter path after browsing, opening resources and active-time tracking", () => {
    let state = createLearningJourney();
    for (const event of [{ kind: "session" as const }, { kind: "session" as const, activeSeconds: 45 }, { kind: "route" as const, route: "/study" }, { kind: "resource" as const, itemId: "intro", language: "en" as const }]) {
      state = recordLearningEvent(state, event);
      expect(getLearningRecommendation(state)).toEqual({ id: "begin", route: "/study" });
    }
  });
  it("does not skip diagnostics when a task is manually marked done", () => {
    const state = recordLearningEvent(createLearningJourney(), { kind: "task", skill: "reading", language: "ko", passed: true });
    expect(getLearningRecommendation(state)).toEqual({ id: "begin", route: "/study" });
  });
  it("offers applied practice after an actual strong language result", () => {
    const state = recordLearningEvent(createLearningJourney(), { kind: "practice", skill: "reading", language: "en", score: 90, passed: true });
    expect(getLearningRecommendation(state)).toEqual({ id: "application", route: "/study/written-simulator" });
  });
});
