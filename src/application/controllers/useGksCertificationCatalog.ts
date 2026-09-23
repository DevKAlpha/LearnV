import { useEffect, useState } from "react";
import type { CertificationCatalog, CertificationOpportunity } from "../../domain/models/gks";
import { fallbackCertificationCatalog } from "../../infrastructure/data/gks-certification-opportunities";

const languages = new Set(["korean", "english"]);
const costs = new Set(["free", "paid", "conditional"]);
const modalities = new Set(["online", "in-person"]);
const uses = new Set(["scoring", "supporting", "diagnostic"]);
const availabilityValues = new Set(["open", "scheduled", "check"]);

function hasLocalizedText(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return ["es", "en", "ko"].every((locale) => typeof candidate[locale] === "string" && candidate[locale].length > 0);
}

function isOpportunity(value: unknown): value is CertificationOpportunity {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CertificationOpportunity>;
  const content = candidate.content as Partial<CertificationOpportunity["content"]> | undefined;

  return typeof candidate.id === "string"
    && typeof candidate.name === "string"
    && typeof candidate.issuer === "string"
    && typeof candidate.url === "string"
    && candidate.url.startsWith("https://")
    && typeof candidate.verifiedAt === "string"
    && languages.has(candidate.language ?? "")
    && costs.has(candidate.cost ?? "")
    && Array.isArray(candidate.modalities)
    && candidate.modalities.length > 0
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
  return candidate.schemaVersion === 1
    && typeof candidate.updatedAt === "string"
    && Array.isArray(candidate.opportunities)
    && candidate.opportunities.length > 0
    && candidate.opportunities.every(isOpportunity);
}

export function useGksCertificationCatalog() {
  const [catalog, setCatalog] = useState(fallbackCertificationCatalog);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => controller.abort(), 2_500);
    const catalogUrl = new URL("data/gks-certification-catalog.json", document.baseURI);

    fetch(catalogUrl, { cache: "no-cache", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((value: unknown) => {
        if (active && isCertificationCatalog(value)) setCatalog(value);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
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
