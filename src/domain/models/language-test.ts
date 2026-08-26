export type TestLanguage = "en" | "ko";
export type TestSkill = "writing" | "listening" | "pronunciation";
export type ProductionMode = "speaking" | "writing" | "listening";

export type ProductionTask = {
  mode: ProductionMode;
  prompt: string;
  instructions: string;
  checklist: string[];
  minimumCharacters?: number;
  minimumWords?: number;
  maximumWords?: number;
  targetSeconds?: number;
  retakeInstruction?: string;
};

export type ListeningMedia = {
  provider: "youtube";
  videoId: string;
  title: string;
  creator: string;
  kind: "story" | "song";
  variety: string;
  sourceUrl: string;
  startSeconds?: number;
  endSeconds?: number;
  excerptMinutes?: number;
};

export type TestQuestion = {
  id: string;
  skill: string;
  prompt: string;
  passage?: string;
  audioText?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  improvement: string;
};

export type TestStage = {
  id: string;
  order: number;
  skill: TestSkill;
  icon: string;
  title: string;
  description: string;
  focus: string;
  estimatedMinutes: number;
  passScore: number;
  media?: ListeningMedia;
  productionTask: ProductionTask;
  questions: TestQuestion[];
  challengeQuestions: TestQuestion[];
};

export type TestTrack = {
  language: TestLanguage;
  label: string;
  shortLabel: string;
  target: string;
  sourceLabel: string;
  sourceUrl: string;
  stages: TestStage[];
};

export type StageProgress = {
  attempts: number;
  bestScore: number;
  lastScore: number;
  passed: boolean;
  lastCompletedAt: string;
};

export type TestProgressState = Record<TestLanguage, Record<string, StageProgress>>;

export type QuestionResult = {
  question: TestQuestion;
  selectedIndex: number | null;
  correct: boolean;
};

export type TestResult = {
  score: number;
  correctCount: number;
  passed: boolean;
  productionVerified: boolean;
  questions: QuestionResult[];
};

export const emptyTestProgress: TestProgressState = { en: {}, ko: {} };

export function getAttemptQuestions(stage: TestStage, attemptNumber: number): TestQuestion[] {
  if (attemptNumber <= 1) return stage.questions;

  const offset = (attemptNumber - 2) % stage.questions.length;
  const rotated = [...stage.questions.slice(offset), ...stage.questions.slice(0, offset)];
  return [...rotated.slice(0, 3), ...stage.challengeQuestions];
}

export function isStageUnlocked(
  stages: TestStage[],
  stageIndex: number,
  progress: Record<string, StageProgress>,
): boolean {
  const stage = stages[stageIndex];
  if (!stage) return false;
  const skillStages = stages.filter((candidate) => candidate.skill === stage.skill);
  const skillIndex = skillStages.findIndex((candidate) => candidate.id === stage.id);
  if (skillIndex <= 0) return true;
  return Boolean(progress[skillStages[skillIndex - 1].id]?.passed);
}

export function gradeAttempt(
  _language: TestLanguage,
  stage: TestStage,
  questions: TestQuestion[],
  answers: Record<string, number>,
  productionVerified = false,
): TestResult {
  const results = questions.map((question) => {
    const selectedIndex = answers[question.id] ?? null;
    return { question, selectedIndex, correct: selectedIndex === question.correctIndex };
  });
  const correctCount = results.filter((result) => result.correct).length;
  const score = Math.round((correctCount / questions.length) * 100);

  return {
    score,
    correctCount,
    passed: score >= stage.passScore && productionVerified,
    productionVerified,
    questions: results,
  };
}
