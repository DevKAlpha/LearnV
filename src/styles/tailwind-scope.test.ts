import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(new URL(`./${name}`, import.meta.url), "utf8");
/** Every Tailwind entry: the startup sheet and the lazily loaded study sheet. */
const entries = { "tailwind.css": read("tailwind.css"), "tailwind-study.css": read("tailwind-study.css") };
const theme = read("tailwind-theme.css");

describe("tailwind adoption guard", () => {
  for (const [name, css] of Object.entries(entries)) {
    it(`${name} only scans files that were explicitly migrated`, () => {
      expect(css).toMatch(/utilities\.css" layer\(utilities\) source\(none\)/);
      expect(css).not.toMatch(/tailwindcss\/preflight|@import "tailwindcss";/);
      for (const [, path] of css.matchAll(/@source "([^"]+)"/g)) expect(path).toMatch(/\.tsx$/);
    });

    it(`${name} keeps base element rules below utilities and shares the theme mapping`, () => {
      expect(css).toMatch(/@layer theme, base, utilities;/);
      expect(css).toContain('@import "./tailwind-theme.css";');
    });
  }

  it("never scans the same component from two sheets", () => {
    const sources = Object.values(entries).flatMap((css) => [...css.matchAll(/@source "([^"]+)"/g)].map((match) => match[1]));
    expect(new Set(sources).size).toBe(sources.length);
  });
});

describe("tailwind theme mapping", () => {
  it("never maps a --color-* theme variable onto itself", () => {
    const mappings = [...theme.matchAll(/(--[\w-]+):\s*var\((--[\w-]+)\)/g)];
    expect(mappings.length).toBeGreaterThan(5);
    for (const [, name, value] of mappings) expect(value).not.toBe(name);
  });
});
