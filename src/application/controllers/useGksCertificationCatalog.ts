import { useEffect, useState } from "react";
import type { CertificationCatalog, CertificationOpportunity } from "../../domain/models/gks";
import {
  readGksCertificationBackup,
  recordGksCertificationLog,
  writeGksCertificationBackup,
} from "../../infrastructure/data/gks-certification-log";
import { fallbackCertificationCatalog } from "../../infrastructure/data/gks-certification-opportunities";

const languages = new Set(["korean", "english"]);
const costs = new Set(["free", "paid", "conditional"]);
const modalities = new Set(["online", "in-person"]);
const uses = new Set(["scoring", "supporting", "diagnostic"]);
const availabilityValues = new Set(["open", "scheduled", "check"]);
const MAX_CATALOG_OPPORTUNITIES = 100;

function hasLocalizedText(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return ["es", "en", "ko"].every((locale) => (
    typeof candidate[locale] === "string"
    && candidate[locale].trim().length > 0
    && candidate[locale].length <= 1_000
  ));
}

function isValidIsoDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isValidIsoTimestamp(value: unknown) {
  return typeof value === "string"
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && isValidIsoDate(value.slice(0, 10))
    && Number.isFinite(Date.parse(value));
}

function isHttpsUrl(value: unknown) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function isOpportunity(value: unknown): value is CertificationOpportunity {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CertificationOpportunity>;
  const content = candidate.content as Partial<CertificationOpportunity["content"]> | undefined;

  return typeof candidate.id === "string"
    && candidate.id.trim().length > 0
    && candidate.id.length <= 80
    && typeof candidate.name === "string"
    && candidate.name.trim().length > 0
    && candidate.name.length <= 160
    && typeof candidate.issuer === "string"
    && candidate.issuer.trim().length > 0
    && candidate.issuer.length <= 160
    && isHttpsUrl(candidate.url)
    && isValidIsoDate(candidate.verifiedAt)
    && languages.has(candidate.language ?? "")
    && costs.has(candidate.cost ?? "")
    && Array.isArray(candidate.modalities)
    && candidate.modalities.length > 0
    && new Set(candidate.modalities).size === candidate.modalities.length
    && candidate.modalities.every((modality) => modalities.has(modality))
    && uses.has(candidate.gksUse ?? "")
    && availabilityValues.has(candidate.availability ?? "")
    && hasLocalizedText(content?.summary)
    && hasLocalizedText(content?.price)
    && hasLocalizedText(content?.schedule)
    && hasLocalizedText(content?.caution);
}

export function isCertificationCatalog(value: unknown): value is CertificationCatalog {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CertificationCatalog>;
  if (candidate.schemaVersion !== 1 || !isValidIsoTimestamp(candidate.updatedAt)) return false;

  if (!Array.isArray(candidate.opportunities)
    || candidate.opportunities.length === 0
    || candidate.opportunities.length > MAX_CATALOG_OPPORTUNITIES
    || !candidate.opportunities.every(isOpportunity)) return false;

  return new Set(candidate.opportunities.map((opportunity) => opportunity.id)).size === candidate.opportunities.length;
}

export function useGksCertificationCatalog() {
  const [catalog, setCatalog] = useState(fallbackCertificationCatalog);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => controller.abort(), 2_500);
    const catalogUrl = new URL("data/gks-certification-catalog.json", document.baseURI);

    const recoverCatalog = (event: "catalog-invalid" | "catalog-fetch-failed", reason: string) => {
      const backup = readGksCertificationBackup(isCertificationCatalog);
      recordGksCertificationLog({
        event,
        source: "runtime",
        catalogUpdatedAt: null,
        opportunityCount: null,
        opportunityId: null,
        reason,
        filters: null,
      });

      if (backup) {
        if (active) setCatalog(backup);
        recordGksCertificationLog({
          event: "catalog-restored",
          source: "backup",
          catalogUpdatedAt: backup.updatedAt,
          opportunityCount: backup.opportunities.length,
          opportunityId: null,
          reason: event,
          filters: null,
        });
        return;
      }

      recordGksCertificationLog({
        event: "catalog-fallback-used",
        source: "fallback",
        catalogUpdatedAt: fallbackCertificationCatalog.updatedAt,
        opportunityCount: fallbackCertificationCatalog.opportunities.length,
        opportunityId: null,
        reason: event,
        filters: null,
      });
    };

    fetch(catalogUrl, { cache: "no-cache", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((value: unknown) => {
        if (!isCertificationCatalog(value)) {
          recoverCatalog("catalog-invalid", "schema-validation-failed");
          return;
        }
        if (active) setCatalog(value);
        writeGksCertificationBackup(value);
        recordGksCertificationLog({
          event: "catalog-loaded",
          source: "runtime",
          catalogUpdatedAt: value.updatedAt,
          opportunityCount: value.opportunities.length,
          opportunityId: null,
          reason: null,
          filters: null,
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const reason = error instanceof DOMException && error.name === "AbortError"
          ? "request-timeout"
          : error instanceof Error ? error.message : "unknown-fetch-error";
        recoverCatalog("catalog-fetch-failed", reason);
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return { ...catalog, isLoading };
}
