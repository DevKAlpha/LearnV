import type { Locale } from "@/domain/models/i18n";
import type {
  InterviewPersonalityId,
  InterviewScoreExplanation,
  InterviewStage,
} from "@/domain/models/interview-chatbot";
import { recordLearningError } from "./learning-error-log";

export const INTERVIEW_SCORE_LOG_STORAGE_KEY = "learnv-interview-score-log-v1";
export const INTERVIEW_SCORE_LOG_LIMIT = 200;

type ScoreLogStorage = Pick<Storage, "getItem" | "setItem">;

export type InterviewScoreLogEntry = {
  id: string;
  sessionId: string;
  recordedAt: string;
  questionId: string;
  questionNumber: number;
  stage: InterviewStage;
  turn: "primary" | "follow-up";
  locale: Locale;
  personalityId: InterviewPersonalityId;
  wordCount: number;
  score: number;
  explanation: InterviewScoreExplanation;
};

export type InterviewScoreLogInput = Omit<InterviewScoreLogEntry, "id" | "recordedAt"> & {
  recordedAt?: string;
};

function isScoreLogEntry(value: unknown): value is InterviewScoreLogEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<InterviewScoreLogEntry>;
  return typeof entry.id === "string"
    && typeof entry.sessionId === "string"
    && typeof entry.recordedAt === "string"
    && typeof entry.questionId === "string"
    && typeof entry.score === "number"
    && typeof entry.wordCount === "number"
    && Boolean(entry.explanation)
    && Array.isArray(entry.explanation?.criteria);
}

export function readInterviewScoreLog(storage: ScoreLogStorage = window.localStorage): InterviewScoreLogEntry[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(INTERVIEW_SCORE_LOG_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isScoreLogEntry).slice(0, INTERVIEW_SCORE_LOG_LIMIT) : [];
  } catch (error) {
    recordLearningError({
      area: "interview-chatbot",
      code: "interview-score-log-read-failed",
      error,
      route: "/interview-chatbot",
    }, storage);
    return [];
  }
}

/**
 * Stores an internal scoring trace without the candidate's answer or generated feedback.
 * Logging is best-effort and must never interrupt an interview when storage is unavailable.
 */
export function recordInterviewScoreLog(
  input: InterviewScoreLogInput,
  storage: ScoreLogStorage = window.localStorage,
): InterviewScoreLogEntry | null {
  try {
    const recordedAt = input.recordedAt ?? new Date().toISOString();
    const entry: InterviewScoreLogEntry = {
      ...input,
      recordedAt,
      id: `${input.sessionId}:${input.questionNumber}:${input.turn}:${recordedAt}`,
    };
    const entries = [entry, ...readInterviewScoreLog(storage)].slice(0, INTERVIEW_SCORE_LOG_LIMIT);
    storage.setItem(INTERVIEW_SCORE_LOG_STORAGE_KEY, JSON.stringify(entries));
    return entry;
  } catch (error) {
    recordLearningError({
      area: "interview-chatbot",
      code: "interview-score-log-write-failed",
      error,
      route: "/interview-chatbot",
    }, storage);
    return null;
  }
}
