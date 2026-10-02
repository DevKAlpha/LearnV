import { lazy } from "react";
import { Navigate, Route, Routes, type Location } from "react-router-dom";
import type { useGksProgress } from "@/application/controllers/useGksProgress";
import type { LearningJourneyController } from "@/application/controllers/useLearningJourney";
import { loadWithAssetRecovery } from "@/app/routing/asset-recovery";
import { isQaLearningRoute } from "@/application/qa/qa-learning-scope";
import { HomePage } from "@/features/home/presentation/HomePage";

const recoverable = <T,>(loader: () => Promise<T>) => () => loadWithAssetRecovery(loader);
const loadStudyPage = recoverable(() => import("@/features/study/presentation/pages/StudyPage").then((module) => ({ default: module.StudyPage })));
const loadLanguageStudyPage = recoverable(() => import("@/features/study/presentation/pages/LanguageStudyPage").then((module) => ({ default: module.LanguageStudyPage })));
const loadInterviewPrepPage = recoverable(() => import("@/features/study/presentation/pages/InterviewPrepPage").then((module) => ({ default: module.InterviewPrepPage })));
const loadWrittenSimulatorPage = recoverable(() => import("@/features/study/presentation/pages/WrittenSimulatorPage").then((module) => ({ default: module.WrittenSimulatorPage })));
const loadTestPathPage = recoverable(() => import("@/features/study/presentation/pages/TestPathPage").then((module) => ({ default: module.TestPathPage })));
const loadTestSessionPage = recoverable(() => import("@/features/study/presentation/pages/TestSessionPage").then((module) => ({ default: module.TestSessionPage })));

const StudyPage = lazy(loadStudyPage);
const LanguageStudyPage = lazy(loadLanguageStudyPage);
const InterviewPrepPage = lazy(loadInterviewPrepPage);
const WrittenSimulatorPage = lazy(loadWrittenSimulatorPage);
const TestPathPage = lazy(loadTestPathPage);
const TestSessionPage = lazy(loadTestSessionPage);

export function preloadAppRoute(pathname: string) {
  if (pathname === "/" || !isQaLearningRoute(pathname)) return;
  if (pathname === "/study") return void loadStudyPage();
  if (/^\/study\/(english|korean)$/.test(pathname)) return void loadLanguageStudyPage();
  if (pathname === "/study/interviews") return void loadInterviewPrepPage();
  if (pathname === "/study/written-simulator") return void loadWrittenSimulatorPage();
  if (/^\/tests\/(en|ko)$/.test(pathname)) return void loadTestPathPage();
  if (/^\/tests\/(en|ko)\/.+/.test(pathname)) return void loadTestSessionPage();
}

type Progress = ReturnType<typeof useGksProgress>;

type AppRoutesProps = {
  location: Location;
  progress: Progress;
  learning: LearningJourneyController;
};

export function AppRoutes({ location, progress, learning }: AppRoutesProps) {
  return (
    <Routes location={location}>
      <Route path="/" element={<HomePage {...progress} learning={learning} />} />
      <Route path="/study" element={<StudyPage learning={learning} />} />
      <Route path="/study/english" element={<LanguageStudyPage language="en" />} />
      <Route path="/study/korean" element={<LanguageStudyPage language="ko" />} />
      <Route path="/study/interviews" element={<InterviewPrepPage learning={learning} />} />
      <Route path="/study/written-simulator" element={<WrittenSimulatorPage />} />
      <Route path="/tests/:language" element={<TestPathPage />} />
      <Route path="/tests/:language/:stageId" element={<TestSessionPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
