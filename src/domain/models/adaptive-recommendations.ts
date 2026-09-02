import type { LocalizedText } from "./i18n";
import type { LearningAnalysis, LearningMastery } from "./learning-analysis";
import type { LearningJourneyState, LearningLanguage, LearningSkill } from "./learning-journey";

export type RecommendationMode = "adaptive" | LearningLanguage;
export type RecommendationFormat = "series" | "music" | "document" | "course" | "practice";

export type AdaptiveLearningResource = {
  id: string;
  languages: LearningLanguage[];
  skills: LearningSkill[];
  mastery: LearningMastery[];
  format: RecommendationFormat;
  title: LocalizedText;
  description: LocalizedText;
  activity: LocalizedText;
  organization: string;
  url: string;
  estimatedMinutes: number;
  verifiedAt: string;
};

export type RecommendationPlan = {
  items: AdaptiveLearningResource[];
  personalized: boolean;
  focus: LearningAnalysis["priority"];
};

type RecommendationInput = {
  resources: AdaptiveLearningResource[];
  analysis: LearningAnalysis;
  journey: Pick<LearningJourneyState, "resourceOpens">;
  mode?: RecommendationMode;
  rotation?: number;
  limit?: number;
};

function scoreResource(
  resource: AdaptiveLearningResource,
  analysis: LearningAnalysis,
  mode: RecommendationMode,
  opened: number,
) {
  const focus = analysis.priority;
  let score = 0;

  if (mode !== "adaptive") score += resource.languages.includes(mode) ? 80 : -200;
  if (mode === "adaptive" && focus) {
    if (resource.languages.includes(focus.language)) score += 46;
    if (resource.skills.includes(focus.skill)) score += 44;
    if (resource.mastery.includes(focus.mastery)) score += 12;
    if (focus.trend === "declining") score += resource.skills.includes(focus.skill) ? 8 : 0;
  }

  if (mode === "adaptive" && !focus) {
    if (resource.mastery.includes("starting")) score += 20;
    if (resource.languages.includes("en") || resource.languages.includes("ko")) score += 8;
  }

  score -= Math.min(24, opened * 6);
  return score;
}

function rotate<T>(items: T[], amount: number) {
  if (!items.length) return items;
  const offset = ((amount % items.length) + items.length) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

export function buildRecommendationPlan({
  resources,
  analysis,
  journey,
  mode = "adaptive",
  rotation = 0,
  limit = 3,
}: RecommendationInput): RecommendationPlan {
  const eligible = mode === "adaptive"
    ? resources
    : resources.filter((resource) => resource.languages.includes(mode));
  const ranked = eligible
    .map((resource) => ({
      resource,
      score: scoreResource(resource, analysis, mode, journey.resourceOpens[resource.id] ?? 0),
    }))
    .sort((first, second) => second.score - first.score || first.resource.id.localeCompare(second.resource.id));

  const rotated = rotate(ranked, rotation);
  const selected: AdaptiveLearningResource[] = [];
  const formats = new Set<RecommendationFormat>();
  const relevanceFloor = (ranked[0]?.score ?? 0) - 24;

  for (const item of rotated) {
    if (selected.length >= limit) break;
    if (item.score >= relevanceFloor && !formats.has(item.resource.format)) {
      selected.push(item.resource);
      formats.add(item.resource.format);
    }
  }
  for (const item of rotated) {
    if (selected.length >= limit) break;
    if (!selected.some((resource) => resource.id === item.resource.id)) selected.push(item.resource);
  }

  return {
    items: selected,
    personalized: mode === "adaptive" && analysis.totalAttempts > 0 && Boolean(analysis.priority),
    focus: mode === "adaptive" ? analysis.priority : null,
  };
}
