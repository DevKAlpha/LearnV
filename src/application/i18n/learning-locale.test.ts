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
  });
});
