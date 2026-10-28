import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import type { Locale } from "@/domain/models/i18n";
import { localize } from "@/domain/models/i18n";
import { getDefinition, type TourStep } from "./section-help";
import { useI18n } from "@/application/i18n/I18nContext";
import { consumePageTourRequest, START_PAGE_TOUR_EVENT } from "@/application/controllers/pageHelpEvents";
import { findHelpTarget, isFixedHelpTarget, readPageHelpContext } from "./page-help-context";
import "@/styles/page-help.css";
export { getDefinition } from "./section-help";

type HighlightRect = { top: number; left: number; width: number; height: number };
const STORAGE_KEY = scopedStorageKey("learnv-section-tours-v1");
export function readSeenTours(): Record<string, boolean> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => value === true));
  } catch { return {}; }
}

export function SectionTour() {
  const { pathname } = useLocation();
  const { baseLocale, locale } = useI18n();
  const definition = useMemo(() => getDefinition(pathname), [pathname]);
  const [activeDefinition, setActiveDefinition] = useState(definition);
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [rect, setRect] = useState<HighlightRect | null>(null);
  const [targetReady, setTargetReady] = useState(false);
  const [tourLocale, setTourLocale] = useState<Locale>("es");
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const startedForRef = useRef<string | null>(null);
  const frozenScrollRef = useRef({ x: 0, y: 0 });
  const contentHeightRef = useRef(0);

  const startTour = useCallback((preferredLocale: Locale = baseLocale ?? locale) => {
    const currentDefinition = getDefinition(pathname, readPageHelpContext());
    const available = currentDefinition.steps.filter((item) => findHelpTarget(item.selector));
    if (available.length === 0) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    startedForRef.current = definition.key;
    setActiveDefinition(currentDefinition);
    setSteps(available);
    setStepIndex(0);
    setTargetReady(false);
    setTourLocale(preferredLocale);
    setOpen(true);
  }, [definition.key, pathname, baseLocale, locale]);

  const closeTour = useCallback(() => {
    const seen = readSeenTours();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...seen, [definition.key]: true })); } catch { /* Closing help must not depend on storage. */ }
    setOpen(false);
    setRect(null);
    setTargetReady(false);
  }, [definition.key]);

  useEffect(() => {
    setOpen(false);
    setRect(null);
    setTargetReady(false);
    const timer = window.setTimeout(() => {
      if (startedForRef.current !== definition.key && !readSeenTours()[definition.key] && !readPageHelpContext().timerRunning && !document.querySelector('.app-guide-dialog,[role="dialog"][aria-modal="true"]')) startTour();
    }, 950);
    return () => window.clearTimeout(timer);
  }, [definition.key, startTour]);

  useEffect(() => {
    const restart = () => startTour(consumePageTourRequest() ?? baseLocale ?? locale);
    window.addEventListener(START_PAGE_TOUR_EVENT, restart);
    const pending = consumePageTourRequest();
    if (pending) startTour(pending);
    return () => window.removeEventListener(START_PAGE_TOUR_EVENT, restart);
  }, [startTour]);

  useLayoutEffect(() => {
    if (!open) return;
    const appRoot = document.getElementById("root");
    const wasInert = appRoot?.hasAttribute("inert");
    const lockedScrollX = window.scrollX;
    const lockedScrollY = window.scrollY;
    frozenScrollRef.current = { x: lockedScrollX, y: lockedScrollY };
    contentHeightRef.current = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const previousHtmlStyles = {
      overflow: document.documentElement.style.overflow,
      overscrollBehavior: document.documentElement.style.overscrollBehavior,
      touchAction: document.documentElement.style.touchAction,
      height: document.documentElement.style.height,
    };
    const previousBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      right: document.body.style.right,
      left: document.body.style.left,
      width: document.body.style.width,
      height: document.body.style.height,
      overflow: document.body.style.overflow,
      overscrollBehavior: document.body.style.overscrollBehavior,
      touchAction: document.body.style.touchAction,
    };
    document.documentElement.classList.add("section-tour-lock");
    document.body.classList.add("section-tour-lock");
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.documentElement.style.touchAction = "none";
    document.documentElement.style.height = "100%";
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.right = "0";
    document.body.style.left = "0";
    document.body.style.width = "100%";
    document.body.style.height = "auto";
    document.body.style.overflow = "visible";
    document.body.style.overscrollBehavior = "none";
    document.body.style.touchAction = "none";
    appRoot?.setAttribute("inert", "");
    nextButtonRef.current?.focus();

    const blockBackgroundMovement = (event: Event) => {
      if (event.target instanceof Element && event.target.closest(".section-tour__card")) return;
      event.preventDefault();
    };
    const blockBackgroundPointer = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".section-tour__card")) return;
      event.preventDefault();
      event.stopPropagation();
    };
    const blockTouchPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") blockBackgroundMovement(event);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeTour(); return; }
      if (event.key === "Tab") {
        const controls = [...(cardRef.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled])") ?? [])];
        const first = controls[0]; const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      const activatesControl = event.key === " " && event.target instanceof HTMLElement && event.target.matches("button, a");
      const inCard = event.target instanceof Element && event.target.closest(".section-tour__card");
      if (!inCard && !activatesControl && ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) event.preventDefault();
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("wheel", blockBackgroundMovement, { capture: true, passive: false });
    document.addEventListener("touchmove", blockBackgroundMovement, { capture: true, passive: false });
    document.addEventListener("pointermove", blockTouchPointerMove, { capture: true, passive: false });
    document.addEventListener("pointerdown", blockBackgroundPointer, true);
    document.addEventListener("click", blockBackgroundPointer, true);
    document.addEventListener("dragstart", blockBackgroundMovement, true);
    document.addEventListener("gesturestart", blockBackgroundMovement, { capture: true, passive: false });
    document.addEventListener("gesturechange", blockBackgroundMovement, { capture: true, passive: false });
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("wheel", blockBackgroundMovement, true);
      document.removeEventListener("touchmove", blockBackgroundMovement, true);
      document.removeEventListener("pointermove", blockTouchPointerMove, true);
      document.removeEventListener("pointerdown", blockBackgroundPointer, true);
      document.removeEventListener("click", blockBackgroundPointer, true);
      document.removeEventListener("dragstart", blockBackgroundMovement, true);
      document.removeEventListener("gesturestart", blockBackgroundMovement, true);
      document.removeEventListener("gesturechange", blockBackgroundMovement, true);
      document.documentElement.classList.remove("section-tour-lock");
      document.body.classList.remove("section-tour-lock");
      document.documentElement.style.overflow = previousHtmlStyles.overflow;
      document.documentElement.style.overscrollBehavior = previousHtmlStyles.overscrollBehavior;
      document.documentElement.style.touchAction = previousHtmlStyles.touchAction;
      document.documentElement.style.height = previousHtmlStyles.height;
      document.body.style.position = previousBodyStyles.position;
      document.body.style.top = previousBodyStyles.top;
      document.body.style.right = previousBodyStyles.right;
      document.body.style.left = previousBodyStyles.left;
      document.body.style.width = previousBodyStyles.width;
      document.body.style.height = previousBodyStyles.height;
      document.body.style.overflow = previousBodyStyles.overflow;
      document.body.style.overscrollBehavior = previousBodyStyles.overscrollBehavior;
      document.body.style.touchAction = previousBodyStyles.touchAction;
      window.scrollTo(lockedScrollX, lockedScrollY);
      if (!wasInert) appRoot?.removeAttribute("inert");
      if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus({ preventScroll: true });
    };
  }, [open, closeTour]);

  useEffect(() => {
    if (!open) return;
    const main = document.getElementById("main-content");
    if (!main) return;
    const observer = new MutationObserver(closeTour);
    observer.observe(main, { subtree: true, attributes: true, attributeFilter: ["data-help-practice", "data-help-written", "data-help-phase"] });
    return () => observer.disconnect();
  }, [open, closeTour]);

  useLayoutEffect(() => {
    if (!open || !steps[stepIndex]) return;
    const target = findHelpTarget(steps[stepIndex].selector);
    if (!target) return;
    let cancelled = false;
    let settleTimer = 0;
    setRect(null);
    setTargetReady(false);

    const forcedElements = new Set<HTMLElement>([
      target,
      ...Array.from(target.querySelectorAll<HTMLElement>(".route-reveal-item")),
    ]);
    const revealParent = target.closest<HTMLElement>(".route-reveal-item");
    if (revealParent) forcedElements.add(revealParent);
    forcedElements.forEach((element) => {
      element.classList.add("section-tour-active-target", "is-revealed");
    });

    const nextFrame = () => new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    const positionTarget = async () => {
      const initialRect = target.getBoundingClientRect();
      const currentY = frozenScrollRef.current.y;
      const targetDocumentTop = currentY + initialRect.top;
      const anchoredToViewport = isFixedHelpTarget(target);
      const maxScroll = Math.max(0, contentHeightRef.current - window.innerHeight);
      const cardHeight = document.querySelector<HTMLElement>(".section-tour__card")?.getBoundingClientRect().height ?? 230;
      const centeredTop = (window.innerHeight - initialRect.height) / 2;
      const cardWillBeAtTop = centeredTop + initialRect.height > window.innerHeight * 0.58;
      const targetViewportTop = cardWillBeAtTop
        ? Math.max(cardHeight + 28, centeredTop)
        : Math.max(12, Math.min(centeredTop, window.innerHeight - cardHeight - initialRect.height - 28));
      const desiredY = anchoredToViewport
        ? currentY
        : Math.max(0, Math.min(maxScroll, targetDocumentTop - targetViewportTop));

      frozenScrollRef.current = { x: frozenScrollRef.current.x, y: desiredY };
      document.body.style.top = `-${desiredY}px`;

      await nextFrame();
      if (cancelled) return;

      const targetRect = target.getBoundingClientRect();
      const padding = 7;
      const top = Math.max(5, targetRect.top - padding);
      const left = Math.max(5, targetRect.left - padding);
      setRect({
        top,
        left,
        width: Math.min(window.innerWidth - left - 5, targetRect.width + padding * 2),
        height: Math.min(window.innerHeight - top - 5, targetRect.height + padding * 2),
      });
    };

    const waitForVisualTarget = async () => {
      const images = Array.from(target.querySelectorAll<HTMLImageElement>("img"));
      const imagePromises = images.map((image) => {
        if (image.complete) return image.decode?.().catch(() => undefined) ?? Promise.resolve();
        return new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        });
      });
      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      await Promise.race([
        Promise.all([fontsReady, ...imagePromises]),
        new Promise<void>((resolve) => { settleTimer = window.setTimeout(resolve, 1500); }),
      ]);
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve())));
      if (cancelled) return;
      await positionTarget();
      await nextFrame();
      if (cancelled) return;
      setTargetReady(true);
      window.requestAnimationFrame(() => nextButtonRef.current?.focus());
    };

    void waitForVisualTarget();
    const handleResize = () => { void positionTarget(); };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelled = true;
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", handleResize);
      forcedElements.forEach((element) => element.classList.remove("section-tour-active-target"));
    };
  }, [open, stepIndex, steps]);

  if (!open || !steps[stepIndex]) return null;
  const current = steps[stepIndex];
  const cardAtTop = Boolean(rect && rect.top + rect.height > window.innerHeight * 0.58);
  const labels = tourLocale === "ko"
    ? { guide: "빠른 안내", language: "설명 언어", skip: "모두 건너뛰기", previous: "이전", next: "다음", finish: "완료", preparing: "화면 준비 중" }
    : tourLocale === "en"
      ? { guide: "Quick tour", language: "Explanation language", skip: "Skip all", previous: "Previous", next: "Next", finish: "Finish", preparing: "Preparing view" }
      : { guide: "Recorrido rápido", language: "Idioma de las explicaciones", skip: "Omitir todo", previous: "Anterior", next: "Siguiente", finish: "Finalizar", preparing: "Preparando vista" };

  return createPortal(
    <div className="section-tour" role="dialog" aria-modal="true" aria-labelledby="section-tour-title">
      {rect && <div key={`${definition.key}-${stepIndex}`} className="section-tour__highlight" style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height } as CSSProperties} />}
      <section ref={cardRef} className={cardAtTop ? "section-tour__card section-tour__card--top" : "section-tour__card"} aria-busy={!targetReady}>
        <div className="section-tour__meta">
          <span>{labels.guide}</span>
          <div className="section-tour__languages" role="group" aria-label={labels.language}>
            {(["es", "en", "ko"] as const).map((language) => <button key={language} type="button" aria-pressed={tourLocale === language} aria-label={language === "es" ? "Español" : language === "en" ? "English" : "한국어"} onClick={() => setTourLocale(language)}>{language === "ko" ? "한" : language.toUpperCase()}</button>)}
          </div>
          <strong>{stepIndex + 1}/{steps.length}</strong>
        </div>
        <div className="section-tour__progress"><i style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} /></div>
        <small>{localize(activeDefinition.title, tourLocale)}</small>
        <h2 id="section-tour-title">{localize(current.title, tourLocale)}</h2>
        <p>{localize(current.text, tourLocale)}</p>
        <div className="section-tour__actions">
          <button type="button" className="section-tour__skip" onClick={closeTour}>{labels.skip}</button>
          {stepIndex > 0 && <button type="button" disabled={!targetReady} onClick={() => setStepIndex((value) => value - 1)}>← {labels.previous}</button>}
          <button ref={nextButtonRef} type="button" className="section-tour__next" disabled={!targetReady} onClick={() => {
            if (!targetReady) return;
            if (stepIndex === steps.length - 1) closeTour();
            else setStepIndex((value) => value + 1);
          }}>{targetReady ? `${stepIndex === steps.length - 1 ? labels.finish : labels.next} →` : `${labels.preparing}…`}</button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
