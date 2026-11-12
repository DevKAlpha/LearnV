import { describe, expect, it } from "vitest";
import { isSyllable } from "@/domain/models/hangul";
import { analyzeWriting } from "@/domain/models/writing-feedback";
import { reviewDeck } from "./review-deck-cards";
import { writingLabTasks } from "./writing-lab-tasks";

describe("review deck content", () => {
  it("has permanent, unique ids and both languages", () => {
    const ids = reviewDeck.map((card) => card.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^(en|ko):[vcod]:/u);
    expect(reviewDeck.filter((card) => card.language === "ko").length).toBeGreaterThanOrEqual(40);
    expect(reviewDeck.filter((card) => card.language === "en").length).toBeGreaterThanOrEqual(40);
  });

  it("gives every card a meaning, and every exercise what it needs", () => {
    for (const card of reviewDeck) {
      expect(card.meaning.es && card.meaning.en, card.id).toBeTruthy();
      if (card.exercise === "cloze") {
        expect(card.prompt.split("___"), card.id).toHaveLength(2);
        expect(card.audio, card.id).toBe(card.prompt.replace("___", card.answer));
      }
      if (card.exercise === "order") {
        expect(card.tokens!.length, card.id).toBeGreaterThanOrEqual(3);
        expect(card.answer).toBe(card.tokens!.join(" "));
      }
      if (card.exercise === "dictation") expect(card.prompt, card.id).toBe("");
      if (card.language === "ko" && card.exercise === "recall") expect([...card.prompt].every((char) => isSyllable(char)), card.id).toBe(true);
    }
  });

  it("explains every grammar and word-order card", () => {
    for (const card of reviewDeck.filter((item) => item.group === "grammar" || item.group === "word-order")) {
      expect(card.note.es && card.note.en, card.id).toBeTruthy();
    }
  });
});

describe("writing lab tasks", () => {
  it("covers TOPIK II 51–54 and IELTS Task 1–2 with coherent limits", () => {
    expect(writingLabTasks.map((task) => task.format).sort()).toEqual(["ielts-task1", "ielts-task2", "topik-51", "topik-52", "topik-53", "topik-54"]);
    for (const task of writingLabTasks) {
      expect(task.minimum).toBeLessThan(task.maximum);
      expect(task.outline.length).toBeGreaterThan(0);
      expect(task.id).toMatch(/^[a-z0-9-]{1,60}$/u);
      if (task.chart) for (const series of task.chart.series) expect(series.values).toHaveLength(task.chart.categories.length);
    }
  });

  it("gives the short-answer models a clean review", () => {
    for (const task of writingLabTasks.filter((item) => item.model)) {
      const analysis = analyzeWriting(task.model!, { language: task.language, format: task.format, minimum: task.minimum, maximum: task.maximum });
      expect(analysis.checks.filter((check) => check.status !== "ok"), task.id).toEqual([]);
    }
  });
});
