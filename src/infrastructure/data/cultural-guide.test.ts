import { describe, expect, it } from "vitest";
import { cultureCaseIds, normalizeCulturePreparation } from "@/domain/models/cultural-guide";
import { cultureCases, cultureSources, cultureStories } from "./cultural-guide";
import { readCulturePreparation, saveCulturePreparation, culturePreparationKey } from "./cultural-preparation";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";

it("covers all eight situations with traceable sources, without inventing a story for every case", () => {
  expect(cultureCases.map((item) => item.id)).toEqual([...cultureCaseIds]);
  expect(new Set(cultureSources.map((item) => item.id)).size).toBe(cultureSources.length);
  expect(new Set(cultureSources.map((item) => item.url)).size).toBe(cultureSources.length);
  for (const item of cultureCases) {
    expect(item.sourceIds.length).toBeGreaterThan(0);
    for (const id of item.sourceIds) expect(cultureSources.some((source) => source.id === id)).toBe(true);
    if (item.storyId) expect(cultureStories.some((story) => story.id === item.storyId)).toBe(true);
    expect(item.phrase.ko).toMatch(/[가-힣]/);
    expect([0, 1]).toContain(item.practice.correct);
    expect(item.practice.options[0].es).not.toBe(item.practice.options[1].es);
  }
});

it("distinguishes three named real testimonies from official practical guidance", () => {
  expect(cultureStories.map((story) => story.person)).toEqual(["Sara García", "Alba Vilanova", "Hema"]);
  for (const story of cultureStories) expect(cultureSources.find((source) => source.id === story.sourceId)?.kind).toBe("testimony");
  for (const id of ["spain", "work", "living", "etiquette"]) expect(cultureSources.find((source) => source.id === id)?.kind).toBe("official");
  expect(cultureSources.find((source) => source.id === "alba")!.context.es).toContain("2017");
  expect(cultureSources.find((source) => source.id === "hema")!.context.es).toContain("no española");
  for (const source of cultureSources) {
    expect(new URL(source.url).protocol).toBe("https:");
    expect(source.checkedAt).toBe("2026-10-30");
  }
});

describe.each(["es", "en", "ko"] as const)("culture content in %s", (locale) => {
  it("provides actionable comparisons, Korean phrase meanings and explained practice", () => {
    for (const item of cultureCases) {
      for (const value of [item.title, item.spain, item.korea, ...item.actions, item.phrase.meaning, item.preparation, item.practice.prompt, ...item.practice.options, item.practice.explanation]) expect(value[locale].trim().length).toBeGreaterThan(3);
    }
    for (const story of cultureStories) expect(story.summary[locale].length).toBeGreaterThan(30);
    for (const source of cultureSources) expect(source.context[locale].length).toBeGreaterThan(15);
  });
});

it.each([null, {}, "housing", 42, true])("rejects malformed preparation values: %j", (value) => {
  expect(normalizeCulturePreparation(value)).toEqual([]);
});
it("deduplicates and filters stored IDs without mutating the supplied value", () => {
  const value = ["health", "unknown", "greetings", "health", 7];
  expect(normalizeCulturePreparation(value)).toEqual(["greetings", "health"]);
  expect(value).toEqual(["health", "unknown", "greetings", "health", 7]);
});
it("recovers corrupt JSON or unavailable storage", () => {
  expect(readCulturePreparation({ getItem: () => "{broken" })).toEqual([]);
  expect(readCulturePreparation({ getItem: () => { throw new Error("blocked"); } })).toEqual([]);
  expect(saveCulturePreparation(["health"], { setItem: () => { throw new Error("blocked"); } })).toBe(false);
});
it("stores only preparation IDs in an isolated key and supports removing a check", () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  expect(saveCulturePreparation(["housing", "health"], storage)).toBe(true);
  expect(readCulturePreparation(storage)).toEqual(["housing", "health"]);
  saveCulturePreparation(["health"], storage);
  expect(readCulturePreparation(storage)).toEqual(["health"]);
  expect([...values.keys()]).toEqual([culturePreparationKey]);
  expect(culturePreparationKey).toBe(scopedStorageKey("learnv-culture-preparation-v1"));
  expect(scopedStorageKey("learnv-culture-preparation-v1", true)).toBe("qa:learnv-culture-preparation-v1");
});
