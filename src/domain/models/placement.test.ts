import { describe, expect, it } from "vitest";
import { isStageUnlocked } from "./language-test";
import { applyPlacement, emptyPlacement, normalizePlacement, placedStages } from "./placement";

describe("level test", () => {
  it("unlocks up to the last checkpoint passed in a row", () => {
    expect(placedStages([])).toBe(0);
    expect(placedStages([false])).toBe(0);
    expect(placedStages([true])).toBe(3);
    expect(placedStages([true, true, false, true])).toBe(6);
    expect(placedStages([true, true, true, true, true])).toBe(18);
  });

  it("never locks what an earlier test unlocked", () => {
    let state = applyPlacement(emptyPlacement, "ko", { reading: 10, grammar: 3 });
    state = applyPlacement(state, "ko", { reading: 3, grammar: 6, vocabulary: 0 });
    expect(state.ko).toEqual({ reading: 10, grammar: 6 });
    expect(state.en).toEqual({});
  });

  it("rejects stored values it could not have produced", () => {
    expect(normalizePlacement({ en: { reading: 6, writing: 9, grammar: -1, vocabulary: 999 }, ko: "x" })).toEqual({ en: { reading: 6 }, ko: {} });
  });

  it("opens placed stages without marking them as passed", () => {
    const stages = Array.from({ length: 8 }, (_, index) => ({ id: `ko-grammar-${index}`, skill: "grammar" as const }));
    expect(isStageUnlocked(stages, 4, {})).toBe(false);
    expect(isStageUnlocked(stages, 4, {}, { grammar: 6 })).toBe(true);
    expect(isStageUnlocked(stages, 5, {}, { grammar: 6 })).toBe(true);
    expect(isStageUnlocked(stages, 6, {}, { grammar: 6 })).toBe(false);
    expect(isStageUnlocked(stages, 6, {}, { reading: 20 })).toBe(false);
  });
});
