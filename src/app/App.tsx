import { Suspense, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { useGksProgress } from "@/application/controllers/useGksProgress";
import { useI18n } from "@/application/i18n/I18nContext";
import { isImmersiveLearningRoute, resolveLearningLocale } from "@/application/i18n/learning-locale";
import { AppGuide } from "@/app/layout/AppGuide";
import { BottomNav } from "@/app/layout/BottomNav";
import { DynamicFavicon } from "@/app/layout/DynamicFavicon";
import { LanguageSwitcher } from "@/app/layout/LanguageSwitcher";
import { RouteLoader } from "@/app/routing/RouteLoader";
import { ScrollToTop } from "@/app/routing/ScrollToTop";
import { AppRoutes } from "@/app/routing/AppRoutes";
import { AnimatedRouteView } from "@/app/routing/AnimatedRouteView";
import { BrandMark } from "@/shared/ui/BrandMark";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";

export function App() {
  const progress = useGksProgress();
  const { copy, setLearningLocale } = useI18n();
  const location = useLocation();
  const learningLocale = resolveLearningLocale(location.pathname);
  const isImmersiveLearningExperience = isImmersiveLearningRoute(location.pathname);

  useEffect(() => {
    setLearningLocale(learningLocale);
    return () => setLearningLocale(null);
  }, [learningLocale, setLearningLocale]);

  return (
    <div className="app-shell">
      <ScrollToTop />
      <DynamicFavicon readiness={progress.score} />
      <a className="skip-link" href="#main-content">{copy.app.skipLink}</a>
      <aside className="desktop-brand" aria-label="LearnV">
        <div className="brand-mark"><BrandMark /></div>
        <div>
          <strong>LearnV</strong>
          <span>{copy.app.tagline}</span>
        </div>
      </aside>

      <main id="main-content" className="main-content">
        {!isImmersiveLearningExperience ? <LanguageSwitcher /> : (
          <div className="test-theme-toolbar">
            <Link className="mobile-brand" to="/" aria-label="LearnV">
              <span className="mobile-brand__mark" aria-hidden="true"><BrandMark /></span>
              <strong>LearnV</strong>
            </Link>
            <div className="test-theme-toolbar__controls"><ThemeToggle compact /><AppGuide /></div>
          </div>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <AnimatedRouteView routeKey={location.pathname} key={location.pathname}>
            <Suspense fallback={<RouteLoader label={copy.common.loading} />}>
              <AppRoutes location={location} progress={progress} />
            </Suspense>
          </AnimatedRouteView>
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}
