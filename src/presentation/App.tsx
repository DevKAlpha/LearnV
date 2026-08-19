import { Navigate, Route, Routes } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { ScrollToTop } from "./components/ScrollToTop";
import { useGksProgress } from "../application/controllers/useGksProgress";
import { ChecklistPage } from "./pages/ChecklistPage";
import { GksPage } from "./pages/GksPage";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { StudyPage } from "./pages/StudyPage";

export function App() {
  const progress = useGksProgress();

  return (
    <div className="app-shell">
      <ScrollToTop />
      <a className="skip-link" href="#main-content">Saltar al contenido</a>
      <aside className="desktop-brand" aria-label="LearnV">
        <div className="brand-mark">V</div>
        <div>
          <strong>LearnV</strong>
          <span>Tu ruta a Corea</span>
        </div>
      </aside>

      <main id="main-content" className="main-content">
        <Routes>
          <Route path="/" element={<HomePage {...progress} />} />
          <Route path="/gks" element={<GksPage />} />
          <Route path="/study" element={<StudyPage {...progress} />} />
          <Route path="/checklist" element={<ChecklistPage {...progress} />} />
          <Route path="/profile" element={<ProfilePage score={progress.score} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
}
