/**
 * Which localStorage entries travel to an optional LearnV account.
 *
 * Shared by the web client (what to upload) and the API (what to accept), so both sides
 * agree on names and limits. This module has no dependencies: the client imports it
 * from the startup bundle.
 */
export const SYNC_PROTOCOL_VERSION = 1;

/** Same shape as the device backup keys: `learnv-<name>-v<n>` with optional `:<scope>` parts. */
export const SYNC_KEY_PATTERN = /^learnv-[a-z0-9-]+(?::[a-z0-9-]+)*$/;
export const MAX_SYNC_KEY_LENGTH = 100;
/** Distinct documents per account. LearnV uses about 25 today. */
export const MAX_SYNC_DOCUMENTS = 64;
/** One stored value, in UTF-16 code units (the browser's localStorage measure). Matches the device backup. */
export const MAX_DOCUMENT_CHARS = 1_500_000;
/** Everything one account may store, in UTF-16 code units. Matches the device backup file limit. */
export const MAX_ACCOUNT_CHARS = 5_000_000;

/**
 * Never synchronised:
 * - preferences that belong to one screen or device (theme, interface language, voices, reminders,
 *   which need this device's notification permission);
 * - technical diagnostics and recovery state;
 * - the synchronisation bookkeeping itself.
 */
const DEVICE_ONLY = [
  "learnv-theme-v1",
  "learnv-locale-v1",
  "learnv-study-voice-v1",
  "learnv-reminders-v1",
  "learnv-effects-v1",
  "learnv-sync-v1",
  "learnv-learning-error-log-v1",
  "learnv-asset-recovery-v1",
  "learnv-gks-certification-log-v1",
  "learnv-gks-certification-backup-v1",
] as const;

/**
 * Free text the person wrote (essays, interview answers, writing drafts). It stays on the
 * device unless the person turns on draft synchronisation.
 */
export const DRAFT_KEYS = [
  "learnv-written-simulator-v1",
  "learnv-interview-practice-v1",
  "learnv-writing-lab-v1",
] as const;

const matches = (key: string, name: string) => key === name || key.startsWith(`${name}:`);

export function isSyncKey(key: string): boolean {
  return key.length <= MAX_SYNC_KEY_LENGTH && SYNC_KEY_PATTERN.test(key) && !DEVICE_ONLY.some((name) => matches(key, name));
}

export function isDraftKey(key: string): boolean {
  return DRAFT_KEYS.some((name) => matches(key, name));
}

/** Keys rejected as object properties anywhere in synced JSON (prototype pollution). */
export const FORBIDDEN_JSON_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/** JSON.parse reviver that refuses prototype-polluting property names. */
export function safeJsonReviver(key: string, value: unknown) {
  if (FORBIDDEN_JSON_KEYS.has(key)) throw new SyntaxError(`Forbidden JSON property: ${key}`);
  return value;
}

/** True when the text is JSON without forbidden property names. */
export function isSafeJson(text: string): boolean {
  try {
    JSON.parse(text, safeJsonReviver);
    return true;
  } catch {
    return false;
  }
}
