import { lazy, Suspense, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { ScrollToTop } from "./components/ScrollToTop";
import { useI18n } from "../application/i18n/I18nContext";
import { useGksProgress } from "../application/controllers/useGksProgress";
import { ThemeToggle } from "./components/ThemeToggle";
import { AnimatedRouteView } from "./components/AnimatedRouteView";
import { RouteLoader } from "./components/RouteLoader";
import { isImmersiveLearningRoute, resolveLearningLocale } from "../application/i18n/learning-locale";

const HomePage = lazy(() => import("./pages/HomePage").then((module) => ({ default: module.HomePage })));
const GksPage = lazy(() => import("./pages/GksPage").then((module) => ({ default: module.GksPage })));
const StudyPage = lazy(() => import("./pages/StudyPage").then((module) => ({ default: module.StudyPage })));
const LanguageStudyPage = lazy(() => import("./pages/LanguageStudyPage").then((module) => ({ default: module.LanguageStudyPage })));
const InterviewPrepPage = lazy(() => import("./pages/InterviewPrepPage").then((module) => ({ default: module.InterviewPrepPage })));
const TestPathPage = lazy(() => import("./pages/TestPathPage").then((module) => ({ default: module.TestPathPage })));
const TestSessionPage = lazy(() => import("./pages/TestSessionPage").then((module) => ({ default: module.TestSessionPage })));
const ChecklistPage = lazy(() => import("./pages/ChecklistPage").then((module) => ({ default: module.ChecklistPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((module) => ({ default: module.ProfilePage })));

export function App() {
  const progress = useGksProgress();
  const { copy, locale, setLocale } = useI18n();
  const location = useLocation();
  const learningLocale = resolveLearningLocale(location.pathname);
  const isImmersiveLearningExperience = isImmersiveLearningRoute(location.pathname);

  useEffect(() => {
    if (learningLocale && learningLocale !== locale) setLocale(learningLocale);
  }, [learningLocale, locale, setLocale]);

  return (
    <div className="app-shell">
      <ScrollToTop />
      <a className="skip-link" href="#main-content">{copy.app.skipLink}</a>
      <aside className="desktop-brand" aria-label="LearnV">
        <div className="brand-mark">V</div>
        <div>
          <strong>LearnV</strong>
          <span>{copy.app.tagline}</span>
        </div>
      </aside>

      <main id="main-content" className="main-content">
        {!isImmersiveLearningExperience ? <LanguageSwitcher /> : (
          <div className="test-theme-toolbar">
            <Link className="mobile-brand" to="/" aria-label="LearnV">
              <span className="mobile-brand__mark" aria-hidden="true">V</span>
              <strong>LearnV</strong>
            </Link>
            <ThemeToggle compact />
          </div>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <AnimatedRouteView routeKey={location.pathname} key={location.pathname}>
            <Suspense fallback={<RouteLoader label={copy.common.loading} />}>
              <Routes location={location}>
                <Route path="/" element={<HomePage {...progress} />} />
                <Route path="/gks" element={<GksPage />} />
                <Route path="/study" element={<StudyPage />} />
                <Route path="/study/english" element={<LanguageStudyPage language="en" />} />
                <Route path="/study/korean" element={<LanguageStudyPage language="ko" />} />
                <Route path="/study/interviews" element={<InterviewPrepPage />} />
                <Route path="/tests/:language" element={<TestPathPage />} />
                <Route path="/tests/:language/:stageId" element={<TestSessionPage />} />
                <Route path="/checklist" element={<ChecklistPage {...progress} />} />
                <Route path="/profile" element={<ProfilePage score={progress.score} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </AnimatedRouteView>
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}
