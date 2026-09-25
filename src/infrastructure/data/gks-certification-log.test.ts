import { describe, expect, it } from "vitest";
import type { CertificationCatalog } from "../../domain/models/gks";
import { fallbackCertificationCatalog } from "./gks-certification-opportunities";
import {
  GKS_CERTIFICATION_BACKUP_STORAGE_KEY,
  GKS_CERTIFICATION_LOG_LIMIT,
  GKS_CERTIFICATION_LOG_STORAGE_KEY,
  readGksCertificationBackup,
  readGksCertificationLog,
  recordGksCertificationLog,
  writeGksCertificationBackup,
} from "./gks-certification-log";

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem(key: string) { return values.get(key) ?? null; },
    setItem(key: string, value: string) { values.set(key, value); },
  };
}

function isKnownCatalog(value: unknown): value is CertificationCatalog {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CertificationCatalog>;
  return candidate.schemaVersion === 1
    && typeof candidate.updatedAt === "string"
    && Array.isArray(candidate.opportunities)
    && candidate.opportunities.length > 0;
}

describe("hidden GKS certification log and backup", () => {
  it("stores diagnostic metadata without certificate content or URLs", () => {
    const storage = createMemoryStorage();
    recordGksCertificationLog({
      event: "official-link-opened",
      source: "user",
      catalogUpdatedAt: fallbackCertificationCatalog.updatedAt,
      opportunityCount: fallbackCertificationCatalog.opportunities.length,
      opportunityId: "topik-official",
      reason: null,
      filters: { language: "korean", cost: "all", modality: "in-person" },
    }, storage);

    const raw = storage.getItem(GKS_CERTIFICATION_LOG_STORAGE_KEY) ?? "";
    expect(readGksCertificationLog(storage)[0]).toMatchObject({
      event: "official-link-opened",
      opportunityId: "topik-official",
    });
    expect(raw).not.toContain("https://");
    expect(raw).not.toContain(fallbackCertificationCatalog.opportunities[0].content.summary.es);
  });

  it("keeps a bounded newest-first history", () => {
    const storage = createMemoryStorage();
    for (let index = 0; index < GKS_CERTIFICATION_LOG_LIMIT + 3; index += 1) {
      recordGksCertificationLog({
        event: "filter-changed",
        source: "user",
        catalogUpdatedAt: null,
        opportunityCount: index,
        opportunityId: null,
        reason: null,
        filters: { language: "all", cost: "all", modality: "all" },
        recordedAt: new Date(2026, 8, 23, 10, 0, index).toISOString(),
      }, storage);
    }

    const entries = readGksCertificationLog(storage);
    expect(entries).toHaveLength(GKS_CERTIFICATION_LOG_LIMIT);
    expect(entries[0].opportunityCount).toBe(GKS_CERTIFICATION_LOG_LIMIT + 2);
  });

  it("restores only a valid catalog backup", () => {
    const storage = createMemoryStorage();
    expect(writeGksCertificationBackup(fallbackCertificationCatalog, storage)).toBe(true);
    expect(readGksCertificationBackup(isKnownCatalog, storage)).toEqual(fallbackCertificationCatalog);

    storage.setItem(GKS_CERTIFICATION_BACKUP_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, opportunities: [] }));
    expect(readGksCertificationBackup(isKnownCatalog, storage)).toBeNull();
  });

  it("recovers silently from corrupted log and backup data", () => {
    const storage = createMemoryStorage();
    storage.setItem(GKS_CERTIFICATION_LOG_STORAGE_KEY, "broken");
    storage.setItem(GKS_CERTIFICATION_BACKUP_STORAGE_KEY, "broken");
    expect(readGksCertificationLog(storage)).toEqual([]);
    expect(readGksCertificationBackup(isKnownCatalog, storage)).toBeNull();
  });

  it("descarta entradas parciales aunque el JSON sea válido", () => {
    const storage = createMemoryStorage();
    storage.setItem(GKS_CERTIFICATION_LOG_STORAGE_KEY, JSON.stringify([
      { id: "partial", recordedAt: "not-a-date", event: "catalog-loaded", source: "runtime" },
      { id: "ambiguous-date", recordedAt: "1", event: "catalog-loaded", source: "runtime" },
      { id: "unknown-event", recordedAt: new Date().toISOString(), event: "unknown", source: "runtime" },
    ]));

    expect(readGksCertificationLog(storage)).toEqual([]);
  });
});
