import { describe, expect, it } from "vitest";
import type { Locale } from "../../domain/models/i18n";
import { learningResources, type MaterialLanguage, type ResourceTrack, type ResourceType } from "./learning-resources";

const locales: Locale[] = ["es", "en", "ko"];
const tracks: ResourceTrack[] = ["gks", "en", "ko"];
const types: ResourceType[] = ["document", "book", "test", "video"];
const materialLanguages: MaterialLanguage[] = ["en", "ko"];

describe("learning resources", () => {
  it("covers GKS, English and Korean preparation", () => {
    tracks.forEach((track) => {
      expect(learningResources.some((resource) => resource.track === track)).toBe(true);
    });
  });

  it("offers every supported material type", () => {
    types.forEach((type) => {
      expect(learningResources.some((resource) => resource.type === type)).toBe(true);
    });
    expect(learningResources.some((resource) => (resource.type as string) === "advice")).toBe(false);
  });

  it("allows material to be selected for English or Korean", () => {
    materialLanguages.forEach((language) => {
      expect(learningResources.some((resource) => resource.languages.includes(language))).toBe(true);
    });

    learningResources.forEach((resource) => {
      expect(resource.languages.length).toBeGreaterThan(0);
      expect(resource.languages.every((language) => materialLanguages.includes(language))).toBe(true);
    });
  });

  it("has complete translations and secure verified links", () => {
    learningResources.forEach((resource) => {
      locales.forEach((locale) => {
        expect(resource.title[locale].trim()).not.toBe("");
        expect(resource.description[locale].trim()).not.toBe("");
        expect(resource.level[locale].trim()).not.toBe("");
      });

      expect(resource.url).toMatch(/^https:\/\//);
      expect(resource.official).toBe(true);
      expect(resource.verifiedAt).toMatch(/^2026-08-(18|19)$/);
    });
  });

  it("uses unique stable identifiers", () => {
    const ids = learningResources.map((resource) => resource.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("starts the Korean route at TOPIK I before TOPIK II bridge material", () => {
    const koreanResources = learningResources
      .filter((resource) => resource.track === "ko")
      .sort((first, second) => (first.learningOrder ?? 100) - (second.learningOrder ?? 100));

    expect(koreanResources[0].level.es).toContain("TOPIK I");
    expect(koreanResources.find((resource) => resource.id === "topik-basic-public-test")?.learningOrder).toBe(2);
    expect(koreanResources.find((resource) => resource.id === "topik-writing-rubric")?.learningOrder).toBeGreaterThan(2);
  });
});
