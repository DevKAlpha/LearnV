import { describe, expect, it } from "vitest";
import { analyzeLearningResults, calculateLearningTrend } from "./learning-analysis";
import { createLearningJourney, recordLearningEvent, type LearningJourneyState } from "./learning-journey";

function withResults(scores: number[], language: "en" | "ko" = "en", skill: "writing" | "listening" = "writing") {
  return scores.reduce((state, score, index) => recordLearningEvent(state, {
    kind: "practice",
    language,
    skill,
    score,
    passed: score >= 70,
    occurredAt: `2026-08-${String(index + 20).padStart(2, "0")}T12:00:00.000Z`,
  }), createLearningJourney(new Date("2026-08-19T12:00:00.000Z")));
}

describe("learning result analysis", () => {
  it("keeps an empty diagnosis honest", () => {
    const analysis = analyzeLearningResults(createLearningJourney());
    expect(analysis).toMatchObject({ totalAttempts: 0, averageScore: null, strongest: null, priority: null });
  });

  it("detects a meaningful improvement", () => {
    const state = withResults([45, 52, 66, 74]);
    expect(analyzeLearningResults(state)).toMatchObject({ trend: "improving", delta: 21, averageScore: 59 });
  });

  it("detects a decline without overreacting to small changes", () => {
    expect(calculateLearningTrend(withResults([82, 80, 81]).recentActivities).trend).toBe("steady");
    expect(calculateLearningTrend(withResults([88, 82, 67]).recentActivities).trend).toBe("declining");
  });

  it("separates the same skill by learning language", () => {
    let state: LearningJourneyState = withResults([78], "en", "writing");
    state = recordLearningEvent(state, { kind: "practice", language: "ko", skill: "writing", score: 52, passed: false });
    const analysis = analyzeLearningResults(state);
    expect(analysis.skills.map((item) => item.key)).toEqual(["ko:writing", "en:writing"]);
    expect(analysis.priority?.route).toBe("/tests/ko");
  });

  it("uses migrated attempt counts as evidence", () => {
    const state = recordLearningEvent(createLearningJourney(), { kind: "practice", language: "en", skill: "listening", score: 72, passed: true, attemptCount: 4 });
    expect(analyzeLearningResults(state)).toMatchObject({ totalAttempts: 4, evidenceLevel: "medium" });
  });
});
