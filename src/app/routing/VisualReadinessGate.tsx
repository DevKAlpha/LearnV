import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { RouteLoader } from "@/app/routing/RouteLoader";

type VisualReadinessGateProps = PropsWithChildren<{
  label: string;
  onReady?: () => void;
}>;

type LoaderPhase = "loading" | "leaving" | "hidden";

const FONT_TIMEOUT_MS = 1_200;
const IMAGE_TIMEOUT_MS = 1_600;
const MOTION_TIMEOUT_MS = 700;
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

  await afterFrames(2);

  const visibleImages = Array.from(root.querySelectorAll<HTMLImageElement>("img"))
    .filter((image) => image.loading !== "lazy" || isNearViewport(image));
  if (visibleImages.length > 0) {
    await withTimeout(Promise.all(visibleImages.map(waitForImage)), IMAGE_TIMEOUT_MS);
  }

  await afterFrames(2);

  const animations = finiteAnimations(root);
  if (animations.length > 0) {
    await withTimeout(
      Promise.allSettled(animations.map((animation) => animation.finished)),
      MOTION_TIMEOUT_MS,
    );
  }

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
  const hiddenAtRef = useRef<number | null>(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

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
    const resume = () => {
      if (document.visibilityState !== "visible" || hiddenAtRef.current === null || !contentRef.current) return;
      hiddenAtRef.current = null;
      prepare(contentRef.current);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = performance.now();
        runRef.current += 1;
        window.clearTimeout(exitTimerRef.current);
        document.documentElement.classList.add("app-visual-loading");
        setPhase("loading");
        return;
      }
      resume();
    };
    const onPageHide = () => {
      hiddenAtRef.current = performance.now();
      runRef.current += 1;
      window.clearTimeout(exitTimerRef.current);
      document.documentElement.classList.add("app-visual-loading");
      setPhase("loading");
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        hiddenAtRef.current ??= performance.now();
        resume();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [prepare]);

  useEffect(() => () => {
    runRef.current += 1;
    window.clearTimeout(exitTimerRef.current);
  }, []);

  return (
    <div className="visual-readiness-gate" aria-busy={phase !== "hidden"}>
      <ReadyProbe onCommit={prepare}>{children}</ReadyProbe>
      {phase !== "hidden" && <RouteLoader label={label} leaving={phase === "leaving"} />}
    </div>
  );
}
