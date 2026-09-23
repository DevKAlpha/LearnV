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
});
