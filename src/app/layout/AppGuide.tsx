import { Component, lazy, Suspense, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "@/application/i18n/I18nContext";
import { isAppRouteAvailable } from "@/application/qa/qa-learning-scope";
import { isImmersiveLearningRoute } from "@/application/i18n/learning-locale";
import { requestPageTour } from "@/application/controllers/pageHelpEvents";
import { recordLearningError, resolveLearningDiagnosticArea } from "@/infrastructure/data/learning-error-log";

const ContextualPageHelp = lazy(() => import("./ContextualPageHelp").then((module) => ({ default: module.ContextualPageHelp })));
const labels = {
  es: { replay: "Volver a ver el recorrido de esta pantalla", overview: "Otras áreas de LearnV", loadError: "No se pudo cargar la ayuda detallada. Puedes cerrar esta ventana y seguir usando la página." },
  en: { replay: "Replay this screen tour", overview: "Other LearnV areas", loadError: "Detailed help could not load. You can close this window and keep using the page." },
  ko: { replay: "이 화면 안내 다시 보기", overview: "LearnV의 다른 영역", loadError: "상세 도움말을 불러오지 못했습니다. 창을 닫고 페이지를 계속 사용할 수 있습니다." },
};

class HelpContentBoundary extends Component<{ children: ReactNode; fallback: ReactNode; route: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) {
    recordLearningError({ area: resolveLearningDiagnosticArea(this.props.route) ?? "study-overview", route: this.props.route, code: "page-help-load-failed", error });
  }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function AppGuide() {
  const { copy, locale, baseLocale } = useI18n();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const id = useId();
  const text = labels[locale];

  useEffect(() => { setOpen(false); }, [pathname]);
  useLayoutEffect(() => {
    if (!open) return;
    const root = document.getElementById("root");
    const wasInert = root?.hasAttribute("inert");
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    root?.setAttribute("inert", "");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
      if (event.key !== "Tab") return;
      const controls = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],summary,select,input,[tabindex="0"]') ?? [])].filter((element) => element.getClientRects().length > 0);
      const first = controls[0]; const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (!wasInert) root?.removeAttribute("inert");
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
      if (triggerRef.current?.isConnected) triggerRef.current.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      <button ref={triggerRef} className="app-guide-trigger" type="button" aria-label={copy.guide.open} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
        <span aria-hidden="true">?</span>
      </button>
      {open && createPortal(
        <div className="app-guide-layer">
          <button className="app-guide-backdrop" type="button" aria-label={copy.guide.close} onClick={() => setOpen(false)} />
          <section ref={dialogRef} className="app-guide-dialog" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
            <header>
              <div>
                <span className="eyebrow">LearnV · Guide</span>
                <h2 id={`${id}-title`}>{copy.guide.title}</h2>
              </div>
              <button ref={closeRef} type="button" aria-label={copy.guide.close} onClick={() => setOpen(false)}>×</button>
            </header>
            <p className="app-guide-dialog__intro">{copy.guide.intro}</p>
            <HelpContentBoundary key={pathname} route={pathname} fallback={<p role="alert">{text.loadError}</p>}>
              <Suspense fallback={<p role="status">{copy.common.loadingContent}</p>}><ContextualPageHelp key={pathname} /></Suspense>
            </HelpContentBoundary>
            <button className="app-guide-tour-button" type="button" onClick={() => {
              setOpen(false);
              window.requestAnimationFrame(() => requestPageTour(baseLocale ?? locale));
            }}><span aria-hidden="true">✦</span>{text.replay}<i aria-hidden="true">→</i></button>
            <div className="app-guide-controls">
              <strong>{copy.guide.controlsTitle}</strong>
              <ul>{copy.guide.controls.filter((_, index) => !isImmersiveLearningRoute(pathname) || index !== 0).map((control) => <li key={control}>{control}</li>)}</ul>
            </div>
            <details className="app-guide-overview"><summary>{text.overview}</summary>
            <nav className="app-guide-sections" aria-label={text.overview}>
              {copy.guide.sections.filter((section) => isAppRouteAvailable(section.to)).map((section, index) => (
                <article key={section.to}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <div><strong>{section.title}</strong><p>{section.text}</p></div>
                  <Link to={section.to} onClick={() => setOpen(false)}>{section.action}<span aria-hidden="true">→</span></Link>
                </article>
              ))}
            </nav>
            </details>
            <p className="app-guide-local-note"><span aria-hidden="true">✓</span>{copy.guide.localNote}</p>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}
