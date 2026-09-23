import type {
  CertificationCatalog,
  CertificationCost,
  CertificationLanguage,
  CertificationModality,
} from "../../domain/models/gks";

export const GKS_CERTIFICATION_LOG_STORAGE_KEY = "learnv-gks-certification-log-v1";
export const GKS_CERTIFICATION_BACKUP_STORAGE_KEY = "learnv-gks-certification-backup-v1";
export const GKS_CERTIFICATION_LOG_LIMIT = 100;

export type GksCertificationLogEvent =
  | "catalog-loaded"
  | "catalog-restored"
  | "catalog-fallback-used"
  | "catalog-invalid"
  | "catalog-fetch-failed"
  | "filter-changed"
  | "official-link-opened";

export type GksCertificationLogEntry = {
  id: string;
  recordedAt: string;
  event: GksCertificationLogEvent;
  source: "runtime" | "backup" | "fallback" | "user";
  catalogUpdatedAt: string | null;
  opportunityCount: number | null;
  opportunityId: string | null;
  reason: string | null;
  filters: {
    language: CertificationLanguage | "all";
    cost: CertificationCost | "all";
    modality: CertificationModality | "all";
  } | null;
};

export type GksCertificationLogInput = Omit<GksCertificationLogEntry, "id" | "recordedAt"> & {
  recordedAt?: string;
};

type CertificationStorage = Pick<Storage, "getItem" | "setItem">;
type CatalogValidator = (value: unknown) => value is CertificationCatalog;

const events = new Set<GksCertificationLogEvent>([
  "catalog-loaded",
  "catalog-restored",
  "catalog-fallback-used",
  "catalog-invalid",
  "catalog-fetch-failed",
  "filter-changed",
  "official-link-opened",
]);

function browserStorage(): CertificationStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function compact(value: string | null, maxLength: number) {
  if (value === null) return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length <= maxLength ? normalized : `${normalized.slice(0, maxLength - 1)}…`;
}

function isLogEntry(value: unknown): value is GksCertificationLogEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<GksCertificationLogEntry>;
  return typeof entry.id === "string"
    && typeof entry.recordedAt === "string"
    && events.has(entry.event as GksCertificationLogEvent)
    && ["runtime", "backup", "fallback", "user"].includes(entry.source ?? "");
}

export function readGksCertificationLog(
  storage: CertificationStorage | null = browserStorage(),
): GksCertificationLogEntry[] {
  if (!storage) return [];
  try {
    const parsed: unknown = JSON.parse(storage.getItem(GKS_CERTIFICATION_LOG_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isLogEntry).slice(0, GKS_CERTIFICATION_LOG_LIMIT) : [];
  } catch {
    return [];
  }
}

/** Records metadata only: certificate descriptions, URLs and user data are deliberately excluded. */
export function recordGksCertificationLog(
  input: GksCertificationLogInput,
  storage: CertificationStorage | null = browserStorage(),
): GksCertificationLogEntry | null {
  if (!storage) return null;
  try {
    const recordedAt = input.recordedAt ?? new Date().toISOString();
    const entry: GksCertificationLogEntry = {
      ...input,
      recordedAt,
      id: `${input.event}:${recordedAt}`,
      opportunityId: compact(input.opportunityId, 80),
      reason: compact(input.reason, 160),
    };
    const entries = [entry, ...readGksCertificationLog(storage)].slice(0, GKS_CERTIFICATION_LOG_LIMIT);
    storage.setItem(GKS_CERTIFICATION_LOG_STORAGE_KEY, JSON.stringify(entries));
    return entry;
  } catch {
    return null;
  }
}

/** Keeps the latest validated runtime catalog as a private recovery copy on this device. */
export function writeGksCertificationBackup(
  catalog: CertificationCatalog,
  storage: CertificationStorage | null = browserStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(GKS_CERTIFICATION_BACKUP_STORAGE_KEY, JSON.stringify(catalog));
    return true;
  } catch {
    return false;
  }
}

export function readGksCertificationBackup(
  validate: CatalogValidator,
  storage: CertificationStorage | null = browserStorage(),
): CertificationCatalog | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(GKS_CERTIFICATION_BACKUP_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
