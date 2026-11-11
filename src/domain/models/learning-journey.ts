export type LearningLanguage = "en" | "ko" | "general";
export type LearningSkill = "reading" | "grammar" | "vocabulary" | "writing" | "listening" | "pronunciation" | "application" | "documents" | "interview";
export type InterviewLearningFocus = "direct" | "evidence" | "connection" | "reflection";
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
  attemptCount?: number;
  interviewFocus?: InterviewLearningFocus;
};

export type SkillTrace = {
  attempts: number;
  completions: number;
  bestScore: number | null;
  lastScore: number | null;
  lastActivityAt: string;
};

export type LearningJourneyState = {
  version: 1 | 2;
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
    version: 2,
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

const LANGUAGES = new Set<LearningLanguage>(["en", "ko", "general"]);
const SKILLS = new Set<LearningSkill>(["reading", "grammar", "vocabulary", "writing", "listening", "pronunciation", "application", "documents", "interview"]);
const KINDS = new Set<LearningEventKind>(["route", "session", "practice", "resource", "task", "document"]);
const FOCUSES = new Set<InterviewLearningFocus>(["direct", "evidence", "connection", "reflection"]);
const RECENT_LIMIT = 60;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validIso(value: unknown): value is string {
  return typeof value === "string" && value.length <= 40 && Number.isFinite(Date.parse(value));
}

function finiteNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function countMap(value: unknown) {
  const result: Record<string, number> = Object.create(null);
  if (!isRecord(value)) return {};
  for (const [key, count] of Object.entries(value)) {
    if (key.length <= 200 && typeof count === "number" && Number.isFinite(count) && count >= 0) result[key] = count;
  }
  return { ...result };
}

/** Returns a structurally valid event, or null if it cannot be trusted. */
export function normalizeLearningEvent(value: unknown): LearningEvent | null {
  if (!isRecord(value) || !KINDS.has(value.kind as LearningEventKind)) return null;
  const event: LearningEvent = { kind: value.kind as LearningEventKind };
  if (validIso(value.occurredAt)) event.occurredAt = value.occurredAt;
  if (typeof value.route === "string" && value.route.length <= 200) event.route = value.route;
  if (typeof value.itemId === "string" && value.itemId.length <= 200) event.itemId = value.itemId;
  if (LANGUAGES.has(value.language as LearningLanguage)) event.language = value.language as LearningLanguage;
  if (SKILLS.has(value.skill as LearningSkill)) event.skill = value.skill as LearningSkill;
  if (typeof value.score === "number" && Number.isFinite(value.score)) event.score = Math.min(100, Math.max(0, value.score));
  if (typeof value.passed === "boolean") event.passed = value.passed;
  if (typeof value.activeSeconds === "number" && Number.isFinite(value.activeSeconds)) event.activeSeconds = Math.max(0, value.activeSeconds);
  if (typeof value.attemptCount === "number" && Number.isFinite(value.attemptCount)) event.attemptCount = Math.max(0, Math.round(value.attemptCount));
  if (FOCUSES.has(value.interviewFocus as InterviewLearningFocus)) event.interviewFocus = value.interviewFocus as InterviewLearningFocus;
  return event;
}

function normalizeSkillStats(value: unknown): LearningJourneyState["skillStats"] {
  const stats: LearningJourneyState["skillStats"] = {};
  if (!isRecord(value)) return stats;
  for (const [skill, trace] of Object.entries(value)) {
    if (!SKILLS.has(skill as LearningSkill) || !isRecord(trace)) continue;
    const score = (input: unknown) => typeof input === "number" && Number.isFinite(input) ? Math.min(100, Math.max(0, input)) : null;
    stats[skill as LearningSkill] = {
      attempts: finiteNumber(trace.attempts),
      completions: finiteNumber(trace.completions),
      bestScore: score(trace.bestScore),
      lastScore: score(trace.lastScore),
      lastActivityAt: validIso(trace.lastActivityAt) ? trace.lastActivityAt : new Date(0).toISOString(),
    };
  }
  return stats;
}

/**
 * Rebuilds a journey from untrusted storage. Every field is checked so a corrupted or
 * hand-edited value can never crash the shell; unknown data is dropped, not guessed.
 */
export function normalizeLearningJourney(value: unknown, now = new Date()): LearningJourneyState {
  const fallback = createLearningJourney(now);
  if (!isRecord(value)) return fallback;
  const activeDates = Array.isArray(value.activeDates)
    ? [...new Set(value.activeDates.filter((day): day is string => typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day)))]
    : [];
  const recentActivities = Array.isArray(value.recentActivities)
    ? value.recentActivities
      .map(normalizeLearningEvent)
      .filter((event): event is LearningEvent => event !== null && event.kind !== "route" && event.kind !== "session")
      .slice(0, RECENT_LIMIT)
    : [];
  const streak = calculateStreak(activeDates, now);
  return {
    version: value.version === 2 ? 2 : 1,
    firstSeenAt: validIso(value.firstSeenAt) ? value.firstSeenAt : fallback.firstSeenAt,
    lastSeenAt: validIso(value.lastSeenAt) ? value.lastSeenAt : fallback.lastSeenAt,
    activeDates,
    currentStreak: streak.current,
    longestStreak: Math.max(finiteNumber(value.longestStreak), streak.longest),
    sessionCount: finiteNumber(value.sessionCount),
    totalActiveSeconds: finiteNumber(value.totalActiveSeconds),
    routeVisits: countMap(value.routeVisits),
    resourceOpens: countMap(value.resourceOpens),
    skillStats: normalizeSkillStats(value.skillStats),
    recentActivities,
  };
}

