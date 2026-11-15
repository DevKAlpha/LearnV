import { useEffect } from "react";
import { syncApiBase } from "@/infrastructure/sync/sync-config";
import { syncMetaStore } from "@/infrastructure/sync/sync-meta-store";
import { useLocalStore } from "./useLocalStore";

/** Background passes while the app is visible. */
const INTERVAL_MS = 3 * 60_000;
/** Focus and network changes come in bursts: at most one pass per this gap. */
const MIN_GAP_MS = 15_000;

/**
 * Keeps a signed-in device in sync: on start, when the app comes back to the foreground or
 * online, every few minutes while visible, and one last pass when it is hidden. Signed out,
 * it does nothing and loads nothing; the engine is imported only when a pass runs.
 */
export function useAccountAutoSync() {
  const meta = useLocalStore(syncMetaStore);
  const signedIn = Boolean(syncApiBase && meta.account);

  useEffect(() => {
    if (!signedIn) return;
    let last = 0;
    const run = (keepalive = false) => {
      if (!keepalive && Date.now() - last < MIN_GAP_MS) return;
      last = Date.now();
      void import("@/application/sync/sync-runner")
        .then((runner) => runner.syncNow({ keepalive }))
        .catch(() => { /* Chunk unavailable offline: the next trigger retries. */ });
    };
    const onVisibility = () => run(document.visibilityState === "hidden");
    const onOnline = () => run();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") run(); }, INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);
    run();
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
    };
  }, [signedIn]);
}
