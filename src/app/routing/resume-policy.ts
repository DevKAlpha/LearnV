export const MOBILE_VISUAL_LOADER_DELAY_MS = 260;
export const DESKTOP_VISUAL_LOADER_DELAY_MS = 320;

/** Avoids flashing the full-screen loader for work that finishes within one perceived interaction. */
export function visualLoaderDelay(mobileDevice: boolean) {
  return mobileDevice ? MOBILE_VISUAL_LOADER_DELAY_MS : DESKTOP_VISUAL_LOADER_DELAY_MS;
}
