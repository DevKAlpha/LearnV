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
