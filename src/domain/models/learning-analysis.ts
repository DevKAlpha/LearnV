import type {
  LearningEvent,
  LearningJourneyState,
  LearningLanguage,
  LearningSkill,
} from "./learning-journey";

export type LearningTrend = "new" | "improving" | "steady" | "declining";
export type LearningMastery = "starting" | "developing" | "solid" | "strong";
export type EvidenceLevel = "low" | "medium" | "high";

export type SkillAnalysis = {
  key: string;
  skill: LearningSkill;
  language: LearningLanguage;
  attempts: number;
  averageScore: number;
  latestScore: number;
  bestScore: number;
  passRate: number;
  delta: number;
  trend: LearningTrend;
  mastery: LearningMastery;
  route: string;
};

export type LearningAnalysis = {
  totalAttempts: number;
  averageScore: number | null;
  evaluatedAreas: number;
  trend: LearningTrend;
  delta: number;
  evidenceLevel: EvidenceLevel;
  strongest: SkillAnalysis | null;
  priority: SkillAnalysis | null;
  skills: SkillAnalysis[];
};

function roundedAverage(values: number[]) {
  return values.length ? Math.round(values.reduce((total, value) => total + value, 0) / values.length) : 0;
}

function chronological(events: LearningEvent[]) {
  return [...events].sort((first, second) =>
    new Date(first.occurredAt ?? 0).getTime() - new Date(second.occurredAt ?? 0).getTime());
}

export function calculateLearningTrend(events: LearningEvent[]) {
  const scores = chronological(events)
    .map((event) => event.score)
    .filter((score): score is number => typeof score === "number");
  if (scores.length < 2) return { trend: "new" as const, delta: 0 };

  const recent = scores.slice(-Math.min(3, Math.ceil(scores.length / 2)));
  const previous = scores.slice(Math.max(0, scores.length - recent.length * 2), scores.length - recent.length);
  const baseline = previous.length ? roundedAverage(previous) : scores[0];
  const delta = roundedAverage(recent) - baseline;
  const trend: LearningTrend = delta >= 5 ? "improving" : delta <= -5 ? "declining" : "steady";
  return { trend, delta };
}

function masteryFor(score: number): LearningMastery {
  if (score >= 85) return "strong";
  if (score >= 70) return "solid";
  if (score >= 55) return "developing";
  return "starting";
}

function routeFor(skill: LearningSkill, language: LearningLanguage) {
  if (skill === "application") return "/study/written-simulator";
  if (skill === "interview") return "/study/interviews";
  if (skill === "documents") return "/checklist";
  if (language === "en" || language === "ko") return `/tests/${language}`;
  return "/study";
}

export function analyzeLearningResults(state: LearningJourneyState): LearningAnalysis {
  const scoredEvents = state.recentActivities.filter((event) =>
    event.kind === "practice" && event.skill && typeof event.score === "number");
  const groups = new Map<string, LearningEvent[]>();

  for (const event of scoredEvents) {
    const key = `${event.language ?? "general"}:${event.skill}`;
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }

  const skills = [...groups.entries()].map(([key, events]): SkillAnalysis => {
    const ordered = chronological(events);
    const scores = ordered.map((event) => event.score as number);
    const attempts = ordered.reduce((total, event) => total + Math.max(1, event.attemptCount ?? 1), 0);
    const trend = calculateLearningTrend(ordered);
    const averageScore = roundedAverage(scores);
    const language = ordered.at(-1)?.language ?? "general";
    const skill = ordered.at(-1)?.skill as LearningSkill;
    return {
      key,
      skill,
      language,
      attempts,
      averageScore,
      latestScore: scores.at(-1) ?? 0,
      bestScore: Math.max(...scores),
      passRate: Math.round((ordered.filter((event) => event.passed).length / ordered.length) * 100),
      delta: trend.delta,
      trend: trend.trend,
      mastery: masteryFor(averageScore),
      route: routeFor(skill, language),
    };
  }).sort((first, second) => first.averageScore - second.averageScore || second.attempts - first.attempts);

  const totalAttempts = skills.reduce((total, item) => total + item.attempts, 0);
  const trendSource = [...groups.values()].sort((first, second) => second.length - first.length)[0] ?? [];
  const overallTrend = calculateLearningTrend(trendSource);
  return {
    totalAttempts,
    averageScore: scoredEvents.length ? roundedAverage(scoredEvents.map((event) => event.score as number)) : null,
    evaluatedAreas: skills.length,
    trend: overallTrend.trend,
    delta: overallTrend.delta,
    evidenceLevel: totalAttempts >= 8 ? "high" : totalAttempts >= 3 ? "medium" : "low",
    strongest: skills.length ? [...skills].sort((first, second) => second.averageScore - first.averageScore || second.attempts - first.attempts)[0] : null,
    priority: skills[0] ?? null,
    skills,
  };
}
