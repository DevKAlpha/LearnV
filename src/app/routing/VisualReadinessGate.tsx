import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type PropsWithChildren } from "react";
import { RouteLoader } from "@/app/routing/RouteLoader";
import { RouteRecoveryBoundary } from "@/app/routing/RouteRecoveryBoundary";
import { ASSET_LOAD_TIMEOUT_MS, recoverFromAssetFailure } from "@/app/routing/asset-recovery";
import { visualLoaderDelay } from "@/app/routing/resume-policy";

function releaseBootstrap(ready: boolean) {
  const bootstrapWindow = window as Window & {
    __learnvBootstrapLoaderTimer?: number;
    __learnvBootstrapCleanup?: () => void;
  };
  window.clearTimeout(bootstrapWindow.__learnvBootstrapLoaderTimer);
  bootstrapWindow.__learnvBootstrapCleanup?.();
  delete bootstrapWindow.__learnvBootstrapLoaderTimer;
  delete bootstrapWindow.__learnvBootstrapCleanup;
  document.getElementById("learnv-bootstrap-loader")?.remove();
  document.documentElement.classList.remove("app-visual-loading");
  if (!ready) return;
  document.documentElement.dataset.learnvReady = "true";
  try { window.sessionStorage.removeItem("learnv-asset-recovery-v1"); } catch { /* Storage is optional. */ }
  const url = new URL(window.location.href);
  if (url.searchParams.has("learnv-recover")) {
    url.searchParams.delete("learnv-recover");
    window.history.replaceState(window.history.state, "", url);
  }
}

function ReadyProbe({ children, onCommit }: PropsWithChildren<{ onCommit: (root: HTMLElement) => void }>) {
  const rootRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (rootRef.current) onCommit(rootRef.current);
  }, [onCommit]);
  return <div ref={rootRef} className="visual-readiness-content">{children}</div>;
}

function FailedRoute({ failed }: { failed: boolean }) {
  if (failed) throw new Error("Asset load timed out");
  return null;
}

/** A committed route is usable immediately; decorative fonts and images never block navigation. */
export function VisualReadinessGate({ children, label, onReady }: PropsWithChildren<{
  label: string;
  onReady?: () => void;
}>) {
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(true);
  const [failed, setFailed] = useState(false);
  const contentRef = useRef<HTMLElement | null>(null);
  const startedAt = useRef(Date.now());
  const loaderTimer = useRef(0);
  const deadlineTimer = useRef(0);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const finishReady = useCallback((root?: HTMLElement) => {
    if (root) contentRef.current = root;
    window.clearTimeout(loaderTimer.current);
    window.clearTimeout(deadlineTimer.current);
    releaseBootstrap(Boolean(contentRef.current?.isConnected));
    setLoading(false);
    setBusy(false);
    onReadyRef.current?.();
  }, []);

  useEffect(() => {
    const checkPending = () => {
      if (contentRef.current?.isConnected) { finishReady(); return; }
      if (document.visibilityState !== "visible") return;
      if (Date.now() - startedAt.current < ASSET_LOAD_TIMEOUT_MS) return;
      if (navigator.onLine !== false) recoverFromAssetFailure(new Error("Asset load timed out"));
      setFailed(true);
    };
    const onOnline = () => {
      if (!contentRef.current?.isConnected) startedAt.current = 0;
      checkPending();
    };
    if (!contentRef.current?.isConnected) {
      const mobile = window.matchMedia("(pointer: coarse), (max-width: 719px)").matches;
      loaderTimer.current = window.setTimeout(() => setLoading(true), visualLoaderDelay(mobile));
      deadlineTimer.current = window.setTimeout(checkPending, ASSET_LOAD_TIMEOUT_MS);
    }
    document.addEventListener("visibilitychange", checkPending);
    window.addEventListener("pageshow", checkPending);
    window.addEventListener("online", onOnline);
    return () => {
      window.clearTimeout(loaderTimer.current);
      window.clearTimeout(deadlineTimer.current);
      document.documentElement.classList.remove("app-visual-loading");
      document.removeEventListener("visibilitychange", checkPending);
      window.removeEventListener("pageshow", checkPending);
      window.removeEventListener("online", onOnline);
    };
  }, [finishReady]);

  return (
    <div className="visual-readiness-gate" aria-busy={busy}>
      <RouteRecoveryBoundary onFailure={() => finishReady()}>
        <FailedRoute failed={failed} />
        <Suspense fallback={null}>
          <ReadyProbe onCommit={finishReady}>{children}</ReadyProbe>
        </Suspense>
      </RouteRecoveryBoundary>
      {loading && <RouteLoader label={label} />}
    </div>
  );
}
