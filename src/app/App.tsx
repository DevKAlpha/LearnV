import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGksProgress } from "@/application/controllers/useGksProgress";
import { useI18n } from "@/application/i18n/I18nContext";
import { isImmersiveLearningRoute, resolveLearningLocale } from "@/application/i18n/learning-locale";
import { AppGuide } from "@/app/layout/AppGuide";
import { BottomNav } from "@/app/layout/BottomNav";
import { DynamicFavicon } from "@/app/layout/DynamicFavicon";
import { LanguageSwitcher } from "@/app/layout/LanguageSwitcher";
import { ScrollToTop } from "@/app/routing/ScrollToTop";
import { AppRoutes } from "@/app/routing/AppRoutes";
import { AnimatedRouteView } from "@/app/routing/AnimatedRouteView";
import { RoutePrefetcher } from "@/app/routing/RoutePrefetcher";
import { VisualReadinessGate } from "@/app/routing/VisualReadinessGate";
import { BrandMark } from "@/shared/ui/BrandMark";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";

const SectionTour = lazy(() => import("@/app/layout/SectionTour").then((module) => ({ default: module.SectionTour })));

export function App() {
  const progress = useGksProgress();
  const { copy, setLearningLocale } = useI18n();
  const location = useLocation();
  const learningLocale = resolveLearningLocale(location.pathname);
  const isImmersiveLearningExperience = isImmersiveLearningRoute(location.pathname);
  const [tourReady, setTourReady] = useState(false);
  const [visuallyReadyRoute, setVisuallyReadyRoute] = useState<string | null>(null);

  useEffect(() => {
    setLearningLocale(learningLocale);
    return () => setLearningLocale(null);
  }, [learningLocale, setLearningLocale]);

  useEffect(() => {
    const requestIdle = (window as unknown as { requestIdleCallback?: Window["requestIdleCallback"] }).requestIdleCallback;
    if (requestIdle) {
      const request = requestIdle(() => setTourReady(true), { timeout: 900 });
      return () => window.cancelIdleCallback?.(request);
    }
    const timer = setTimeout(() => setTourReady(true), 350);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app-shell">
      <ScrollToTop />
      <RoutePrefetcher />
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
        <VisualReadinessGate
          key={location.pathname}
          label={copy.common.loading}
          onReady={() => setVisuallyReadyRoute(location.pathname)}
        >
          <AnimatedRouteView routeKey={location.pathname}>
            <Suspense fallback={null}>
              <AppRoutes location={location} progress={progress} />
            </Suspense>
          </AnimatedRouteView>
        </VisualReadinessGate>
      </main>

      <BottomNav />
      {tourReady && visuallyReadyRoute === location.pathname && <Suspense fallback={null}><SectionTour /></Suspense>}
    </div>
  );
}
