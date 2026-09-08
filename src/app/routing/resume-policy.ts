export const LONG_BACKGROUND_REVALIDATE_MS = 60_000;
export const MOBILE_VISUAL_LOADER_DELAY_MS = 260;
export const DESKTOP_VISUAL_LOADER_DELAY_MS = 320;

type ResumeContext = {
  elapsedMs: number;
  restoredFromPageCache: boolean;
  mobileDevice: boolean;
  documentWasDiscarded?: boolean;
  routeAvailable?: boolean;
};

/** Reloads only when the browser discarded the document or the mounted route was lost. */
export function shouldReloadAfterResume({
  mobileDevice,
  documentWasDiscarded = false,
  routeAvailable = true,
}: ResumeContext) {
  if (!mobileDevice) return false;
  return documentWasDiscarded || !routeAvailable;
}

/** Rechecks visual resources after a meaningful mobile suspension without reloading healthy UI. */
export function shouldRevalidateAfterResume({ elapsedMs, restoredFromPageCache, mobileDevice }: ResumeContext) {
  if (!mobileDevice) return false;
  return restoredFromPageCache || Math.max(0, elapsedMs) >= LONG_BACKGROUND_REVALIDATE_MS;
}

/** Avoids flashing the full-screen loader for work that finishes within one perceived interaction. */
export function visualLoaderDelay(mobileDevice: boolean) {
  return mobileDevice ? MOBILE_VISUAL_LOADER_DELAY_MS : DESKTOP_VISUAL_LOADER_DELAY_MS;
}
