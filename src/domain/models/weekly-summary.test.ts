import { describe, expect, it } from "vitest";
import { createLearningJourney, recordLearningEvent } from "./learning-journey";
import { weeklySummary } from "./weekly-summary";

describe("weekly summary", () => {
  it("compares the last seven days with the seven before, from evidence only", () => {
    let journey = createLearningJourney(new Date("2026-11-01T08:00:00"));
    const events = [
      { kind: "practice" as const, skill: "listening" as const, language: "ko" as const, score: 40, occurredAt: "2026-11-14T09:00:00" },
      { kind: "practice" as const, skill: "listening" as const, language: "ko" as const, score: 60, occurredAt: "2026-11-12T09:00:00" },
      { kind: "practice" as const, skill: "reading" as const, language: "en" as const, score: 90, occurredAt: "2026-11-10T09:00:00" },
      { kind: "practice" as const, skill: "reading" as const, language: "en" as const, score: 20, occurredAt: "2026-11-05T09:00:00" },
      { kind: "task" as const, itemId: "gks-documents", passed: true, occurredAt: "2026-11-13T09:00:00" },
      { kind: "session" as const, activeSeconds: 600, occurredAt: "2026-11-14T10:00:00" },
      { kind: "session" as const, activeSeconds: 300, occurredAt: "2026-11-06T10:00:00" },
    ];
    for (const event of events) journey = recordLearningEvent(journey, event);
    const summary = weeklySummary(journey, { "2026-11-14": 12, "2026-11-09": 3, "2026-11-07": 8 }, "2026-11-14");
    expect(summary).toMatchObject({ from: "2026-11-08", to: "2026-11-14", minutes: 10, practiceDays: 3, practices: 3, reviewed: 15 });
    expect(summary.previous).toEqual({ minutes: 5, practiceDays: 1, practices: 1, reviewed: 8 });
    expect(summary.weakest).toEqual({ skill: "listening", score: 50 });
  });

  it("has no weakest skill without scored practice", () => {
    expect(weeklySummary(createLearningJourney(), {}, "2026-11-14").weakest).toBeNull();
  });
});
