import { describe, expect, it } from "vitest";
import {
  currentCycle,
  documents,
  keyFacts,
  languageBands,
  sources,
  targetPrograms,
} from "./gks-2026";

describe("datos GKS versionados", () => {
  it("no presenta la convocatoria 2027 como publicada", () => {
    expect(currentCycle.target).toBe("GKS-U 2027");
    expect(currentCycle.targetStatus.toLowerCase()).toContain("no publicada");
    expect(currentCycle.reference).toBe("GKS-U 2026");
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
    expect(languageBands.topik.some((band) => band.label === "Nivel 5–6")).toBe(true);
    expect(languageBands.english.some((band) => band.note.includes("C1"))).toBe(true);
  });
});
