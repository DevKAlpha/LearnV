import { describe, expect, it } from "vitest";
import type { LearningAnalysis } from "./learning-analysis";
import { buildRecommendationPlan, type AdaptiveLearningResource } from "./adaptive-recommendations";

const text = (value: string) => ({ es: value, en: value, ko: value });
const resources: AdaptiveLearningResource[] = [
  { id: "ko-series", languages: ["ko"], skills: ["listening"], mastery: ["starting"], format: "series", title: text("series"), description: text("series"), activity: text("series"), organization: "KSI", url: "https://example.com/1", estimatedMinutes: 15, verifiedAt: "2026-09-01" },
  { id: "ko-music", languages: ["ko"], skills: ["listening", "pronunciation"], mastery: ["starting"], format: "music", title: text("music"), description: text("music"), activity: text("music"), organization: "Artist", url: "https://example.com/2", estimatedMinutes: 10, verifiedAt: "2026-09-01" },
  { id: "ko-doc", languages: ["ko"], skills: ["writing"], mastery: ["starting"], format: "document", title: text("doc"), description: text("doc"), activity: text("doc"), organization: "TOPIK", url: "https://example.com/3", estimatedMinutes: 20, verifiedAt: "2026-09-01" },
  { id: "en-course", languages: ["en"], skills: ["writing"], mastery: ["starting"], format: "course", title: text("course"), description: text("course"), activity: text("course"), organization: "BC", url: "https://example.com/4", estimatedMinutes: 25, verifiedAt: "2026-09-01" },
  { id: "gks-doc", languages: ["general"], skills: ["documents"], mastery: ["starting"], format: "document", title: text("gks"), description: text("gks"), activity: text("gks"), organization: "NIIED", url: "https://example.com/5", estimatedMinutes: 20, verifiedAt: "2026-09-01" },
];

const emptyAnalysis: LearningAnalysis = { totalAttempts: 0, averageScore: null, evaluatedAreas: 0, trend: "new", delta: 0, evidenceLevel: "low", strongest: null, priority: null, skills: [] };
const koreanListening: LearningAnalysis = {
  ...emptyAnalysis,
  totalAttempts: 3,
  averageScore: 48,
  evaluatedAreas: 1,
  priority: { key: "ko:listening", language: "ko", skill: "listening", attempts: 3, averageScore: 48, latestScore: 42, bestScore: 55, passRate: 0, delta: -8, trend: "declining", mastery: "starting", route: "/tests/ko" },
};

describe("adaptive recommendation plan", () => {
  it("prioritizes the weakest language and skill while diversifying formats", () => {
    const plan = buildRecommendationPlan({ resources, analysis: koreanListening, journey: { resourceOpens: {} } });
    expect(plan.personalized).toBe(true);
    expect(plan.items[0].skills).toContain("listening");
    expect(new Set(plan.items.map((item) => item.format)).size).toBe(3);
  });

  it("keeps manual GKS exploration inside the selected track", () => {
    const plan = buildRecommendationPlan({ resources, analysis: koreanListening, journey: { resourceOpens: {} }, mode: "general" });
    expect(plan.items.map((item) => item.id)).toEqual(["gks-doc"]);
    expect(plan.personalized).toBe(false);
  });

  it("creates a varied starter set without assessment evidence", () => {
    const plan = buildRecommendationPlan({ resources, analysis: emptyAnalysis, journey: { resourceOpens: {} } });
    expect(plan.items).toHaveLength(3);
    expect(new Set(plan.items.map((item) => item.format)).size).toBe(3);
  });

  it("moves repeatedly opened material behind an equivalent alternative", () => {
    const plan = buildRecommendationPlan({ resources, analysis: koreanListening, journey: { resourceOpens: { "ko-series": 5 } }, limit: 1 });
    expect(plan.items[0].id).toBe("ko-music");
  });
});
