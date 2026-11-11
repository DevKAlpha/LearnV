import { describe, expect, it } from "vitest";
import { appRelativePath } from "./app-scope";

describe("appRelativePath", () => {
  it("strips the GitHub Pages base so route rules match", () => {
    expect(appRelativePath("/LearnV/study/english", "/LearnV/")).toBe("/study/english");
    expect(appRelativePath("/LearnV/", "/LearnV/")).toBe("/");
    expect(appRelativePath("/LearnV", "/LearnV/")).toBe("/");
    expect(appRelativePath("/LearnV/qa/tests/ko/1", "/LearnV/qa/")).toBe("/tests/ko/1");
  });

  it("leaves root deployments and foreign paths untouched", () => {
    expect(appRelativePath("/study", "/")).toBe("/study");
    expect(appRelativePath("/other/study", "/LearnV/")).toBe("/other/study");
  });
});
