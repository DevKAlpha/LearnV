export const ASSET_RECOVERY_STORAGE_KEY = "learnv-asset-recovery-v1";
export const ASSET_RECOVERY_QUERY = "learnv-recover";
export const ASSET_LOAD_TIMEOUT_MS = 8_000;
const RECOVERY_COOLDOWN_MS = 30_000;

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error ?? "");
}

export function resemblesAssetFailure(error: unknown) {
  return /chunk|module script|dynamically imported|failed to fetch|stylesheet|asset load timed out/i.test(errorMessage(error));
}

export function createRecoveryUrl(href: string, stamp: number) {
  const recoveryUrl = new URL(href);
  recoveryUrl.searchParams.set(ASSET_RECOVERY_QUERY, String(stamp));
  return recoveryUrl.toString();
}

function recentlyRecovered(now: number) {
  try {
    const previousAttempt = Number(window.sessionStorage.getItem(ASSET_RECOVERY_STORAGE_KEY));
    return Number.isFinite(previousAttempt) && now - previousAttempt < RECOVERY_COOLDOWN_MS;
  } catch {
    return new URL(window.location.href).searchParams.has(ASSET_RECOVERY_QUERY);
  }
}

/** Refreshes stale hashed assets once, while preventing reload loops on a real outage. */
export function recoverFromAssetFailure(error: unknown, force = false) {
  if (!force && !resemblesAssetFailure(error)) return false;
  const now = Date.now();
  if (!force && recentlyRecovered(now)) return false;

  try {
    window.sessionStorage.setItem(ASSET_RECOVERY_STORAGE_KEY, String(now));
  } catch {
    // The query marker remains available when session storage is restricted.
  }
  document.documentElement.classList.add("app-visual-loading");
  window.location.replace(createRecoveryUrl(window.location.href, now));
  return true;
}

/** Wraps lazy route chunks so a deployment cannot strand an old restored tab. */
export async function loadWithAssetRecovery<T>(loader: () => Promise<T>) {
  let timeout = 0;
  try {
    const timeoutFailure = new Promise<never>((_, reject) => {
      timeout = window.setTimeout(() => reject(new Error("Asset load timed out")), ASSET_LOAD_TIMEOUT_MS);
    });
    return await Promise.race([loader(), timeoutFailure]);
  } catch (error) {
    if (recoverFromAssetFailure(error)) return await new Promise<T>(() => undefined);
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
