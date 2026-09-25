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
const sources = new Set<GksCertificationLogEntry["source"]>(["runtime", "backup", "fallback", "user"]);
const filterLanguages = new Set(["all", "korean", "english"]);
const filterCosts = new Set(["all", "free", "paid", "conditional"]);
const filterModalities = new Set(["all", "online", "in-person"]);

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

function isIsoCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isIsoTimestamp(value: unknown) {
  return typeof value === "string"
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && isIsoCalendarDate(value.slice(0, 10))
    && Number.isFinite(Date.parse(value));
}

function isLogEntry(value: unknown): value is GksCertificationLogEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<GksCertificationLogEntry>;
  const validFilters = entry.filters === null || Boolean(entry.filters
    && filterLanguages.has(entry.filters.language)
    && filterCosts.has(entry.filters.cost)
    && filterModalities.has(entry.filters.modality));
  const validCount = entry.opportunityCount === null
    || (typeof entry.opportunityCount === "number" && Number.isInteger(entry.opportunityCount) && entry.opportunityCount >= 0);
  return typeof entry.id === "string"
    && entry.id.length > 0
    && entry.id.length <= 240
    && isIsoTimestamp(entry.recordedAt)
    && events.has(entry.event as GksCertificationLogEvent)
    && sources.has(entry.source as GksCertificationLogEntry["source"])
    && (entry.catalogUpdatedAt === null || isIsoTimestamp(entry.catalogUpdatedAt))
    && validCount
    && (entry.opportunityId === null
      || (typeof entry.opportunityId === "string" && entry.opportunityId.length <= 80))
    && (entry.reason === null || (typeof entry.reason === "string" && entry.reason.length <= 160))
    && validFilters;
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
