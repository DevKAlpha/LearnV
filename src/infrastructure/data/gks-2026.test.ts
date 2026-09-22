import { describe, expect, it } from "vitest";
import {
  currentCycle,
  documents,
  gksCertifications,
  keyFacts,
  languageBands,
  sources,
  targetPrograms,
} from "./gks-2026";

describe("datos GKS versionados", () => {
  it("presenta la convocatoria 2027 publicada y vinculada a la guía vigente", () => {
    expect(currentCycle.target).toBe("GKS-U 2027");
    expect(currentCycle.targetStatus.toLowerCase()).toContain("publicada");
    expect(currentCycle.reference).toBe("GKS-U 2027");
    expect(sources.some((source) => source.id === "study-in-korea-2027")).toBe(true);
  });

  it("vincula cada dato clave con una fuente oficial conocida", () => {
    const sourceIds = new Set(sources.map((source) => source.id));

    expect(keyFacts).not.toHaveLength(0);
    keyFacts.forEach((fact) => {
      expect(fact.status).toBe("historical");
      expect(sourceIds.has(fact.sourceId)).toBe(true);
    });
  });

  it("incluye las rutas de preparación solicitadas", () => {
    expect(targetPrograms).toHaveLength(4);
    expect(targetPrograms.filter((program) => program.category === "business")).toHaveLength(2);
    expect(targetPrograms.filter((program) => program.category === "health")).toHaveLength(2);
    expect(documents.some((document) => document.needsApostille)).toBe(true);
    expect(languageBands.topik.some((band) => band.score === "Nivel 1–2")).toBe(true);
    expect(languageBands.topik.some((band) => band.score === "Nivel 3")).toBe(true);
    expect(languageBands.english.some((band) => band.score === "B1 / B2")).toBe(true);
    expect(languageBands.english.some((band) => band.score === "C1")).toBe(true);
  });

  it("incluye los canales oficiales del radar diario", () => {
    const sourceIds = new Set(sources.map((source) => source.id));

    expect(sourceIds).toContain("study-in-korea-notices");
    expect(sourceIds).toContain("niied-2027");
    expect(sourceIds).toContain("spain-embassy-notices");
  });

  it("prioriza certificados aceptados y conserva sus bandas 2027", () => {
    const topik = gksCertifications.find((certificate) => certificate.id === "topik");
    const toefl = gksCertifications.find((certificate) => certificate.id === "toefl");
    const ielts = gksCertifications.find((certificate) => certificate.id === "ielts");

    expect(topik?.priority).toBe("highest");
    expect(topik?.scoreBands[0]).toEqual({ score: "TOPIK 5–6", weight: "100% + 5%" });
    expect(toefl?.scoreBands.some((band) => band.score === "44+ / 3.0+")).toBe(true);
    expect(ielts?.scoreBands.some((band) => band.score === "IELTS 8.0+" && band.weight === "90%")).toBe(true);
  });

  it("vincula cada certificación con una fuente conocida", () => {
    const sourceIds = new Set(sources.map((source) => source.id));
    gksCertifications.forEach((certificate) => expect(sourceIds.has(certificate.sourceId)).toBe(true));
  });
});
