import { lazy } from "react";
import { Navigate, Route, Routes, type Location } from "react-router-dom";
import type { useGksProgress } from "@/application/controllers/useGksProgress";
import { HomePage } from "@/features/home/presentation/HomePage";

const loadGksPage = () => import("@/features/scholarship/presentation/GksPage").then((module) => ({ default: module.GksPage }));
const loadStudyPage = () => import("@/features/study/presentation/pages/StudyPage").then((module) => ({ default: module.StudyPage }));
const loadLanguageStudyPage = () => import("@/features/study/presentation/pages/LanguageStudyPage").then((module) => ({ default: module.LanguageStudyPage }));
const loadInterviewPrepPage = () => import("@/features/study/presentation/pages/InterviewPrepPage").then((module) => ({ default: module.InterviewPrepPage }));
const loadWrittenSimulatorPage = () => import("@/features/study/presentation/pages/WrittenSimulatorPage").then((module) => ({ default: module.WrittenSimulatorPage }));
const loadTestPathPage = () => import("@/features/study/presentation/pages/TestPathPage").then((module) => ({ default: module.TestPathPage }));
const loadTestSessionPage = () => import("@/features/study/presentation/pages/TestSessionPage").then((module) => ({ default: module.TestSessionPage }));
const loadChecklistPage = () => import("@/features/documents/presentation/ChecklistPage").then((module) => ({ default: module.ChecklistPage }));
const loadProfilePage = () => import("@/features/profile/presentation/ProfilePage").then((module) => ({ default: module.ProfilePage }));

const GksPage = lazy(loadGksPage);
const StudyPage = lazy(loadStudyPage);
const LanguageStudyPage = lazy(loadLanguageStudyPage);
const InterviewPrepPage = lazy(loadInterviewPrepPage);
const WrittenSimulatorPage = lazy(loadWrittenSimulatorPage);
const TestPathPage = lazy(loadTestPathPage);
const TestSessionPage = lazy(loadTestSessionPage);
const ChecklistPage = lazy(loadChecklistPage);
const ProfilePage = lazy(loadProfilePage);

export function preloadAppRoute(pathname: string) {
  if (pathname === "/") return;
  if (pathname === "/gks") return void loadGksPage();
  if (pathname === "/study") return void loadStudyPage();
  if (/^\/study\/(english|korean)$/.test(pathname)) return void loadLanguageStudyPage();
  if (pathname === "/study/interviews") return void loadInterviewPrepPage();
  if (pathname === "/study/written-simulator") return void loadWrittenSimulatorPage();
  if (/^\/tests\/(en|ko)$/.test(pathname)) return void loadTestPathPage();
  if (/^\/tests\/(en|ko)\/.+/.test(pathname)) return void loadTestSessionPage();
  if (pathname === "/checklist") return void loadChecklistPage();
  if (pathname === "/profile") return void loadProfilePage();
}

type Progress = ReturnType<typeof useGksProgress>;

type AppRoutesProps = {
  location: Location;
  progress: Progress;
};

export function AppRoutes({ location, progress }: AppRoutesProps) {
  return (
    <Routes location={location}>
      <Route path="/" element={<HomePage {...progress} />} />
      <Route path="/gks" element={<GksPage />} />
      <Route path="/study" element={<StudyPage />} />
      <Route path="/study/english" element={<LanguageStudyPage language="en" />} />
      <Route path="/study/korean" element={<LanguageStudyPage language="ko" />} />
      <Route path="/study/interviews" element={<InterviewPrepPage />} />
      <Route path="/study/written-simulator" element={<WrittenSimulatorPage />} />
      <Route path="/tests/:language" element={<TestPathPage />} />
      <Route path="/tests/:language/:stageId" element={<TestSessionPage />} />
      <Route path="/checklist" element={<ChecklistPage {...progress} />} />
      <Route path="/profile" element={<ProfilePage score={progress.score} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
