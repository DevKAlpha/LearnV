export const LONG_BACKGROUND_RELOAD_MS = 60_000;
export const PAGE_CACHE_RELOAD_MS = 4_000;

type ResumeContext = {
  elapsedMs: number;
  restoredFromPageCache: boolean;
  mobileDevice: boolean;
};

/** Decides when a stale mobile browser state must be replaced by a fresh route load. */
export function shouldReloadAfterResume({ elapsedMs, restoredFromPageCache, mobileDevice }: ResumeContext) {
  if (!mobileDevice) return false;
  const safeElapsed = Math.max(0, elapsedMs);
  return safeElapsed >= LONG_BACKGROUND_RELOAD_MS
    || (restoredFromPageCache && safeElapsed >= PAGE_CACHE_RELOAD_MS);
}
