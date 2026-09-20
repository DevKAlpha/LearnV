export const LEARNING_DIAGNOSTIC_AREAS = [
  "study-overview",
  "english-learning",
  "korean-learning",
  "written-simulator",
  "interview-preparation",
  "interview-chatbot",
] as const;

export type LearningDiagnosticArea = typeof LEARNING_DIAGNOSTIC_AREAS[number];
export type LearningDiagnosticSeverity = "warning" | "error" | "recovery";
export type LearningDiagnosticContext = Record<string, string | number | boolean | null | undefined>;

export type LearningErrorLogEntry = {
  id: string;
  occurredAt: string;
  area: LearningDiagnosticArea;
  severity: LearningDiagnosticSeverity;
  code: string;
  message: string;
  errorName: string | null;
  route: string;
  context: Record<string, string | number | boolean | null>;
  stack: string | null;
};

export type LearningErrorLogInput = {
  area: LearningDiagnosticArea;
  severity?: LearningDiagnosticSeverity;
  code: string;
  message?: string;
  error?: unknown;
  route?: string;
  context?: LearningDiagnosticContext;
  occurredAt?: string;
};

type DiagnosticStorage = Pick<Storage, "getItem" | "setItem">;

export const LEARNING_ERROR_LOG_LIMIT = 100;
const STORAGE_PREFIX = "learnv-learning-error-log-v1";
const SENSITIVE_CONTEXT_KEY = /answer|audio|content|document|draft|password|response|text|token|transcript/i;

export function learningErrorStorageKey(area: LearningDiagnosticArea) {
  return `${STORAGE_PREFIX}:${area}`;
}

export function resolveLearningDiagnosticArea(pathname: string): LearningDiagnosticArea | null {
  if (pathname === "/study") return "study-overview";
  if (pathname === "/study/english" || pathname === "/tests/en" || pathname.startsWith("/tests/en/")) return "english-learning";
  if (pathname === "/study/korean" || pathname === "/tests/ko" || pathname.startsWith("/tests/ko/")) return "korean-learning";
  if (pathname === "/study/written-simulator") return "written-simulator";
  if (pathname === "/study/interviews") return "interview-preparation";
  return null;
}

function compact(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length <= maxLength ? normalized : `${normalized.slice(0, maxLength - 1)}…`;
}

function safeContext(context: LearningDiagnosticContext = {}) {
  return Object.fromEntries(Object.entries(context)
    .filter(([key, value]) => !SENSITIVE_CONTEXT_KEY.test(key) && value !== undefined)
    .map(([key, value]) => [key, typeof value === "string" ? compact(value, 180) : value])) as Record<string, string | number | boolean | null>;
}

function errorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name || "Error",
      message: compact(error.message || "Unknown error", 300),
      stack: error.stack ? compact(error.stack, 1_500) : null,
    };
  }
  return { name: null, message: compact(String(error ?? "Unknown error"), 300), stack: null };
}

function isLogEntry(value: unknown): value is LearningErrorLogEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<LearningErrorLogEntry>;
  return typeof entry.id === "string"
    && typeof entry.occurredAt === "string"
    && typeof entry.code === "string"
    && typeof entry.route === "string"
    && typeof entry.message === "string"
    && LEARNING_DIAGNOSTIC_AREAS.includes(entry.area as LearningDiagnosticArea);
}

function browserStorage(): DiagnosticStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readLearningErrorLog(
  area: LearningDiagnosticArea,
  storage: DiagnosticStorage | null = browserStorage(),
): LearningErrorLogEntry[] {
  if (!storage) return [];
  try {
    const parsed: unknown = JSON.parse(storage.getItem(learningErrorStorageKey(area)) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is LearningErrorLogEntry => isLogEntry(entry) && entry.area === area)
        .slice(0, LEARNING_ERROR_LOG_LIMIT)
      : [];
  } catch {
    return [];
  }
}

/** Writes a private, bounded module log. It never throws into the learning flow. */
export function recordLearningError(
  input: LearningErrorLogInput,
  storage: DiagnosticStorage | null = browserStorage(),
): LearningErrorLogEntry | null {
  if (!storage) return null;
  try {
    const occurredAt = input.occurredAt ?? new Date().toISOString();
    const details = errorDetails(input.error);
    const entry: LearningErrorLogEntry = {
      id: `${input.area}:${input.code}:${occurredAt}`,
      occurredAt,
      area: input.area,
      severity: input.severity ?? "error",
      code: compact(input.code, 80),
      message: compact(input.message || details.message, 300),
      errorName: details.name,
      route: compact(input.route ?? window.location.pathname, 180),
      context: safeContext(input.context),
      stack: details.stack,
    };
    const next = [entry, ...readLearningErrorLog(input.area, storage)].slice(0, LEARNING_ERROR_LOG_LIMIT);
    storage.setItem(learningErrorStorageKey(input.area), JSON.stringify(next));
    return entry;
  } catch {
    return null;
  }
}
