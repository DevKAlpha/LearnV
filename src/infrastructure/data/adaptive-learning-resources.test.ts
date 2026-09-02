import { describe, expect, it } from "vitest";
import { adaptiveLearningResources } from "./adaptive-learning-resources";

describe("adaptive learning resource catalog", () => {
  it("uses unique HTTPS sources with complete multilingual learning tasks", () => {
    expect(new Set(adaptiveLearningResources.map((resource) => resource.id)).size).toBe(adaptiveLearningResources.length);
    for (const resource of adaptiveLearningResources) {
      expect(resource.url).toMatch(/^https:\/\//);
      expect(resource.skills.length).toBeGreaterThan(0);
      expect(resource.estimatedMinutes).toBeGreaterThan(0);
      for (const locale of ["es", "en", "ko"] as const) {
        expect(resource.title[locale].trim().length).toBeGreaterThan(5);
        expect(resource.description[locale].trim().length).toBeGreaterThan(15);
        expect(resource.activity[locale].trim().length).toBeGreaterThan(15);
      }
    }
  });

  it("covers every path and the requested material variety", () => {
    for (const language of ["en", "ko", "general"] as const) {
      expect(adaptiveLearningResources.filter((resource) => resource.languages.includes(language)).length).toBeGreaterThanOrEqual(3);
    }
    const formats = new Set(adaptiveLearningResources.map((resource) => resource.format));
    expect(formats).toEqual(new Set(["series", "music", "document", "course", "practice"]));
  });
});
