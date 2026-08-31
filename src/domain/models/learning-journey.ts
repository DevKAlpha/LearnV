export type LearningLanguage = "en" | "ko" | "general";
export type LearningSkill = "reading" | "writing" | "listening" | "pronunciation" | "application" | "documents" | "interview";
export type LearningEventKind = "route" | "session" | "practice" | "resource" | "task" | "document";

export type LearningEvent = {
  kind: LearningEventKind;
  occurredAt?: string;
  route?: string;
  itemId?: string;
  language?: LearningLanguage;
  skill?: LearningSkill;
  score?: number;
  passed?: boolean;
  activeSeconds?: number;
};

export type SkillTrace = {
  attempts: number;
  completions: number;
  bestScore: number | null;
  lastScore: number | null;
  lastActivityAt: string;
};

export type LearningJourneyState = {
  version: 1;
  firstSeenAt: string;
  lastSeenAt: string;
  activeDates: string[];
  currentStreak: number;
  longestStreak: number;
  sessionCount: number;
  totalActiveSeconds: number;
  routeVisits: Record<string, number>;
  resourceOpens: Record<string, number>;
  skillStats: Partial<Record<LearningSkill, SkillTrace>>;
  recentActivities: LearningEvent[];
};

export type LearningRecommendation = {
  id: "begin" | "english" | "korean" | "application" | "documents" | "interview" | "continue";
  route: string;
};

const DAY_MS = 86_400_000;
const MEANINGFUL_EVENTS = new Set<LearningEventKind>(["practice", "resource", "task", "document"]);

export function localDateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayNumber(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
}

export function calculateStreak(activeDates: string[], today = new Date()) {
  const days = [...new Set(activeDates)].sort((a, b) => dayNumber(b) - dayNumber(a));
  if (days.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let run = 1;
  for (let index = 1; index < days.length; index += 1) {
    if (dayNumber(days[index - 1]) - dayNumber(days[index]) === 1) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
  }

  const gap = dayNumber(localDateKey(today)) - dayNumber(days[0]);
  if (gap > 1) return { current: 0, longest };
  let current = 1;
  for (let index = 1; index < days.length; index += 1) {
    if (dayNumber(days[index - 1]) - dayNumber(days[index]) !== 1) break;
    current += 1;
  }
  return { current, longest };
}

export function createLearningJourney(now = new Date()): LearningJourneyState {
  const timestamp = now.toISOString();
  return {
    version: 1,
    firstSeenAt: timestamp,
    lastSeenAt: timestamp,
    activeDates: [],
    currentStreak: 0,
    longestStreak: 0,
    sessionCount: 0,
    totalActiveSeconds: 0,
    routeVisits: {},
    resourceOpens: {},
    skillStats: {},
    recentActivities: [],
  };
}

export function recordLearningEvent(state: LearningJourneyState, event: LearningEvent): LearningJourneyState {
  const occurredAt = event.occurredAt ?? new Date().toISOString();
  const normalized = { ...event, occurredAt };
  const activeDates = MEANINGFUL_EVENTS.has(event.kind)
    ? [...new Set([...state.activeDates, localDateKey(occurredAt)])]
    : state.activeDates;
  const streak = calculateStreak(activeDates, new Date(occurredAt));
  const routeVisits = event.kind === "route" && event.route
    ? { ...state.routeVisits, [event.route]: (state.routeVisits[event.route] ?? 0) + 1 }
    : state.routeVisits;
  const resourceOpens = event.kind === "resource" && event.itemId
    ? { ...state.resourceOpens, [event.itemId]: (state.resourceOpens[event.itemId] ?? 0) + 1 }
    : state.resourceOpens;
  let skillStats = state.skillStats;

  if (event.skill) {
    const previous = state.skillStats[event.skill];
    const hasScore = typeof event.score === "number";
    skillStats = {
      ...state.skillStats,
      [event.skill]: {
        attempts: (previous?.attempts ?? 0) + (event.kind === "practice" ? 1 : 0),
        completions: (previous?.completions ?? 0) + (event.passed || event.kind === "task" || event.kind === "document" ? 1 : 0),
        bestScore: hasScore ? Math.max(previous?.bestScore ?? 0, event.score ?? 0) : previous?.bestScore ?? null,
        lastScore: hasScore ? event.score ?? null : previous?.lastScore ?? null,
        lastActivityAt: occurredAt,
      },
    };
  }

  return {
    ...state,
    lastSeenAt: occurredAt,
    activeDates,
    currentStreak: streak.current,
    longestStreak: Math.max(state.longestStreak, streak.longest),
    sessionCount: state.sessionCount + (event.kind === "session" && !event.activeSeconds ? 1 : 0),
    totalActiveSeconds: state.totalActiveSeconds + Math.max(0, event.activeSeconds ?? 0),
    routeVisits,
    resourceOpens,
    skillStats,
    recentActivities: event.kind === "route" ? state.recentActivities : [normalized, ...state.recentActivities].slice(0, 60),
  };
}

export function getLearningRecommendation(state: LearningJourneyState): LearningRecommendation {
  const skills = state.skillStats;
  if (state.recentActivities.length === 0) return { id: "begin", route: "/study" };
  const scored = (["writing", "listening", "pronunciation"] as const)
    .map((skill) => ({ skill, score: skills[skill]?.lastScore, attempts: skills[skill]?.attempts ?? 0 }))
    .filter((item) => item.attempts > 0 && item.score !== null && item.score !== undefined)
    .sort((a, b) => (a.score ?? 100) - (b.score ?? 100));
  if (scored[0] && (scored[0].score ?? 100) < 75) {
    const lastForSkill = state.recentActivities.find((activity) => activity.skill === scored[0].skill);
    return { id: lastForSkill?.language === "ko" ? "korean" : "english", route: lastForSkill?.language === "ko" ? "/tests/ko" : "/tests/en" };
  }
  if (!skills.application?.completions) return { id: "application", route: "/study/written-simulator" };
  if (!skills.interview?.completions) return { id: "interview", route: "/study/interviews" };
  if (!skills.documents?.completions) return { id: "documents", route: "/checklist" };
  const last = state.recentActivities[0];
  return { id: "continue", route: last?.language === "ko" ? "/study/korean" : last?.language === "en" ? "/study/english" : "/study" };
}
