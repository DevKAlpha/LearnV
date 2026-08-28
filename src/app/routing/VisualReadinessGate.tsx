import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  Suspense,
  type PropsWithChildren,
} from "react";
import { RouteLoader } from "@/app/routing/RouteLoader";
import {
  PAGE_CACHE_RELOAD_MS,
  shouldReloadAfterResume,
} from "@/app/routing/resume-policy";

type VisualReadinessGateProps = PropsWithChildren<{
  label: string;
  onReady?: () => void;
}>;

type LoaderPhase = "loading" | "leaving" | "hidden";

const FONT_TIMEOUT_MS = 1_200;
const IMAGE_TIMEOUT_MS = 3_000;
const MOTION_TIMEOUT_MS = 700;
const DOM_SETTLE_TIMEOUT_MS = 2_000;
const DOM_QUIET_MS = 240;
const PENDING_CONTENT_TIMEOUT_MS = 3_200;
const LOADER_EXIT_MS = 210;

function afterFrames(count = 1) {
  return new Promise<void>((resolve) => {
    const advance = (remaining: number) => {
      if (remaining <= 0) {
        resolve();
        return;
      }
      window.requestAnimationFrame(() => advance(remaining - 1));
    };
    advance(count);
  });
}

function afterDelay(delay: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, delay));
}

async function withTimeout(work: Promise<unknown>, timeout: number) {
  await Promise.race([work, afterDelay(timeout)]);
}

function waitForDomQuiet(root: HTMLElement) {
  return new Promise<void>((resolve) => {
    let quietTimer = 0;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(quietTimer);
      window.clearTimeout(maxTimer);
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
      resolve();
    };
    const scheduleQuietCheck = () => {
      window.clearTimeout(quietTimer);
      quietTimer = window.setTimeout(finish, DOM_QUIET_MS);
    };
    const mutationObserver = new MutationObserver(scheduleQuietCheck);
    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(scheduleQuietCheck);
    const maxTimer = window.setTimeout(finish, DOM_SETTLE_TIMEOUT_MS);
    mutationObserver.observe(root, { attributes: true, characterData: true, childList: true, subtree: true });
    resizeObserver?.observe(root);
    root.querySelectorAll<HTMLElement>("header, section, article, img").forEach((element) => {
      resizeObserver?.observe(element);
    });
    scheduleQuietCheck();
  });
}

function pendingVisualContent(root: HTMLElement) {
  return root.querySelector('[data-visual-pending="true"]');
}

function waitForPendingVisualContent(root: HTMLElement) {
  if (!pendingVisualContent(root)) return Promise.resolve();

  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(maxTimer);
      observer.disconnect();
      resolve();
    };
    const observer = new MutationObserver(() => {
      if (!pendingVisualContent(root)) finish();
    });
    const maxTimer = window.setTimeout(finish, PENDING_CONTENT_TIMEOUT_MS);
    observer.observe(root, { attributes: true, childList: true, subtree: true });
  });
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

function finiteAnimations(root: HTMLElement) {
  return root.getAnimations({ subtree: true }).filter((animation) => {
    const timing = animation.effect?.getComputedTiming();
    if (!timing) return false;
    const iterations = Number(timing.iterations);
    const duration = Number(timing.duration);
    return Number.isFinite(iterations)
      && Number.isFinite(duration)
      && animation.playState !== "finished"
      && animation.playState !== "idle";
  });
}