/** Newest first, so adaptive models that read `recentActivities[0..n]` see the latest evidence. */
export function sortRecentActivities(state: LearningJourneyState): LearningJourneyState {
  const time = (event: LearningEvent) => Date.parse(event.occurredAt ?? "") || 0;
  return { ...state, recentActivities: [...state.recentActivities].sort((a, b) => time(b) - time(a)).slice(0, RECENT_LIMIT) };
}

/** A completion (task, document, finished resource) only counts once per item and local day. */
function isRepeatedCompletion(state: LearningJourneyState, event: LearningEvent, occurredAt: string) {
  const isCompletion = event.kind === "task" || event.kind === "document" || (event.kind === "resource" && event.passed === true);
  if (!isCompletion || !event.itemId) return false;
  const day = localDateKey(occurredAt);
  return state.recentActivities.some((previous) =>
    previous.kind === event.kind
    && previous.itemId === event.itemId
    && previous.passed === event.passed
    && previous.occurredAt !== undefined
    && localDateKey(previous.occurredAt) === day);
}

export function recordLearningEvent(state: LearningJourneyState, event: LearningEvent): LearningJourneyState {
  const occurredAt = event.occurredAt ?? new Date().toISOString();
  if (isRepeatedCompletion(state, event, occurredAt)) return state;
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
        attempts: (previous?.attempts ?? 0) + (event.kind === "practice" ? Math.max(1, event.attemptCount ?? 1) : 0),
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
    // Route and session heartbeats are aggregated above; keeping them out of the window
    // stops them from evicting the practice evidence that analysis and adaptation rely on.
    recentActivities: event.kind === "route" || event.kind === "session"
      ? state.recentActivities
      : [normalized, ...state.recentActivities].slice(0, RECENT_LIMIT),
  };
}

export function getLearningRecommendation(state: LearningJourneyState): LearningRecommendation {
  const skills = state.skillStats;
  if (state.recentActivities.length === 0) return { id: "begin", route: "/study" };
  const scored = (["reading", "grammar", "vocabulary", "writing", "listening", "pronunciation"] as const)
    .map((skill) => ({ skill, score: skills[skill]?.lastScore, attempts: skills[skill]?.attempts ?? 0 }))
    .filter((item) => item.attempts > 0 && item.score !== null && item.score !== undefined)
    .sort((a, b) => (a.score ?? 100) - (b.score ?? 100));
  if (scored[0] && (scored[0].score ?? 100) < 75) {
    const lastForSkill = state.recentActivities.find((activity) => activity.skill === scored[0].skill);
    return { id: lastForSkill?.language === "ko" ? "korean" : "english", route: lastForSkill?.language === "ko" ? "/tests/ko" : "/tests/en" };
  }
  // Visits, session timers and self-marked tasks are not a language diagnostic.
  if (scored.length === 0 && !skills.application?.completions && !skills.interview?.completions) {
    return { id: "begin", route: "/study" };
  }
  if (!skills.application?.completions) return { id: "application", route: "/study/written-simulator" };
  if (!skills.interview?.completions) return { id: "interview", route: "/study/interviews" };
  if (!skills.documents?.completions) return { id: "documents", route: "/checklist" };
  const last = state.recentActivities[0];
  return { id: "continue", route: last?.language === "ko" ? "/study/korean" : last?.language === "en" ? "/study/english" : "/study" };
}
