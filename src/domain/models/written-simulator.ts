export type WrittenLanguage = "en" | "ko";

export type WrittenSimulatorStep =
  | "intro"
  | "knowledge"
  | "personal"
  | "plan"
  | "review"
  | "result";

export type WrittenSimulatorState = {
  step: WrittenSimulatorStep;
  language: WrittenLanguage;
  answers: Record<string, number>;
  personalStatement: string;
  studyPlan: string;
  rubric: string[];
  startedAt: string | null;
  completedAt: string | null;
  attempts: number;
  lastScore: number | null;
};

export type WrittenSimulatorScore = {
  total: number;
  knowledge: number;
  writing: number;
  review: number;
};

export const WRITTEN_FOCUS_MINUTES = 45;

export const emptyWrittenSimulator: WrittenSimulatorState = {
  step: "intro",
  language: "en",
  answers: {},
  personalStatement: "",
  studyPlan: "",
  rubric: [],
  startedAt: null,
  completedAt: null,
  attempts: 0,
  lastScore: null,
};

export function getWrittenCharacterLimit(language: WrittenLanguage) {
  return language === "ko" ? 3000 : 5000;
}

export function isWrittenSimulatorStarted(state: WrittenSimulatorState) {
  return state.step !== "intro" && state.startedAt !== null;
}

export function scoreWrittenSimulator(
  state: WrittenSimulatorState,
  correctAnswers: Record<string, number>,
  rubricTotal: number,
): WrittenSimulatorScore {
  const questionIds = Object.keys(correctAnswers);
  const correct = questionIds.filter((id) => state.answers[id] === correctAnswers[id]).length;
  const knowledge = Math.round((correct / Math.max(questionIds.length, 1)) * 50);
  const personalProgress = Math.min(state.personalStatement.trim().length / 600, 1);
  const planProgress = Math.min(state.studyPlan.trim().length / 600, 1);
  const writing = Math.round((personalProgress + planProgress) * 15);
  const review = Math.round((state.rubric.length / Math.max(rubricTotal, 1)) * 20);

  return { total: knowledge + writing + review, knowledge, writing, review };
}

const WRITTEN_STEPS = new Set<WrittenSimulatorStep>(["intro", "knowledge", "personal", "plan", "review", "result"]);
const DRAFT_LIMIT = 12_000;

/** Field-by-field validation of a stored simulator state; invalid parts fall back to defaults. */
export function normalizeWrittenSimulator(value: unknown): WrittenSimulatorState {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return emptyWrittenSimulator;
  const record = value as Record<string, unknown>;
  const text = (input: unknown) => typeof input === "string" ? input.slice(0, DRAFT_LIMIT) : "";
  const iso = (input: unknown) => typeof input === "string" && Number.isFinite(Date.parse(input)) ? input : null;
  const answers: Record<string, number> = {};
  if (typeof record.answers === "object" && record.answers !== null && !Array.isArray(record.answers)) {
    for (const [id, answer] of Object.entries(record.answers as Record<string, unknown>)) {
      if (id.length <= 80 && typeof answer === "number" && Number.isInteger(answer) && answer >= 0 && answer < 10) answers[id] = answer;
    }
  }
  return {
    step: WRITTEN_STEPS.has(record.step as WrittenSimulatorStep) ? record.step as WrittenSimulatorStep : "intro",
    language: record.language === "ko" ? "ko" : "en",
    answers,
    personalStatement: text(record.personalStatement),
    studyPlan: text(record.studyPlan),
    rubric: Array.isArray(record.rubric) ? [...new Set(record.rubric.filter((id): id is string => typeof id === "string" && id.length <= 80))] : [],
    startedAt: iso(record.startedAt),
    completedAt: iso(record.completedAt),
    attempts: typeof record.attempts === "number" && Number.isInteger(record.attempts) && record.attempts >= 0 ? record.attempts : 0,
    lastScore: typeof record.lastScore === "number" && Number.isFinite(record.lastScore) ? Math.min(100, Math.max(0, record.lastScore)) : null,
  };
}
