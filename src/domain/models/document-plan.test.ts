import { describe, expect, it } from "vitest";
import { documentStages, getDocumentPlan } from "./document-plan";

describe("document preparation path", () => {
  it("groups every document exactly once, from personal drafts to external evidence", () => {
    const ids = documentStages.flatMap((stage) => [...stage.documentIds]);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(["application", "personal-statement", "study-plan", "pledge-health", "graduation", "transcript", "recommendation", "family", "language"].sort());
    expect(documentStages.map((stage) => stage.id)).toEqual(["drafts", "academic", "official", "optional"]);
  });
  it("starts with drafts and ignores duplicate, removed or unknown IDs", () => {
    const plan = getDocumentPlan(["application", "application", "old-id"]);
    expect(plan.completed).toBe(1);
    expect(plan.total).toBe(9);
    expect(plan.currentStage).toBe("drafts");
  });
  it.each([
    [0, "drafts"], [4, "academic"], [7, "official"], [8, "optional"], [9, null],
  ])("selects the earliest unfinished stage after %s completions", (count, expected) => {
    const ids = documentStages.flatMap((stage) => [...stage.documentIds]);
    expect(getDocumentPlan(ids.slice(0, count as number)).currentStage).toBe(expected);
  });
  it("returns to the first pending requirement when a document is unmarked", () => {
    const ids = documentStages.flatMap((stage) => [...stage.documentIds]);
    expect(getDocumentPlan(ids.filter((id) => id !== "study-plan")).currentStage).toBe("drafts");
  });
});
