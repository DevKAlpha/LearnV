import { describe, expect, it } from "vitest";
import { fallbackCertificationCatalog } from "./gks-certification-opportunities";

describe("catálogo dinámico de certificaciones", () => {
  it("incluye opciones gratuitas y de pago", () => {
    const costs = new Set(fallbackCertificationCatalog.opportunities.map((option) => option.cost));

    expect(costs).toContain("free");
    expect(costs).toContain("paid");
    expect(costs).toContain("conditional");
  });

  it("incluye modalidades virtuales y presenciales", () => {
    const modalities = new Set(fallbackCertificationCatalog.opportunities.flatMap((option) => option.modalities));

    expect(modalities).toContain("online");
    expect(modalities).toContain("in-person");
  });

  it("separa las opciones que puntúan de las complementarias", () => {
    const scoringIds = fallbackCertificationCatalog.opportunities
      .filter((option) => option.gksUse === "scoring")
      .map((option) => option.id);

    expect(scoringIds).toEqual(["topik-official", "toefl-ibt", "ielts-academic"]);
    expect(fallbackCertificationCatalog.opportunities.find((option) => option.id === "ef-set")?.gksUse).toBe("diagnostic");
    expect(fallbackCertificationCatalog.opportunities.find((option) => option.id === "online-ksi")?.gksUse).toBe("supporting");
  });

  it("ofrece una alternativa presencial situada en Santander", () => {
    const santander = fallbackCertificationCatalog.opportunities.find((option) => option.id === "eoi-santander-english");

    expect(santander?.modalities).toEqual(["in-person"]);
    expect(santander?.content.summary.es).toContain("Santander");
  });

  it("mantiene enlaces seguros y textos para los tres idiomas", () => {
    fallbackCertificationCatalog.opportunities.forEach((option) => {
      expect(option.url).toMatch(/^https:\/\//);
      expect(Object.keys(option.content.summary).sort()).toEqual(["en", "es", "ko"]);
      expect(option.content.caution.es.length).toBeGreaterThan(20);
    });
  });
});
