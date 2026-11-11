import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// Facts about Hangul that must never regress in authored content.
const files = ["learning-restart-lessons.ts", "foundation-practice-tests.ts", "extension-practice-tests.ts", "practice-tests.ts"]
  .map((name) => readFileSync(new URL(`./${name}`, import.meta.url), "utf8"));

describe("Korean content accuracy", () => {
  it("states that 학생 ends in the final consonant ㅇ, never ㄱ", () => {
    for (const source of files) {
      expect(source).not.toMatch(/학생[^.。\n]{0,40}ㄱ\s*받침/);
      expect(source).not.toMatch(/학생 (?:has|tiene)[^.\n]{0,30}ㄱ/);
    }
    expect(files[0]).toMatch(/학생은 ㅇ 받침/);
  });
});
