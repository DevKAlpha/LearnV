import { z } from "zod";
import { LOCALES } from "./sync-api.ts";

/**
 * Optional AI feedback (`/api/v1/feedback`). It complements the deterministic feedback that
 * runs in the browser; it never replaces it. Only signed-in learners who gave explicit
 * consent can use it, within a daily quota. The text is sent to the AI provider to produce
 * the comment and is not stored by LearnV.
 */

/** Bump when the AI notice changes in substance: learners must accept it again. */
export const AI_CONSENT_VERSION = "2026-11";

export const WRITING_FORMATS = ["topik-51", "topik-52", "topik-53", "topik-54", "ielts-task1", "ielts-task2"] as const;
export type WritingFormat = (typeof WRITING_FORMATS)[number];

/** Same limits as the writing lab and interview notes, with room for long TOPIK 54 essays. */
export const MAX_TASK_CHARS = 4_000;
export const MAX_ANSWER_CHARS = 6_000;

/**
 * Official scoring structure per format.
 * - TOPIK II 51–52: 10 points per question, 5 per gap.
 * - TOPIK II 53: 30 points (content and task 7, organisation 7, language use 16).
 * - TOPIK II 54: 50 points (content and task 12, organisation 12, language use 26).
 * - IELTS Writing: four criteria, bands 0–9 each.
 */
export const WRITING_RUBRICS: Record<WritingFormat, readonly { id: string; max: number }[]> = {
  "topik-51": [{ id: "gap-1", max: 5 }, { id: "gap-2", max: 5 }],
  "topik-52": [{ id: "gap-1", max: 5 }, { id: "gap-2", max: 5 }],
  "topik-53": [{ id: "content", max: 7 }, { id: "organisation", max: 7 }, { id: "language", max: 16 }],
  "topik-54": [{ id: "content", max: 12 }, { id: "organisation", max: 12 }, { id: "language", max: 26 }],
  "ielts-task1": [{ id: "task-achievement", max: 9 }, { id: "coherence", max: 9 }, { id: "lexical", max: 9 }, { id: "grammar", max: 9 }],
  "ielts-task2": [{ id: "task-response", max: 9 }, { id: "coherence", max: 9 }, { id: "lexical", max: 9 }, { id: "grammar", max: 9 }],
};

/** Interview answers: four criteria, 0–4 each. */
export const INTERVIEW_RUBRIC: readonly { id: string; max: number }[] = [
  { id: "relevance", max: 4 }, { id: "evidence", max: 4 }, { id: "structure", max: 4 }, { id: "language", max: 4 },
];

const text = (max: number) => z.string().trim().min(1).max(max);

export const writingFeedbackRequestSchema = z.strictObject({
  format: z.enum(WRITING_FORMATS),
  /** The task as the learner saw it: instruction, gapped text or chart data. */
  task: text(MAX_TASK_CHARS),
  text: text(MAX_ANSWER_CHARS),
  /** Language of the comments (the learner's interface language). */
  locale: z.enum(LOCALES),
});
export type WritingFeedbackRequest = z.infer<typeof writingFeedbackRequestSchema>;

export const interviewFeedbackRequestSchema = z.strictObject({
  question: text(1_000),
  /** What the question checks, shown to the learner next to it. */
  purpose: z.string().trim().max(1_000).default(""),
  answer: text(MAX_ANSWER_CHARS),
  locale: z.enum(LOCALES),
});
export type InterviewFeedbackRequest = z.infer<typeof interviewFeedbackRequestSchema>;

export const consentRequestSchema = z.strictObject({ version: z.literal(AI_CONSENT_VERSION) });

const short = z.string().max(1_200);

export const feedbackResultSchema = z.strictObject({
  summary: short,
  criteria: z.array(z.strictObject({ id: z.string(), score: z.number().int().min(0), max: z.number().int().positive(), comment: short })).max(4),
  /** Sum of criterion scores and the maximum (TOPIK points), or the average band (IELTS, rounded to 0.5). */
  total: z.strictObject({ score: z.number().min(0), max: z.number().positive(), kind: z.enum(["points", "band"]) }),
  strengths: z.array(short).max(3),
  corrections: z.array(z.strictObject({ original: short, suggestion: short, explanation: short })).max(6),
  nextStep: short,
});
export type FeedbackResult = z.infer<typeof feedbackResultSchema>;

export const feedbackResponseSchema = z.strictObject({
  feedback: feedbackResultSchema,
  quota: z.strictObject({ used: z.number().int().min(0), limit: z.number().int().min(0) }),
});

export const feedbackStatusSchema = z.strictObject({
  /** False when the server has no AI provider configured. */
  enabled: z.boolean(),
  consent: z.strictObject({ version: z.string(), at: z.iso.datetime({ offset: true }) }).nullable(),
  /** True when the stored consent is for an older notice. */
  consentOutdated: z.boolean(),
  quota: z.strictObject({ used: z.number().int().min(0), limit: z.number().int().min(0) }),
});
export type FeedbackStatus = z.infer<typeof feedbackStatusSchema>;
