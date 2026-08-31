import { describe, expect, it } from "vitest";
import { calculateStreak, createLearningJourney, getLearningRecommendation, recordLearningEvent } from "./learning-journey";

describe("learning journey", () => {
  it("counts consecutive meaningful learning days", () => {
    expect(calculateStreak(["2026-08-28", "2026-08-29", "2026-08-30"], new Date("2026-08-30T12:00:00"))).toEqual({ current: 3, longest: 3 });
  });

  it("keeps the current streak through the following day", () => {
    expect(calculateStreak(["2026-08-28", "2026-08-29"], new Date("2026-08-30T12:00:00"))).toEqual({ current: 2, longest: 2 });
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
});
