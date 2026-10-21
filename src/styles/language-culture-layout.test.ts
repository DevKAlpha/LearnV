import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("cultural items in narrow viewports", () => {
  it("bounds the page minimum by the available width, including a scrollbar", () => {
    const base = readFileSync(new URL("./app.css", import.meta.url), "utf8");
    const culture = readFileSync(new URL("./language-culture.css", import.meta.url), "utf8");
    expect(base).toContain("min-width: min(320px, 100%)");
    expect(base).not.toContain("min-width: 320px;");
    expect(culture).toContain("width: 100%");
    expect(culture).toContain("height: auto");
    expect(culture).toContain("@media (max-width: 380px)");
    expect(culture).toContain("minmax(0,1fr) 80px");
  });
});
