import { lazy } from "react";
import { Navigate, Route, Routes, type Location } from "react-router-dom";
import type { useGksProgress } from "@/application/controllers/useGksProgress";

const HomePage = lazy(() => import("@/features/home/presentation/HomePage").then((module) => ({ default: module.HomePage })));
const GksPage = lazy(() => import("@/features/scholarship/presentation/GksPage").then((module) => ({ default: module.GksPage })));
const StudyPage = lazy(() => import("@/features/study/presentation/pages/StudyPage").then((module) => ({ default: module.StudyPage })));
const LanguageStudyPage = lazy(() => import("@/features/study/presentation/pages/LanguageStudyPage").then((module) => ({ default: module.LanguageStudyPage })));
const InterviewPrepPage = lazy(() => import("@/features/study/presentation/pages/InterviewPrepPage").then((module) => ({ default: module.InterviewPrepPage })));
const WrittenSimulatorPage = lazy(() => import("@/features/study/presentation/pages/WrittenSimulatorPage").then((module) => ({ default: module.WrittenSimulatorPage })));
const TestPathPage = lazy(() => import("@/features/study/presentation/pages/TestPathPage").then((module) => ({ default: module.TestPathPage })));
const TestSessionPage = lazy(() => import("@/features/study/presentation/pages/TestSessionPage").then((module) => ({ default: module.TestSessionPage })));
const ChecklistPage = lazy(() => import("@/features/documents/presentation/ChecklistPage").then((module) => ({ default: module.ChecklistPage })));
const ProfilePage = lazy(() => import("@/features/profile/presentation/ProfilePage").then((module) => ({ default: module.ProfilePage })));

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
