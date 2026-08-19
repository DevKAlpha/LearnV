export type TestLanguage = "en" | "ko";

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
  icon: string;
  title: string;
  description: string;
  focus: string;
  estimatedMinutes: number;
  passScore: number;
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
  estimate: string;
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
  if (stageIndex === 0) return true;
  return Boolean(progress[stages[stageIndex - 1].id]?.passed);
}

export function estimateLevel(language: TestLanguage, score: number): string {
  if (language === "en") {
    if (score < 50) return "B1 bridge";
    if (score < 70) return "B2 developing";
    if (score < 90) return "B2 strong";
    return "C1 readiness";
  }

  if (score < 50) return "TOPIK II foundation";
  if (score < 70) return "3급 준비 단계";
  if (score < 90) return "4급 준비 단계";
  return "5급 준비 단계";
}

export function gradeAttempt(
  language: TestLanguage,
  stage: TestStage,
  questions: TestQuestion[],
  answers: Record<string, number>,
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
    passed: score >= stage.passScore,
    estimate: estimateLevel(language, score),
    questions: results,
  };
}
