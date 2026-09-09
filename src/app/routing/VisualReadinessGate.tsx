import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { RouteLoader } from "@/app/routing/RouteLoader";
import {
  shouldRevalidateAfterResume,
  visualLoaderDelay,
} from "@/app/routing/resume-policy";

type VisualReadinessGateProps = PropsWithChildren<{
  label: string;
  onReady?: () => void;
}>;

type LoaderPhase = "loading" | "leaving" | "hidden";

const FONT_TIMEOUT_MS = 800;
const IMAGE_TIMEOUT_MS = 1_600;
const DOCUMENT_TIMEOUT_MS = 1_200;
const LOADER_EXIT_MS = 170;
const FRAME_FALLBACK_MS = 80;
const LAYOUT_TIMEOUT_MS = 900;
const MAX_VISUAL_WAIT_MS = 2_600;

function afterFrame() {
  return new Promise<void>((resolve) => {
    let settled = false;
    let frame = 0;
    let fallback = 0;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
      resolve();
    };
    frame = window.requestAnimationFrame(finish);
    fallback = window.setTimeout(finish, FRAME_FALLBACK_MS);
  });
}

async function afterFrames(count = 1) {
  for (let remaining = count; remaining > 0; remaining -= 1) await afterFrame();
}

function afterDelay(delay: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, delay));
}

async function withTimeout(work: Promise<unknown>, timeout: number) {
  await Promise.race([work, afterDelay(timeout)]);
}

async function waitForStableLayout(root: HTMLElement) {
  let stableFrames = 0;
  let previousSignature = "";

  for (let frame = 0; frame < 18 && stableFrames < 3; frame += 1) {
    await afterFrames();
    const signature = [
      root.childElementCount,
      root.querySelectorAll("*").length,
      root.scrollWidth,
      root.scrollHeight,
    ].join(":");

    if (signature === previousSignature) stableFrames += 1;
    else stableFrames = 0;
    previousSignature = signature;
  }
}

function isNearViewport(element: Element) {
  const rect = element.getBoundingClientRect();
  return rect.bottom >= -window.innerHeight * 0.25
    && rect.top <= window.innerHeight * 1.25
    && rect.right >= 0
    && rect.left <= window.innerWidth;
}

async function waitForImage(image: HTMLImageElement) {
  if (!image.complete) {
    await new Promise<void>((resolve) => {
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => resolve(), { once: true });
    });
  }
  if (image.complete && image.naturalWidth > 0 && image.decode) {
    await image.decode().catch(() => undefined);
  }
}

async function waitForVisualStability(root: HTMLElement) {
  const readiness: Promise<unknown>[] = [];

  if (document.readyState === "loading") {
    readiness.push(withTimeout(new Promise<void>((resolve) => {
      document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
    }), DOCUMENT_TIMEOUT_MS));
  }

  if (document.fonts?.ready) {
    readiness.push(withTimeout(document.fonts.ready, FONT_TIMEOUT_MS));
  }

  const routeImages = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
  const imagesToDecode = routeImages.filter(isNearViewport);
  if (imagesToDecode.length > 0) {
    readiness.push(withTimeout(Promise.all(imagesToDecode.map(waitForImage)), IMAGE_TIMEOUT_MS));
  }

  await Promise.all(readiness);
  await withTimeout(waitForStableLayout(root), LAYOUT_TIMEOUT_MS);
  await afterFrames();
}

function hasPendingVisualWork(root: HTMLElement) {
  if (document.readyState === "loading" || document.fonts?.status === "loading") return true;
  return Array.from(root.querySelectorAll<HTMLImageElement>("img"))
    .filter(isNearViewport)
    .some((image) => !image.complete || image.naturalWidth === 0);
}

function removeBootstrapLoader() {
  const bootstrapWindow = window as Window & {
    __learnvBootstrapLoaderTimer?: number;
    __learnvBootstrapRecoveryTimer?: number;
  };
  window.clearTimeout(bootstrapWindow.__learnvBootstrapLoaderTimer);
  window.clearTimeout(bootstrapWindow.__learnvBootstrapRecoveryTimer);
  delete bootstrapWindow.__learnvBootstrapLoaderTimer;
  delete bootstrapWindow.__learnvBootstrapRecoveryTimer;
  document.getElementById("learnv-bootstrap-loader")?.remove();
  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.has("learnv-recover")) {
    currentUrl.searchParams.delete("learnv-recover");
    window.history.replaceState(window.history.state, "", currentUrl);
  }
}

function usesMobileResumeProtection() {
  return window.matchMedia("(pointer: coarse)").matches
    || window.matchMedia("(max-width: 719px)").matches;
}

type ReadyProbeProps = PropsWithChildren<{
  onCommit: (root: HTMLElement) => void;
}>;

function ReadyProbe({ children, onCommit }: ReadyProbeProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (rootRef.current) onCommit(rootRef.current);
  }, [onCommit]);

  return <div ref={rootRef} className="visual-readiness-content">{children}</div>;
}

