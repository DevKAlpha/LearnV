import { describe, expect, it } from "vitest";
import { filterReadings, type ReadingResource } from "./reading-library";

const resources: ReadingResource[] = [
  { id: "en", language: "en", category: "health", title: "Anatomy and Physiology", author: "Rice University", url: "https://example.org/read", sourceUrl: "https://example.org/read", kind: "book", level: "intermediate", verifiedAt: "2026-10-29" },
  { id: "ko", language: "ko", category: "data", title: "데이터와 행렬", author: "김도형", url: "https://example.org/ko", sourceUrl: "https://example.org/ko", kind: "reading", level: "intermediate", verifiedAt: "2026-10-29" },
];
describe("reading library discovery", () => {
  it("separates material language independently of interface language", () => {
    expect(filterReadings(resources, "en", "all", "").map((item) => item.id)).toEqual(["en"]);
    expect(filterReadings(resources, "ko", "all", "").map((item) => item.id)).toEqual(["ko"]);
  });
  it("combines topic and all search words across title and author", () => {
    expect(filterReadings(resources, "en", "health", "  ANATOMY rice ")).toHaveLength(1);
    expect(filterReadings(resources, "en", "data", "anatomy")).toHaveLength(0);
    expect(filterReadings(resources, "en", "all", "anatomy missing")).toHaveLength(0);
  });
  it("matches the user's translated topic names", () => {
    expect(filterReadings(resources, "en", "all", "salud", { gks: "Beca", health: "Ciencias de la salud", business: "Negocios", data: "Datos", writing: "Escritura", language: "Idiomas" })).toHaveLength(1);
  });
  it("normalises decomposed Korean search without altering the catalogue", () => {
    const before = JSON.stringify(resources);
    expect(filterReadings(resources, "ko", "all", "데이터".normalize("NFD"))).toHaveLength(1);
    expect(JSON.stringify(resources)).toBe(before);
  });
});
