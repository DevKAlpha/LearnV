// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGksProgress } from "./useGksProgress";
import { useLearningJourney } from "./useLearningJourney";
import { useWrittenSimulator } from "./useWrittenSimulator";
import { trackLearning } from "./learningJourneyEvents";
import { dailyTasks } from "@/infrastructure/data/gks-2026";

const JOURNEY_KEY = "learnv-learning-journey-v1";
const PROGRESS_KEY = "learnv-progress-v1";
const SIMULATOR_KEY = "learnv-written-simulator-v1";

beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());

describe("useGksProgress", () => {
  it("starts an empty plan on a new local day without losing documents", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 10, 9, 0));
    const firstTask = dailyTasks[0]!.id;
    const { result, rerender } = renderHook(() => useGksProgress());
    act(() => result.current.toggleTask(firstTask));
    act(() => result.current.toggleDocument("application"));
    expect(result.current.progress.completedTasks).toEqual([firstTask]);

    vi.setSystemTime(new Date(2026, 10, 11, 8, 0));
    act(() => { document.dispatchEvent(new Event("visibilitychange")); });
    rerender();
    expect(result.current.progress.completedTasks).toEqual([]);
    expect(result.current.progress.completedDocuments).toEqual(["application"]);
  });

  it("follows changes made in another tab", () => {
    const { result } = renderHook(() => useGksProgress());
    const value = JSON.stringify({ taskDate: null, completedTasks: [], completedDocuments: ["transcript"] });
    act(() => {
      localStorage.setItem(PROGRESS_KEY, value);
      window.dispatchEvent(new StorageEvent("storage", { key: PROGRESS_KEY, newValue: value }));
    });
    expect(result.current.progress.completedDocuments).toEqual(["transcript"]);
  });
});

describe("useLearningJourney", () => {
  it("survives corrupted storage and keeps working", () => {
    localStorage.setItem(JOURNEY_KEY, JSON.stringify({ version: 2, recentActivities: "broken", skillStats: [1], activeDates: 7 }));
    const { result } = renderHook(() => useLearningJourney("/"));
    expect(result.current.journey.recentActivities).toEqual([]);
    act(() => trackLearning({ kind: "practice", itemId: "en-reading-01", language: "en", skill: "reading", score: 80, passed: true }));
    expect(result.current.journey.skillStats.reading?.completions).toBe(1);
    const stored = JSON.parse(localStorage.getItem(JOURNEY_KEY) ?? "{}");
    expect(stored.recentActivities[0].itemId).toBe("en-reading-01");
  });

  it("ignores malformed learning events from the event bus", () => {
    const { result } = renderHook(() => useLearningJourney("/"));
    act(() => { window.dispatchEvent(new CustomEvent("learnv:learning-journey", { detail: null })); });
    act(() => { window.dispatchEvent(new CustomEvent("learnv:learning-journey", { detail: { kind: "nope" } })); });
    expect(result.current.journey.recentActivities).toEqual([]);
  });
});

describe("useWrittenSimulator", () => {
  it("repairs a corrupted draft instead of crashing", () => {
    localStorage.setItem(SIMULATOR_KEY, JSON.stringify({ step: "personal", personalStatement: { evil: true }, studyPlan: 12 }));
    const { result } = renderHook(() => useWrittenSimulator());
    expect(result.current.state.step).toBe("personal");
    expect(result.current.state.personalStatement).toBe("");
    expect(result.current.score.total).toBeGreaterThanOrEqual(0);
  });
});
