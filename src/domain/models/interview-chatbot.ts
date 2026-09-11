import type { Locale } from "./i18n";
import type { LearningSkill } from "./learning-journey";

export type InterviewSignal = "direct" | "evidence" | "connection" | "reflection";

export type InterviewAnswerEvaluation = {
  score: number;
  wordCount: number;
  signals: Record<InterviewSignal, boolean>;
};

const ACTION_PATTERN = /\b(logr(?:e|é|amos|aron)|organic(?:e|é|amos)|cre(?:e|é|amos)|lider(?:e|é|amos)|investigu(?:e|é|amos)|mejor(?:e|é|amos)|alcanz(?:o|ó|amos)|learned|built|led|researched|improved|achieved|measured|organized|created)\b/i;
const CONNECTION_PATTERN = /\b(gks|beca|scholarship|corea|korea|universidad|carrera|estudios?|major|degree|university|study plan)\b/i;
const REFLECTION_PATTERN = /\b(porque|por eso|aprend(?:i|í)|cambi(?:e|é|ó)|me permiti(?:o|ó)|a partir de|because|therefore|learned|changed|allowed me|as a result)\b/i;
const KOREAN_ACTION_PATTERN = /(배웠|만들|이끌|조사|개선|달성|측정|준비)/;
const KOREAN_CONNECTION_PATTERN = /(한국|전공|학업|대학|계획|장학금)/;
const KOREAN_REFLECTION_PATTERN = /(왜냐하면|그래서|배웠|변화|결과|통해)/;

function countWords(answer: string, locale: Locale) {
  const compact = answer.trim().replace(/\s+/g, " ");
  if (!compact) return 0;
  if (locale === "ko") return Math.max(compact.split(" ").length, Math.round(compact.replace(/\s/g, "").length / 3));
  return compact.split(" ").length;
}

/** A transparent structural rubric; it does not claim to understand or judge the candidate. */
export function evaluateInterviewAnswer(answer: string, locale: Locale): InterviewAnswerEvaluation {
  const normalized = answer.trim();
  const wordCount = countWords(normalized, locale);
  const signals = {
    direct: wordCount >= 12,
    evidence: /\d/.test(normalized) || ACTION_PATTERN.test(normalized) || KOREAN_ACTION_PATTERN.test(normalized),
    connection: CONNECTION_PATTERN.test(normalized) || KOREAN_CONNECTION_PATTERN.test(normalized),
    reflection: REFLECTION_PATTERN.test(normalized) || KOREAN_REFLECTION_PATTERN.test(normalized),
  };
  const score = (Object.values(signals).filter(Boolean).length * 25);
  return { score, wordCount, signals };
}

export function chooseInterviewQuestionIds(priority?: LearningSkill | null) {
  const adaptive = priority === "application" || priority === "writing"
    ? "study-plan"
    : priority === "interview" || priority === "pronunciation"
      ? "pressure"
      : priority === "grammar" || priority === "vocabulary" || priority === "listening" || priority === "reading"
        ? "academic-weakness"
        : "why-korea";

  return ["introduce-yourself", adaptive, "culture-shock", "spain-korea"];
}

export function summarizeInterviewSession(evaluations: InterviewAnswerEvaluation[]) {
  const signals: InterviewSignal[] = ["direct", "evidence", "connection", "reflection"];
  const average = evaluations.length
    ? Math.round(evaluations.reduce((total, item) => total + item.score, 0) / evaluations.length)
    : 0;
  const totals = signals.map((signal) => ({
    signal,
    total: evaluations.filter((item) => item.signals[signal]).length,
  }));
  const strongest = [...totals].sort((a, b) => b.total - a.total)[0]?.signal ?? "direct";
  const priority = [...totals].sort((a, b) => a.total - b.total)[0]?.signal ?? "evidence";
  return { average, strongest, priority, answered: evaluations.length };
}
