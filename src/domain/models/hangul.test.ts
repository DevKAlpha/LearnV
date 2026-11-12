import { describe, expect, it } from "vitest";
import { compose, decompose, finalSound, hasFinal, readingQuiz, romanize } from "./hangul";
import { seededRandom } from "./random";

describe("Hangul blocks", () => {
  it("composes and decomposes syllables", () => {
    expect(compose("ㅎ", "ㅏ", "ㄴ")).toBe("한");
    expect(compose("ㄱ", "ㅡ", "ㄹ")).toBe("글");
    expect(compose("ㅇ", "ㅏ")).toBe("아");
    expect(compose("x", "ㅏ")).toBeNull();
    expect(decompose("닭")).toEqual({ initial: "ㄷ", vowel: "ㅏ", final: "ㄺ" });
    expect(decompose("a")).toBeNull();
  });

  it("romanizes letter by letter", () => {
    expect(romanize("한국어")).toBe("hangukeo");
    expect(romanize("서울")).toBe("seoul");
    expect(romanize("학생 OK")).toBe("haksaeng OK");
  });

  it("names the seven final sounds", () => {
    expect(finalSound("학")).toBe("ㄱ");
    expect(finalSound("생")).toBe("ㅇ");
    expect(finalSound("옷")).toBe("ㄷ");
    expect(finalSound("꽃")).toBe("ㄷ");
    expect(finalSound("앞")).toBe("ㅂ");
    expect(finalSound("닭")).toBe("ㄱ");
    expect(hasFinal("가")).toBe(false);
  });

  it("builds reproducible quizzes with one correct reading", () => {
    const pool = ["가", "나", "한", "글", "학", "생", "밥", "물"];
    const first = readingQuiz(pool, 5, seededRandom(7));
    expect(readingQuiz(pool, 5, seededRandom(7))).toEqual(first);
    for (const question of first) {
      expect(question.options[question.correctIndex]).toBe(romanize(question.syllable));
      expect(new Set(question.options).size).toBe(question.options.length);
      expect(question.options.length).toBeGreaterThanOrEqual(3);
    }
  });
});
