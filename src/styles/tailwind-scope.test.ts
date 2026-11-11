import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./tailwind.css", import.meta.url), "utf8");

describe("tailwind adoption guard", () => {
  it("only scans files that were explicitly migrated", () => {
    expect(css).toMatch(/utilities\.css" layer\(utilities\) source\(none\)/);
    expect(css).not.toMatch(/tailwindcss\/preflight|@import "tailwindcss";/);
    for (const [, path] of css.matchAll(/@source "([^"]+)"/g)) expect(path).toMatch(/\.tsx$/);
  });

  it("keeps base element rules below utilities", () => {
    expect(css).toMatch(/@layer theme, base, utilities;/);
  });
});