/** Keeps route changes and mobile app resumes covered until the visible UI is stable. */
export function VisualReadinessGate({ children, label, onReady }: VisualReadinessGateProps) {
  const [phase, setPhase] = useState<LoaderPhase>("hidden");
  const [busy, setBusy] = useState(true);
  const contentRef = useRef<HTMLElement | null>(null);
  const runRef = useRef(0);
  const exitTimerRef = useRef(0);
  const loaderDelayTimerRef = useRef(0);
  const readinessDeadlineTimerRef = useRef(0);
  const resumeTimerRef = useRef(0);
  const hiddenAtRef = useRef<number | null>(null);
  const restoredFromPageCacheRef = useRef(false);
  const loaderVisibleRef = useRef(false);
  const readyRef = useRef(false);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  const showLoadingCover = useCallback(() => {
    if (readyRef.current || loaderVisibleRef.current) return;
    loaderVisibleRef.current = true;
    document.documentElement.classList.add("app-visual-loading");
    setPhase("loading");
  }, []);

  const scheduleLoadingCover = useCallback((mobileDevice: boolean) => {
    window.clearTimeout(loaderDelayTimerRef.current);
    loaderDelayTimerRef.current = window.setTimeout(
      showLoadingCover,
      visualLoaderDelay(mobileDevice),
    );
  }, [showLoadingCover]);

  const finishReady = useCallback((run: number) => {
    if (runRef.current !== run) return;
    readyRef.current = true;
    window.clearTimeout(loaderDelayTimerRef.current);
    window.clearTimeout(readinessDeadlineTimerRef.current);
    removeBootstrapLoader();

    const revealContent = () => {
      if (runRef.current !== run) return;
      loaderVisibleRef.current = false;
      setPhase("hidden");
      setBusy(false);
      document.documentElement.classList.remove("app-visual-loading");
      onReadyRef.current?.();
    };

    if (!loaderVisibleRef.current) {
      revealContent();
      return;
    }

    setPhase("leaving");
    exitTimerRef.current = window.setTimeout(revealContent, LOADER_EXIT_MS);
  }, []);

  const prepare = useCallback((root: HTMLElement) => {
    contentRef.current = root;
    const run = ++runRef.current;
    const mobileDevice = usesMobileResumeProtection();
    window.clearTimeout(exitTimerRef.current);
    window.clearTimeout(readinessDeadlineTimerRef.current);
    readyRef.current = false;
    setBusy(true);
    readinessDeadlineTimerRef.current = window.setTimeout(() => finishReady(run), MAX_VISUAL_WAIT_MS);

    if (!hasPendingVisualWork(root)) {
      void afterFrames(2).then(() => finishReady(run));
      return;
    }

    scheduleLoadingCover(mobileDevice);
    void waitForVisualStability(root).then(() => {
      finishReady(run);
    });
  }, [finishReady, scheduleLoadingCover]);

  useLayoutEffect(() => {
    if (!contentRef.current && !readyRef.current) {
      scheduleLoadingCover(usesMobileResumeProtection());
    }
    return () => window.clearTimeout(loaderDelayTimerRef.current);
  }, [scheduleLoadingCover]);

  useEffect(() => {
    const resume = (restoredFromPageCache: boolean) => {
      const mobileDevice = usesMobileResumeProtection();
      if (!mobileDevice) {
        hiddenAtRef.current = null;
        restoredFromPageCacheRef.current = false;
        return;
      }
      if (document.visibilityState !== "visible" || hiddenAtRef.current === null) return;

      const elapsedMs = Date.now() - hiddenAtRef.current;
      const route = contentRef.current;
      const resumeContext = {
        elapsedMs,
        restoredFromPageCache,
        mobileDevice,
      };
      hiddenAtRef.current = null;
      restoredFromPageCacheRef.current = false;
      if (route?.isConnected && shouldRevalidateAfterResume(resumeContext)) prepare(route);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (!usesMobileResumeProtection()) {
          hiddenAtRef.current = null;
          restoredFromPageCacheRef.current = false;
          return;
        }
        window.clearTimeout(resumeTimerRef.current);
        hiddenAtRef.current = Date.now();
        return;
      }
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = window.setTimeout(() => resume(restoredFromPageCacheRef.current), 50);
    };
    const onPageHide = () => {
      if (!usesMobileResumeProtection()) return;
      window.clearTimeout(resumeTimerRef.current);
      hiddenAtRef.current ??= Date.now();
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted && usesMobileResumeProtection()) {
        window.clearTimeout(resumeTimerRef.current);
        restoredFromPageCacheRef.current = true;
        hiddenAtRef.current ??= Date.now();
        resume(true);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.clearTimeout(resumeTimerRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [prepare]);

  useEffect(() => () => {
    runRef.current += 1;
    window.clearTimeout(exitTimerRef.current);
    window.clearTimeout(loaderDelayTimerRef.current);
    window.clearTimeout(readinessDeadlineTimerRef.current);
    window.clearTimeout(resumeTimerRef.current);
  }, []);

  return (
    <div className="visual-readiness-gate" aria-busy={busy}>
      <Suspense fallback={null}>
        <ReadyProbe onCommit={prepare}>{children}</ReadyProbe>
      </Suspense>
      {phase !== "hidden" && <RouteLoader label={label} leaving={phase === "leaving"} />}
    </div>
  );
}