async function waitForVisualStability(root: HTMLElement) {
  if (document.readyState !== "complete") {
    await withTimeout(new Promise<void>((resolve) => {
      window.addEventListener("load", () => resolve(), { once: true });
    }), IMAGE_TIMEOUT_MS);
  }

  if (document.fonts?.ready) {
    await withTimeout(document.fonts.ready, FONT_TIMEOUT_MS);
  }

  await waitForPendingVisualContent(root);
  await waitForDomQuiet(root);
  await afterFrames(2);

  const routeImages = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
  const imagesToDecode = routeImages.filter((image) => image.loading !== "lazy" || isNearViewport(image));
  if (imagesToDecode.length > 0) {
    await withTimeout(Promise.all(imagesToDecode.map(waitForImage)), IMAGE_TIMEOUT_MS);
  }

  await waitForDomQuiet(root);
  await waitForStableLayout(root);
  await afterFrames(2);

  const animations = finiteAnimations(root);
  if (animations.length > 0) {
    await withTimeout(
      Promise.allSettled(animations.map((animation) => animation.finished)),
      MOTION_TIMEOUT_MS,
    );
  }

  await waitForDomQuiet(root);
  await waitForStableLayout(root);
  await afterFrames(2);
}

function removeBootstrapLoader() {
  document.getElementById("learnv-bootstrap-loader")?.remove();
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
  const [phase, setPhase] = useState<LoaderPhase>("loading");
  const contentRef = useRef<HTMLElement | null>(null);
  const runRef = useRef(0);
  const exitTimerRef = useRef(0);
  const resumeTimerRef = useRef(0);
  const hiddenAtRef = useRef<number | null>(null);
  const restoredFromPageCacheRef = useRef(false);
  const reloadScheduledRef = useRef(false);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useLayoutEffect(() => {
    document.documentElement.classList.add("app-visual-loading");
  }, []);

  const prepare = useCallback((root: HTMLElement) => {
    contentRef.current = root;
    const run = ++runRef.current;
    window.clearTimeout(exitTimerRef.current);
    document.documentElement.classList.add("app-visual-loading");
    setPhase("loading");

    void waitForVisualStability(root).then(() => {
      if (runRef.current !== run) return;
      removeBootstrapLoader();
      setPhase("leaving");
      exitTimerRef.current = window.setTimeout(() => {
        if (runRef.current !== run) return;
        setPhase("hidden");
        document.documentElement.classList.remove("app-visual-loading");
        onReadyRef.current?.();
      }, LOADER_EXIT_MS);
    });
  }, []);

  useEffect(() => {
    const coverCurrentRoute = () => {
      runRef.current += 1;
      window.clearTimeout(exitTimerRef.current);
      document.documentElement.classList.add("app-visual-loading");
      setPhase("loading");
    };
    const reloadCurrentRoute = () => {
      if (reloadScheduledRef.current) return;
      reloadScheduledRef.current = true;
      coverCurrentRoute();
      void afterFrames(2).then(() => window.location.reload());
    };
    const resume = (restoredFromPageCache: boolean) => {
      if (
        document.visibilityState !== "visible"
        || hiddenAtRef.current === null
        || !contentRef.current
        || reloadScheduledRef.current
      ) return;

      const elapsedMs = Date.now() - hiddenAtRef.current;
      if (shouldReloadAfterResume({ elapsedMs, restoredFromPageCache })) {
        reloadCurrentRoute();
        return;
      }

      hiddenAtRef.current = null;
      restoredFromPageCacheRef.current = false;
      prepare(contentRef.current);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        window.clearTimeout(resumeTimerRef.current);
        hiddenAtRef.current = Date.now();
        coverCurrentRoute();
        return;
      }
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = window.setTimeout(() => resume(restoredFromPageCacheRef.current), 50);
    };
    const onPageHide = () => {
      window.clearTimeout(resumeTimerRef.current);
      hiddenAtRef.current ??= Date.now();
      coverCurrentRoute();
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.clearTimeout(resumeTimerRef.current);
        restoredFromPageCacheRef.current = true;
        hiddenAtRef.current ??= Date.now() - PAGE_CACHE_RELOAD_MS;
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
    window.clearTimeout(resumeTimerRef.current);
  }, []);

  return (
    <div className="visual-readiness-gate" aria-busy={phase !== "hidden"}>
      <Suspense fallback={null}>
        <ReadyProbe onCommit={prepare}>{children}</ReadyProbe>
      </Suspense>
      {phase !== "hidden" && <RouteLoader label={label} leaving={phase === "leaving"} />}
    </div>
  );
}
