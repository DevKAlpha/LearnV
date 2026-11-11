import { isLearningQa } from "@/infrastructure/config/app-scope";

/**
 * Whole-device backup of LearnV's local data. Everything stays on the person's device:
 * the file is produced and read in the browser and never uploaded anywhere.
 */
export const DEVICE_BACKUP_FORMAT = 1;
export const DEVICE_BACKUP_MAX_BYTES = 5_000_000;
const MAX_VALUE_LENGTH = 1_500_000;
const LOGICAL_KEY = /^learnv-[a-z0-9-]+(?::[a-z0-9-]+)*$/;
/** Shared, unscoped preferences (see ThemeContext / I18nContext). */
const UNSCOPED_KEYS = new Set(["learnv-theme-v1", "learnv-locale-v1"]);
/** Diagnostics and transient recovery state are not learner data. */
const EXCLUDED_PREFIXES = ["learnv-learning-error-log-v1", "learnv-asset-recovery-v1", "learnv-gks-certification-log-v1", "learnv-gks-certification-backup-v1"];

type BackupStorage = Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length">;

export type DeviceBackup = {
  app: "learnv";
  format: typeof DEVICE_BACKUP_FORMAT;
  exportedAt: string;
  data: Record<string, string>;
};

export type DeviceBackupIssue = "too-large" | "not-json" | "not-learnv" | "unsupported-format" | "empty";

function isIncluded(logicalKey: string) {
  return LOGICAL_KEY.test(logicalKey) && !EXCLUDED_PREFIXES.some((prefix) => logicalKey.startsWith(prefix));
}

/** Maps a stored key to its scope-free name, or null when it belongs to another scope or app. */
function logicalKeyFor(storageKey: string, qa: boolean) {
  if (UNSCOPED_KEYS.has(storageKey)) return storageKey;
  if (qa) return storageKey.startsWith("qa:") ? storageKey.slice(3) : null;
  return storageKey.startsWith("qa:") ? null : storageKey;
}

function storageKeyFor(logicalKey: string, qa: boolean) {
  return qa && !UNSCOPED_KEYS.has(logicalKey) ? `qa:${logicalKey}` : logicalKey;
}

function ownedStorageKeys(storage: BackupStorage, qa: boolean) {
  const keys: Array<{ storageKey: string; logicalKey: string }> = [];
  for (let index = 0; index < storage.length; index += 1) {
    const storageKey = storage.key(index);
    if (!storageKey) continue;
    const logicalKey = logicalKeyFor(storageKey, qa);
    if (logicalKey && isIncluded(logicalKey)) keys.push({ storageKey, logicalKey });
  }
  return keys;
}

export function createDeviceBackup(storage: BackupStorage, now = new Date(), qa = isLearningQa): DeviceBackup {
  const data: Record<string, string> = {};
  for (const { storageKey, logicalKey } of ownedStorageKeys(storage, qa)) {
    const value = storage.getItem(storageKey);
    if (value !== null) data[logicalKey] = value;
  }
  return { app: "learnv", format: DEVICE_BACKUP_FORMAT, exportedAt: now.toISOString(), data };
}

export function parseDeviceBackup(text: string): { backup: DeviceBackup } | { issue: DeviceBackupIssue } {
  if (text.length > DEVICE_BACKUP_MAX_BYTES) return { issue: "too-large" };
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { return { issue: "not-json" }; }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return { issue: "not-learnv" };
  const candidate = parsed as Record<string, unknown>;
  if (candidate.app !== "learnv" || typeof candidate.data !== "object" || candidate.data === null || Array.isArray(candidate.data)) {
    return { issue: "not-learnv" };
  }
  if (candidate.format !== DEVICE_BACKUP_FORMAT) return { issue: "unsupported-format" };
  const data: Record<string, string> = {};
  for (const [key, value] of Object.entries(candidate.data as Record<string, unknown>)) {
    // Only known-shaped LearnV keys with string payloads; each module re-validates on read.
    if (isIncluded(key) && typeof value === "string" && value.length <= MAX_VALUE_LENGTH) data[key] = value;
  }
  if (Object.keys(data).length === 0) return { issue: "empty" };
  const exportedAt = typeof candidate.exportedAt === "string" && Number.isFinite(Date.parse(candidate.exportedAt))
    ? candidate.exportedAt
    : new Date(0).toISOString();
  return { backup: { app: "learnv", format: DEVICE_BACKUP_FORMAT, exportedAt, data } };
}

/** Replaces this device's LearnV data with the backup. Returns false if storage refused the write. */
export function restoreDeviceBackup(storage: BackupStorage, backup: DeviceBackup, qa = isLearningQa): boolean {
  const previous = createDeviceBackup(storage, new Date(), qa);
  try {
    // Write first, delete stale keys only once every write has succeeded.
    for (const [logicalKey, value] of Object.entries(backup.data)) storage.setItem(storageKeyFor(logicalKey, qa), value);
    for (const { storageKey, logicalKey } of ownedStorageKeys(storage, qa)) {
      if (!(logicalKey in backup.data)) storage.removeItem(storageKey);
    }
    return true;
  } catch {
    // Quota or private mode: undo partial writes as far as possible.
    try {
      for (const logicalKey of Object.keys(backup.data)) {
        const storageKey = storageKeyFor(logicalKey, qa);
        if (logicalKey in previous.data) storage.setItem(storageKey, previous.data[logicalKey]!);
        else storage.removeItem(storageKey);
      }
    } catch { /* Nothing else can be done without storage. */ }
    return false;
  }
}

export function summarizeDeviceBackup(backup: DeviceBackup) {
  const has = (prefix: string) => Object.keys(backup.data).some((key) => key.startsWith(prefix));
  return {
    entries: Object.keys(backup.data).length,
    exportedAt: backup.exportedAt,
    languageTests: has("learnv-language-tests-v1"),
    taskBoard: has("learnv-task-board-v1"),
    drafts: has("learnv-written-simulator-v1") || has("learnv-interview-practice-v1"),
  };
}
