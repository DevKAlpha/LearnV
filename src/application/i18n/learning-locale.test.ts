import { describe, expect, it } from "vitest";
import { isImmersiveLearningRoute, resolveLearningLocale } from "./learning-locale";

describe("learning locale routing", () => {
  it("selects English throughout the English learning journey", () => {
    expect(resolveLearningLocale("/study/english")).toBe("en");
    expect(resolveLearningLocale("/tests/en")).toBe("en");
    expect(resolveLearningLocale("/tests/en/writing-01")).toBe("en");
  });

  it("selects Korean throughout the Korean learning journey", () => {
    expect(resolveLearningLocale("/study/korean")).toBe("ko");
    expect(resolveLearningLocale("/tests/ko")).toBe("ko");
    expect(resolveLearningLocale("/tests/ko/listening-01")).toBe("ko");
  });

  it("keeps the language selector outside language-specific learning", () => {
    expect(resolveLearningLocale("/study")).toBeNull();
    expect(resolveLearningLocale("/study/interviews")).toBeNull();
    expect(isImmersiveLearningRoute("/study")).toBe(false);
    expect(isImmersiveLearningRoute("/study/english")).toBe(true);
    expect(isImmersiveLearningRoute("/tests/en")).toBe(true);
    expect(isImmersiveLearningRoute("/study/korean")).toBe(true);
    expect(isImmersiveLearningRoute("/tests/ko/listening-01")).toBe(true);
  });
});

describe("immersion preference", async () => {
  const { interfaceLocaleFor, normalizeImmersion, DEFAULT_IMMERSION } = await import("./immersion");
  it("keeps Korean instructions in the learner's language by default", () => {
    expect(interfaceLocaleFor("ko", DEFAULT_IMMERSION)).toBeNull();
    expect(interfaceLocaleFor("en", DEFAULT_IMMERSION)).toBe("en");
  });
  it("switches the whole interface only when full immersion is chosen", () => {
    expect(interfaceLocaleFor("ko", { en: "guided", ko: "full" })).toBe("ko");
    expect(interfaceLocaleFor("en", { en: "guided", ko: "full" })).toBeNull();
    expect(interfaceLocaleFor(null, DEFAULT_IMMERSION)).toBeNull();
  });
  it("repairs stored preferences", () => {
    expect(normalizeImmersion({ en: "nope", ko: "full" })).toEqual({ en: "full", ko: "full" });
    expect(normalizeImmersion(null)).toEqual(DEFAULT_IMMERSION);
  });
});
