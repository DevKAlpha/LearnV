import { describe, expect, it } from "vitest";
import { actionDueDate, buildCycleTimeline, currentPhase, daysBetween, documentStartDate, nextAction, targetEntryYear } from "./gks-cycle";

describe("GKS cycle", () => {
  it("targets the next open cycle while preparing, and the applied cycle after applying", () => {
    expect(targetEntryYear("2026-09-20", "preparing")).toBe(2027);
    expect(targetEntryYear("2026-11-13", "preparing")).toBe(2028);
    expect(targetEntryYear("2027-01-05", "preparing")).toBe(2028);
    expect(targetEntryYear("2026-11-13", "applied")).toBe(2027);
    expect(targetEntryYear("2027-01-20", "applied")).toBe(2027);
  });

  it("locates the phase for each date of a cycle", () => {
    const timeline = buildCycleTimeline(2027);
    expect(currentPhase(timeline, "2026-03-01")).toBe("preparation");
    expect(currentPhase(timeline, "2026-09-05")).toBe("call");
    expect(currentPhase(timeline, "2026-10-01")).toBe("application");
    expect(currentPhase(timeline, "2026-11-13")).toBe("first-round");
    expect(currentPhase(timeline, "2026-12-15")).toBe("second-round");
    expect(currentPhase(timeline, "2027-01-15")).toBe("results");
    expect(currentPhase(timeline, "2027-02-20")).toBe("pre-departure");
    expect(currentPhase(timeline, "2027-06-01")).toBe("pre-departure");
  });

  it("marks confirmed dates as not estimated", () => {
    const timeline = buildCycleTimeline(2027, { call: { start: "2026-09-09", end: "2026-09-20" } });
    expect(timeline.find((item) => item.phase === "call")).toMatchObject({ start: "2026-09-09", estimated: false });
    expect(timeline.find((item) => item.phase === "application")?.estimated).toBe(true);
  });

  it("advises language first, then documents, then drafts as the call approaches", () => {
    expect(nextAction("preparation", 300)).toBe("language-exam");
    expect(nextAction("preparation", 120)).toBe("documents");
    expect(nextAction("preparation", 40)).toBe("drafts");
    expect(nextAction("first-round", 0)).toBe("interview");
    expect(daysBetween("2026-11-13", "2027-09-01")).toBe(292);
  });

  it("schedules documents by lead time and never in the past", () => {
    expect(documentStartDate("family", "2027-10-15", "2026-11-13")).toBe("2027-08-16");
    expect(documentStartDate("recommendation", "2027-10-15", "2026-11-13")).toBe("2027-09-03");
    expect(documentStartDate("family", "2026-12-01", "2026-11-13")).toBe("2026-11-13");
  });
});

describe("action due dates", () => {
  it("points each action at its milestone and never into the past", () => {
    const timeline = buildCycleTimeline(2028);
    expect(actionDueDate("language-exam", timeline, "2026-11-14")).toBe("2027-09-01");
    expect(actionDueDate("submit", timeline, "2026-11-14")).toBe("2027-10-15");
    expect(actionDueDate("keep-practising", timeline, "2026-11-14")).toBeNull();
    expect(actionDueDate("read-guide", timeline, "2027-09-25")).toBe("2027-09-25");
  });
});
