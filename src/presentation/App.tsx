import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { ScrollToTop } from "./components/ScrollToTop";
import { useI18n } from "../application/i18n/I18nContext";
import { useGksProgress } from "../application/controllers/useGksProgress";
import { ChecklistPage } from "./pages/ChecklistPage";
import { GksPage } from "./pages/GksPage";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { StudyPage } from "./pages/StudyPage";
import { TestPathPage } from "./pages/TestPathPage";
import { TestSessionPage } from "./pages/TestSessionPage";
import { ThemeToggle } from "./components/ThemeToggle";

export function App() {
  const progress = useGksProgress();
  const { copy } = useI18n();
  const location = useLocation();
  const isTestExperience = location.pathname.startsWith("/tests/");

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
        {!isTestExperience ? <LanguageSwitcher /> : (
          <div className="test-theme-toolbar"><ThemeToggle compact /></div>
        )}
        <Routes>
          <Route path="/" element={<HomePage {...progress} />} />
          <Route path="/gks" element={<GksPage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/tests/:language" element={<TestPathPage />} />
          <Route path="/tests/:language/:stageId" element={<TestSessionPage />} />
          <Route path="/checklist" element={<ChecklistPage {...progress} />} />
          <Route path="/profile" element={<ProfilePage score={progress.score} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
}
