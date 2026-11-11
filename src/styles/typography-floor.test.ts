import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Readability floor: no text below 12px (0.75rem) anywhere, on mobile included.
const dir = new URL("./", import.meta.url);
const sheets = readdirSync(dir).filter((file) => file.endsWith(".css")).map((file) => [file, readFileSync(new URL(file, dir), "utf8")] as const);

describe("typography floor", () => {
  it("never sets a font size below 12px", () => {
    const tooSmall = sheets.flatMap(([file, css]) => [
      ...[...css.matchAll(/font-size:\s*(0?\.\d+)rem/g)].filter((match) => parseFloat(match[1]!) < 0.75).map((match) => `${file}: ${match[0]}`),
      ...[...css.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)].filter((match) => parseFloat(match[1]!) < 12).map((match) => `${file}: ${match[0]}`),
    ]);
    expect(tooSmall).toEqual([]);
  });
});
