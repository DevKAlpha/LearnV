import { lazy } from "react";
import { Navigate, Route, Routes, type Location } from "react-router-dom";
import type { useGksProgress } from "@/application/controllers/useGksProgress";
import type { LearningJourneyController } from "@/application/controllers/useLearningJourney";
import { loadWithAssetRecovery } from "@/app/routing/asset-recovery";
import { HomePage } from "@/features/home/presentation/HomePage";
import { isLearningQa, isAppRouteAvailable } from "@/application/qa/qa-learning-scope";

const recoverable = <T,>(loader: () => Promise<T>) => {
  let pending: Promise<T> | undefined;
  const load = () => pending ??= loader().catch((error) => {
    pending = undefined;
    throw error;
  });
  return Object.assign(() => loadWithAssetRecovery(load), { preload: load });
};
const loadGksPage = recoverable(() => import("@/features/scholarship/presentation/GksPage").then((module) => ({ default: module.GksPage })));
const loadStudyPage = recoverable(() => import("@/features/study/presentation/pages/StudyPage").then((module) => ({ default: module.StudyPage })));
const loadLanguageStudyPage = recoverable(() => import("@/features/study/presentation/pages/LanguageStudyPage").then((module) => ({ default: module.LanguageStudyPage })));
const loadInterviewPrepPage = recoverable(() => import("@/features/study/presentation/pages/InterviewPrepPage").then((module) => ({ default: module.InterviewPrepPage })));
const loadWrittenSimulatorPage = recoverable(() => import("@/features/study/presentation/pages/WrittenSimulatorPage").then((module) => ({ default: module.WrittenSimulatorPage })));
const loadTestPathPage = recoverable(() => import("@/features/study/presentation/pages/TestPathPage").then((module) => ({ default: module.TestPathPage })));
const loadTestSessionPage = recoverable(() => import("@/features/study/presentation/pages/TestSessionPage").then((module) => ({ default: module.TestSessionPage })));
const loadChecklistPage = recoverable(() => import("@/features/documents/presentation/ChecklistPage").then((module) => ({ default: module.ChecklistPage })));
const loadProfilePage = recoverable(() => import("@/features/profile/presentation/ProfilePage").then((module) => ({ default: module.ProfilePage })));

const GksPage = lazy(loadGksPage);
const StudyPage = lazy(loadStudyPage);
const LanguageStudyPage = lazy(loadLanguageStudyPage);
const InterviewPrepPage = lazy(loadInterviewPrepPage);
const WrittenSimulatorPage = lazy(loadWrittenSimulatorPage);
const TestPathPage = lazy(loadTestPathPage);
const TestSessionPage = lazy(loadTestSessionPage);
const ChecklistPage = lazy(loadChecklistPage);
const ProfilePage = lazy(loadProfilePage);

export async function preloadAppRoute(pathname: string): Promise<boolean> {
  if (!isAppRouteAvailable(pathname)) return false;
  try {
    if (pathname === "/gks") await loadGksPage.preload();
    else if (pathname === "/study") await loadStudyPage.preload();
    else if (/^\/study\/(english|korean)$/.test(pathname)) await loadLanguageStudyPage.preload();
    else if (pathname === "/study/interviews") await loadInterviewPrepPage.preload();
    else if (pathname === "/study/written-simulator") await loadWrittenSimulatorPage.preload();
    else if (/^\/tests\/(en|ko)$/.test(pathname)) await loadTestPathPage.preload();
    else if (/^\/tests\/(en|ko)\/.+/.test(pathname)) await loadTestSessionPage.preload();
    else if (pathname === "/checklist") await loadChecklistPage.preload();
    else if (pathname === "/profile") await loadProfilePage.preload();
    return true;
  } catch {
    // Speculative work must never reload the page the user is currently using.
    return false;
  }
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
      {!isLearningQa && <Route path="/gks" element={<GksPage />} />}
      <Route path="/study" element={<StudyPage learning={learning} />} />
      <Route path="/study/english" element={<LanguageStudyPage language="en" />} />
      <Route path="/study/korean" element={<LanguageStudyPage language="ko" />} />
      <Route path="/study/interviews" element={<InterviewPrepPage learning={learning} />} />
      <Route path="/study/written-simulator" element={<WrittenSimulatorPage />} />
      <Route path="/tests/:language" element={<TestPathPage />} />
      <Route path="/tests/:language/:stageId" element={<TestSessionPage />} />
      {!isLearningQa && <Route path="/checklist" element={<ChecklistPage {...progress} />} />}
      {!isLearningQa && <Route path="/profile" element={<ProfilePage score={progress.score} learning={learning} />} />}
      <Route path="*" element={<Navigate to={isLearningQa ? "/study" : "/"} replace />} />
    </Routes>
  );
}
