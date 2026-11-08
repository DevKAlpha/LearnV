import { expect, it } from "vitest";
import { resourceProgressKey, writeResourceProgress } from "./resource-progress";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";

it("preserves historical and unrelated marks while saving or unchecking current resources", () => {
  let stored = "";
  const storage = { setItem: (key: string, value: string) => { expect(key).toBe(resourceProgressKey); stored = value; } };
  const previous = ["gks-forms", "ielts-academic-samples"];
  expect(writeResourceProgress([...previous, "gks-forms-2027"], storage).saved).toBe(true);
  expect(JSON.parse(stored)).toEqual([...previous, "gks-forms-2027"]);
  expect(writeResourceProgress(previous, storage).saved).toBe(true);
  expect(JSON.parse(stored)).toEqual(previous);
  expect(previous).toEqual(["gks-forms", "ielts-academic-samples"]);
  expect(resourceProgressKey).toBe(scopedStorageKey("learnv-resource-progress-v1"));
  expect(scopedStorageKey("learnv-resource-progress-v1", true)).toBe("qa:learnv-resource-progress-v1");
});

it("returns a storage failure so the UI can retain progress in memory and warn the learner", () => {
  const error = new Error("Quota exceeded");
  expect(writeResourceProgress(["gks-forms-2027"], { setItem: () => { throw error; } })).toEqual({ saved: false, error });
});
