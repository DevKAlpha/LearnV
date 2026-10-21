import { afterEach, describe, expect, it, vi } from "vitest";
import { completeRestartLesson, normalizeRestartProgress, restartAnswerIsCorrect, restartLessonIds } from "@/domain/models/learning-restart";
import { restartLessons } from "./learning-restart-lessons";
import { readRestartProgress, restartStorageKey, saveRestartLesson } from "./learning-restart-progress";

const environment = vi.hoisted(() => ({ qa: false }));
vi.mock("@/infrastructure/config/app-scope", () => ({ scopedStorageKey: (key: string) => environment.qa ? `qa:${key}` : key }));
afterEach(() => { environment.qa = false; });

describe.each(["en", "ko"] as const)("story 57 refresher %s", (language) => {
  it("contains three original lessons with valid answers and complete trilingual teaching support", () => {
    const lessons = restartLessons[language];
    expect(lessons.map((lesson) => lesson.id)).toEqual(restartLessonIds);
    for (const lesson of lessons) {
      expect(lesson.example.length).toBeGreaterThan(20);
      expect(lesson.options).toHaveLength(3);
      expect(new Set(lesson.options).size).toBe(3);
      expect(lesson.options[lesson.correctIndex]).toBeTruthy();
      for (const locale of ["es", "en", "ko"] as const) {
        const help = lesson.help[locale];
        expect(help.title.trim().length).toBeGreaterThan(5);
        expect(help.question.trim().length).toBeGreaterThan(10);
        for (const text of [help.lesson, help.feedback, help.transfer]) expect(text.trim().length).toBeGreaterThan(25);
      }
      for (const selected of [null, -1, 0, 1, 2, 3, 0.5, NaN, Infinity])
        expect(restartAnswerIsCorrect(lesson.correctIndex, selected)).toBe(selected === lesson.correctIndex);
    }
  });
  it("completes, replays and restores every lesson without duplicate credit", () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
    for (const id of restartLessonIds) expect(saveRestartLesson(language, id, [], storage).saved).toBe(true);
    expect(readRestartProgress(language, storage)).toEqual(restartLessonIds);
    expect(saveRestartLesson(language, "meaning", [], storage).progress).toEqual(restartLessonIds);
    expect([...values.keys()]).toEqual([restartStorageKey(language)]);
  });
});

it.each([null, {}, "meaning", 7, ["unknown"], [null, {}, 3]].map((input) => [input]))("rejects malformed saved progress %j", (input) => {
  expect(normalizeRestartProgress(input)).toEqual([]);
});
it("canonicalises order, drops obsolete IDs and never mutates its input", () => {
  const input = ["use", "meaning", "meaning", "obsolete"];
  expect(completeRestartLesson(input, "form")).toEqual(restartLessonIds);
  expect(input).toEqual(["use", "meaning", "meaning", "obsolete"]);
});
it("isolates languages, QA and production without touching legacy test evidence", () => {
  const values = new Map<string, string>([["learnv-language-tests-v1", '{"en":{"passed":true}}']]);
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
  saveRestartLesson("en", "meaning", [], storage);
  expect(readRestartProgress("ko", storage)).toEqual([]);
  environment.qa = true;
  expect(restartStorageKey("en")).toBe("qa:learnv-restart-v1:en");
  expect(readRestartProgress("en", storage)).toEqual([]);
  saveRestartLesson("en", "form", [], storage);
  environment.qa = false;
  expect(readRestartProgress("en", storage)).toEqual(["meaning"]);
  expect(values.get("learnv-language-tests-v1")).toBe('{"en":{"passed":true}}');
});
it("merges a stale view and preserves working state when storage is unavailable", () => {
  const values = new Map<string, string>([[restartStorageKey("en"), '["use"]']]);
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
  expect(saveRestartLesson("en", "form", ["meaning"], storage).progress).toEqual(restartLessonIds);
  const denied = { getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("denied"); } };
  expect(readRestartProgress("en", denied)).toEqual([]);
  expect(saveRestartLesson("en", "form", ["meaning"], denied)).toEqual({ saved: false, progress: ["meaning", "form"] });
  expect(readRestartProgress("ko", { getItem: () => "bad JSON" })).toEqual([]);
});
