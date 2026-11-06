import { describe, expect, it } from "vitest";
import { normalizeScholarshipPreparation, scholarshipLifeIds } from "@/domain/models/scholarship-life";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";
import { scholarshipLifeCases, scholarshipLifeSources, scholarshipStages, scholarshipLifeReviewedAt } from "./scholarship-life";
import { readScholarshipPreparation, saveScholarshipPreparation, scholarshipPreparationKey } from "./scholarship-life-preparation";

it("covers the full lifecycle, with actionable sources on every situation", () => {
  expect(scholarshipLifeCases.map((item) => item.id)).toEqual([...scholarshipLifeIds]);
  expect(new Set(scholarshipStages.map((stage) => stage.id)).size).toBe(5);
  for (const stage of scholarshipStages) expect(scholarshipLifeCases.filter((item) => item.stage === stage.id).length).toBeGreaterThanOrEqual(2);
  for (const item of scholarshipLifeCases) {
    expect(scholarshipStages.some((stage) => stage.id === item.stage)).toBe(true);
    expect(item.actions).toHaveLength(3);
    expect(item.references.length).toBeGreaterThan(0);
    for (const reference of item.references) {
      expect(scholarshipLifeSources[reference.source]).toBeDefined();
      expect(reference.section.length).toBeGreaterThan(3);
    }
  }
});
it("uses official publishers and distinguishes the recipient revision from the admission cycle", () => {
  expect(scholarshipLifeReviewedAt).toBe("2026-11-05");
  expect(scholarshipLifeSources.regulations.title).toContain("2026-03-01");
  expect(scholarshipLifeSources.cycle.title).toContain("2027");
  for (const source of Object.values(scholarshipLifeSources)) {
    const url = new URL(source.url);
    expect(url.protocol).toBe("https:");
    expect(["www.kmou.ac.kr", "www.studyinkorea.go.kr"]).toContain(url.hostname);
  }
});
describe.each(["es", "en", "ko"] as const)("scholarship life content in %s", (locale) => {
  it("provides a rule, three steps, recovery route, responsible office and enquiry for every case", () => {
    for (const item of scholarshipLifeCases) {
      for (const value of [item.title, item.situation, item.rule, ...item.actions, item.recovery, item.contact, item.question]) expect(value[locale].trim().length).toBeGreaterThan(7);
    }
    for (const stage of scholarshipStages) expect(stage.habit[locale].length).toBeGreaterThan(15);
    for (const source of Object.values(scholarshipLifeSources)) expect(source.note[locale].length).toBeGreaterThan(15);
  });
});
it.each([null, {}, "travel", 42, true])("rejects malformed preparation data: %j", (value) => {
  expect(normalizeScholarshipPreparation(value)).toEqual([]);
});
it("deduplicates and filters unknown IDs without persisting arbitrary personal input", () => {
  const data = ["travel", "name:someone", "residence", "travel", { health: "private" }];
  expect(normalizeScholarshipPreparation(data)).toEqual(["residence", "travel"]);
  expect(data).toHaveLength(5);
});
it("handles unavailable, malformed and denied storage without blocking the guide", () => {
  expect(readScholarshipPreparation({ getItem: () => "[" })).toEqual([]);
  expect(readScholarshipPreparation({ getItem: () => '{"residence":true}' })).toEqual([]);
  expect(readScholarshipPreparation({ getItem: () => { throw new Error("blocked"); } })).toEqual([]);
  expect(saveScholarshipPreparation(["travel"], { setItem: () => { throw new Error("blocked"); } })).toBe(false);
});
it("round-trips preparation, supports unchecking and isolates QA", () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  expect(saveScholarshipPreparation(["travel", "residence"], storage)).toBe(true);
  expect(readScholarshipPreparation(storage)).toEqual(["residence", "travel"]);
  saveScholarshipPreparation(["travel"], storage);
  expect(readScholarshipPreparation(storage)).toEqual(["travel"]);
  saveScholarshipPreparation([], storage);
  expect(readScholarshipPreparation(storage)).toEqual([]);
  expect([...values.keys()]).toEqual([scholarshipPreparationKey]);
  expect(scholarshipPreparationKey).toBe(scopedStorageKey("learnv-scholarship-life-v1"));
  expect(scopedStorageKey("learnv-scholarship-life-v1", true)).toBe("qa:learnv-scholarship-life-v1");
});
