import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fallbackCertificationCatalog } from "../../infrastructure/data/gks-certification-opportunities";
import { isCertificationCatalog } from "./useGksCertificationCatalog";

describe("validación del catálogo remoto de certificaciones", () => {
  it("acepta el catálogo de respaldo versionado", () => {
    expect(isCertificationCatalog(fallbackCertificationCatalog)).toBe(true);
  });

  it("publica un catálogo JSON válido para actualizarse sin recompilar", () => {
    const runtimeCatalog = JSON.parse(readFileSync(
      new URL("../../../public/data/gks-certification-catalog.json", import.meta.url),
      "utf8",
    )) as unknown;

    expect(isCertificationCatalog(runtimeCatalog)).toBe(true);
    expect(runtimeCatalog).toEqual(fallbackCertificationCatalog);
  });

  it("rechaza opciones incompletas o enlaces inseguros", () => {
    expect(isCertificationCatalog({ ...fallbackCertificationCatalog, opportunities: [] })).toBe(false);
    expect(isCertificationCatalog({
      ...fallbackCertificationCatalog,
      opportunities: [{ ...fallbackCertificationCatalog.opportunities[0], url: "http://example.com" }],
    })).toBe(false);
  });

  it("rechaza contenido sin las tres traducciones", () => {
    const first = fallbackCertificationCatalog.opportunities[0];
    expect(isCertificationCatalog({
      ...fallbackCertificationCatalog,
      opportunities: [{
        ...first,
        content: { ...first.content, summary: { es: first.content.summary.es } },
      }],
    })).toBe(false);
  });

  it("rechaza fechas, URLs, modalidades e identificadores que puedan romper la vista", () => {
    const first = fallbackCertificationCatalog.opportunities[0];
    expect(isCertificationCatalog({ ...fallbackCertificationCatalog, updatedAt: "not-a-date" })).toBe(false);
    expect(isCertificationCatalog({ ...fallbackCertificationCatalog, updatedAt: "2026-02-30T12:00:00.000Z" })).toBe(false);
    expect(isCertificationCatalog({ ...fallbackCertificationCatalog, updatedAt: "1" })).toBe(false);
    expect(isCertificationCatalog({
      ...fallbackCertificationCatalog,
      opportunities: [{ ...first, url: "https://" }],
    })).toBe(false);
    expect(isCertificationCatalog({
      ...fallbackCertificationCatalog,
      opportunities: [{ ...first, verifiedAt: "not-a-date" }],
    })).toBe(false);
    expect(isCertificationCatalog({
      ...fallbackCertificationCatalog,
      opportunities: [{ ...first, verifiedAt: "2026-02-30" }],
    })).toBe(false);
    expect(isCertificationCatalog({
      ...fallbackCertificationCatalog,
      opportunities: [{ ...first, modalities: ["in-person", "in-person"] }],
    })).toBe(false);
    expect(isCertificationCatalog({
      ...fallbackCertificationCatalog,
      opportunities: [first, { ...first }],
    })).toBe(false);
  });

  it("limita el tamaño del catálogo dinámico", () => {
    const first = fallbackCertificationCatalog.opportunities[0];
    expect(isCertificationCatalog({
      ...fallbackCertificationCatalog,
      opportunities: Array.from({ length: 101 }, (_, index) => ({ ...first, id: `certificate-${index}` })),
    })).toBe(false);
  });
});
